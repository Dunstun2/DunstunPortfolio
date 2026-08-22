/**
 * CV Import Controller
 * 
 * Handles Document upload, AI parsing, preview, and importing to portfolio
 */

const aiDocumentParserService = require('../services/aiDocumentParser.service');
const { Hero, About, AboutHighlight, AboutValue, AboutIdentityCard, AboutExploration } = require('../models');
const { Skill, Experience, Education, Certification, Achievement, Testimonial } = require('../models');
const { Project, SocialAccount, Setting } = require('../models');
const CVImport = require('../models/CVImport');
const cvParserService = require('../services/cvParser.service');
const similarity = require('../../../utils/similarityEngine');
const fs = require('fs').promises;
const path = require('path');

class CVImportController {
  constructor() {
    this.uploadAndParse = this.uploadAndParse.bind(this);
    this.getPreview = this.getPreview.bind(this);
    this.importToPortfolio = this.importToPortfolio.bind(this);
    this.getImportHistory = this.getImportHistory.bind(this);
    this.deleteImport = this.deleteImport.bind(this);
    this._annotateDuplicates = this._annotateDuplicates.bind(this);
  }

  /**
   * Upload and parse Document with AI
   * POST /api/cv/upload
   */
  async uploadAndParse(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please upload a document (PDF, DOCX, or TXT).',
        });
      }

      const file = req.file;
      const filePath = file.path;
      const fileType = file.mimetype;
      const documentType = req.body.documentType || 'auto'; // Accept documentType from frontend

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];

      if (!allowedTypes.includes(fileType) &&
        !filePath.endsWith('.pdf') &&
        !filePath.endsWith('.docx') &&
        !filePath.endsWith('.txt')) {
        // Clean up uploaded file
        await fs.unlink(filePath).catch(() => { });

        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Please upload PDF, DOCX, or TXT files only.',
        });
      }

      // 1. Extract text locally first (for text-based PDFs, DOCX, TXT)
      let extractedText = '';
      try {
        extractedText = await cvParserService.extractText(filePath, fileType);
      } catch (err) {
        console.warn('Local text extraction failed, relying purely on Gemini binary OCR:', err.message);
      }

      // Get the raw buffer to pass to Gemini (it supports native PDF OCR)
      let fileBuffer;
      if (filePath.startsWith('http')) {
        const response = await fetch(filePath);
        fileBuffer = Buffer.from(await response.arrayBuffer());
      } else {
        fileBuffer = await fs.readFile(filePath);
      }

      const fileData = {
        mimeType: fileType,
        data: fileBuffer.toString('base64')
      };

      // 2. Pass to AI for structured parsing and mapping.
      const aiParsedData = await aiDocumentParserService.parseDocument(extractedText, documentType, fileData);

      // Check database to tag existing/duplicate items
      await this._annotateDuplicates(aiParsedData);

      console.log('--- [DEBUG] AI PARSED DATA ---');
      console.log(JSON.stringify(aiParsedData, null, 2));
      console.log('------------------------------');

      // 3. Save import record
      const cvImport = await CVImport.create({
        fileName: file.originalname,
        fileSize: file.size,
        fileType: fileType,
        filePath: filePath,
        extractedText: '',
        parsedData: null,
        mappedData: aiParsedData,
        enhancedData: null,
        status: 'parsed',
        importedBy: req.user?.id || null,
        metadata: {
          documentType: aiParsedData.documentType,
          summary: aiParsedData.summary,
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Document uploaded and parsed successfully by AI',
        data: {
          importId: cvImport.id,
          fileName: file.originalname,
          documentType: aiParsedData.documentType,
          summary: aiParsedData.summary,
          mappedData: aiParsedData,
        },
      });
    } catch (error) {
      console.error('Error uploading and parsing document:', error);

      // Clean up file on error
      if (req.file?.path) {
        await fs.unlink(req.file.path).catch(() => { });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to process document',
        error: error.message,
      });
    }
  }

  /**
   * Get parsed document preview
   * GET /api/cv/preview/:importId
   */
  async getPreview(req, res) {
    try {
      const { importId } = req.params;

      const cvImport = await CVImport.findByPk(importId);

      if (!cvImport) {
        return res.status(404).json({
          success: false,
          message: 'Document import not found',
        });
      }

      if (cvImport.mappedData) {
        await this._annotateDuplicates(cvImport.mappedData);
      }

      return res.status(200).json({
        success: true,
        data: {
          id: cvImport.id,
          fileName: cvImport.fileName,
          status: cvImport.status,
          mappedData: cvImport.mappedData,
          createdAt: cvImport.createdAt,
        },
      });
    } catch (error) {
      console.error('Error fetching document preview:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch document preview',
        error: error.message,
      });
    }
  }

  /**
   * Import parsed data to portfolio
   * POST /api/cv/import/:importId
   */
  async importToPortfolio(req, res) {
    try {
      const { importId } = req.params;
      const { sections = [] } = req.body; 

      const cvImport = await CVImport.findByPk(importId);

      if (!cvImport) {
        return res.status(404).json({
          success: false,
          message: 'Document import not found',
        });
      }

      if (cvImport.status === 'imported') {
        return res.status(400).json({
          success: false,
          message: 'This document has already been imported',
        });
      }

      const dataToImport = cvImport.mappedData?.data;
      if (!dataToImport) {
        return res.status(400).json({
          success: false,
          message: 'No data to import',
        });
      }
      
      const importAll = sections.length === 0 || sections.includes('all');

      const results = {
        skills: [],
        experience: [],
        education: [],
        certifications: [],
        achievements: [],
        projects: [],
        testimonials: [],
        social: [],
      };

      // Import Skills
      if ((importAll || sections.includes('skills')) && dataToImport.skills) {
        const dbSkills = await Skill.findAll();
        for (const skillData of dataToImport.skills) {
          try {
            const skillName = skillData.name || skillData.skill_name || (typeof skillData === 'string' ? skillData : null);
            if (!skillName) continue;

            const existing = similarity.findSkillMatch(dbSkills, skillName);
            if (existing) {
              await existing.update(skillData);
              results.skills.push(existing);
            } else {
              const skill = await Skill.create(skillData);
              results.skills.push(skill);
            }
          } catch (err) {
            console.error('Failed to import skill:', err.message);
          }
        }
      }

      // Import Experience
      if ((importAll || sections.includes('experience')) && dataToImport.experience) {
        const dbExp = await Experience.findAll();
        for (const expData of dataToImport.experience) {
          try {
            const company = expData.company || expData.company_name || 'Company';
            const position = expData.position || expData.position_title || expData.title || 'Position';
            expData.company = company;
            expData.position = position;
            if (!expData.start_date) expData.start_date = '2020-01-01';

            const existing = similarity.findExperienceMatch(dbExp, company, position);
            if (existing) {
              await existing.update(expData);
              results.experience.push(existing);
            } else {
              const experience = await Experience.create(expData);
              results.experience.push(experience);
            }
          } catch (err) {
            console.error('Failed to import experience:', err.message);
          }
        }
      }

      // Import Education
      if ((importAll || sections.includes('education')) && dataToImport.education) {
        const dbEdu = await Education.findAll();
        for (const eduData of dataToImport.education) {
          try {
            const institution = eduData.institution || eduData.institution_name || eduData.school || 'Institution';
            const degree = eduData.degree || eduData.qualification || 'Qualification';
            eduData.institution = institution;
            eduData.degree = degree;
            if (!eduData.field_of_study) eduData.field_of_study = 'General Study';
            if (!eduData.start_date) eduData.start_date = '2020-01-01';

            const existing = similarity.findEducationMatch(dbEdu, institution, degree);
            if (existing) {
              await existing.update(eduData);
              results.education.push(existing);
            } else {
              const education = await Education.create(eduData);
              results.education.push(education);
            }
          } catch (err) {
            console.error('Failed to import education:', err.message);
          }
        }
      }

      // Import Certifications
      if ((importAll || sections.includes('certifications')) && dataToImport.certifications) {
        const dbCerts = await Certification.findAll();
        for (const certData of dataToImport.certifications) {
          try {
            const certName = certData.certification_name || certData.name || certData.title || 'Certification';
            certData.certification_name = certName;
            if (!certData.issuing_organization) certData.issuing_organization = 'Organization';

            const existing = similarity.findCertificationMatch(dbCerts, certName);
            if (existing) {
              await existing.update(certData);
              results.certifications.push(existing);
            } else {
              const certification = await Certification.create(certData);
              results.certifications.push(certification);
            }
          } catch (err) {
            console.error('Failed to import certification:', err.message);
          }
        }
      }

      // Import Achievements
      if ((importAll || sections.includes('achievements')) && dataToImport.achievements) {
        const dbAch = await Achievement.findAll();
        for (const achData of dataToImport.achievements) {
          try {
            const title = achData.title || achData.name || 'Achievement';
            achData.title = title;

            const existing = similarity.findAchievementMatch(dbAch, title);
            if (existing) {
              await existing.update(achData);
              results.achievements.push(existing);
            } else {
              const achievement = await Achievement.create(achData);
              results.achievements.push(achievement);
            }
          } catch (err) {
            console.error('Failed to import achievement:', err.message);
          }
        }
      }

      // Import Projects
      if ((importAll || sections.includes('projects')) && dataToImport.projects) {
        const dbProj = await Project.findAll();
        for (const projData of dataToImport.projects) {
          try {
            const title = projData.title || projData.project_name || projData.name || 'Project';
            projData.title = title;
            if (!projData.description) projData.description = title;
            if (!projData.slug) {
              projData.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
            }

            const existing = similarity.findProjectMatch(dbProj, title);
            if (existing) {
              await existing.update(projData);
              results.projects.push(existing);
            } else {
              const project = await Project.create(projData);
              results.projects.push(project);
            }
          } catch (err) {
            console.error('Failed to import project:', err.message);
          }
        }
      }

      // Import Testimonials
      if ((importAll || sections.includes('testimonials')) && dataToImport.testimonials) {
        const dbTest = await Testimonial.findAll();
        for (const testimonialData of dataToImport.testimonials) {
          try {
            const author = testimonialData.author_name || testimonialData.name || testimonialData.author || 'Anonymous';
            testimonialData.author_name = author;
            if (!testimonialData.content) testimonialData.content = 'Recommendation';

            const existing = similarity.findTestimonialMatch(dbTest, author);
            if (existing) {
              await existing.update(testimonialData);
              results.testimonials.push(existing);
            } else {
              const testimonial = await Testimonial.create(testimonialData);
              results.testimonials.push(testimonial);
            }
          } catch (err) {
            console.error('Failed to import testimonial:', err.message);
          }
        }
      }

      // Import Social Accounts
      if ((importAll || sections.includes('social')) && dataToImport.social) {
        for (const socialData of dataToImport.social) {
          try {
            if (!socialData.platform_name || !socialData.url) continue;
            const social = await SocialAccount.create(socialData);
            results.social.push(social);
          } catch (err) {
            console.error('Failed to import social:', err.message);
          }
        }
      }

      // Update import status
      await cvImport.update({
        status: 'imported',
        importedAt: new Date(),
        importResults: results,
      });

      // Clean up file
      if (cvImport.filePath) {
        await fs.unlink(cvImport.filePath).catch(() => { });
      }

      return res.status(200).json({
        success: true,
        message: 'Document data imported successfully',
        data: {
          imported: {
            skills: results.skills.length,
            experience: results.experience.length,
            education: results.education.length,
            certifications: results.certifications.length,
            achievements: results.achievements.length,
            projects: results.projects.length,
            testimonials: results.testimonials.length,
            social: results.social.length,
          },
          results,
        },
      });
    } catch (error) {
      console.error('Error importing document data:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to import document data',
        error: error.message,
      });
    }
  }

  /**
   * Get import history
   * GET /api/cv/history
   */
  async getImportHistory(req, res) {
    try {
      const imports = await CVImport.findAll({
        order: [['createdAt', 'DESC']],
        limit: 20,
        attributes: ['id', 'fileName', 'fileSize', 'status', 'createdAt', 'importedAt'],
      });

      return res.status(200).json({
        success: true,
        data: imports,
      });
    } catch (error) {
      console.error('Error fetching import history:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch import history',
        error: error.message,
      });
    }
  }

  /**
   * Delete import record
   * DELETE /api/cv/:importId
   */
  async deleteImport(req, res) {
    try {
      const { importId } = req.params;

      const cvImport = await CVImport.findByPk(importId);

      if (!cvImport) {
        return res.status(404).json({
          success: false,
          message: 'Import record not found',
        });
      }

      // Clean up file if exists
      if (cvImport.filePath) {
        await fs.unlink(cvImport.filePath).catch(() => { });
      }

      await cvImport.destroy();

      return res.status(200).json({
        success: true,
        message: 'Import record deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting import record:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete import record',
        error: error.message,
      });
    }
  }

  /**
   * Helper to check existing database records and annotate mapped data
   * with `existsInDb: true/false` for preview UI indicators.
   * Uses Levenshtein + Token Jaccard similarity from the similarity engine.
   */
  async _annotateDuplicates(aiParsedData) {
    if (!aiParsedData?.data) return aiParsedData;

    const data = aiParsedData.data;

    const [dbSkills, dbExperience, dbEducation, dbCertifications, dbAchievements, dbProjects, dbTestimonials] = await Promise.all([
      Skill.findAll(),
      Experience.findAll(),
      Education.findAll(),
      Certification.findAll(),
      Achievement.findAll(),
      Project.findAll(),
      Testimonial.findAll(),
    ]);

    if (data.skills && Array.isArray(data.skills)) {
      for (const skill of data.skills) {
        const skillName = skill.name || skill.skill_name || (typeof skill === 'string' ? skill : null);
        if (!skillName) continue;
        skill.existsInDb = !!similarity.findSkillMatch(dbSkills, skillName);
      }
    }

    if (data.experience && Array.isArray(data.experience)) {
      for (const exp of data.experience) {
        const company = exp.company || exp.company_name;
        const position = exp.position || exp.position_title || exp.title;
        if (!company || !position) continue;
        exp.existsInDb = !!similarity.findExperienceMatch(dbExperience, company, position);
      }
    }

    if (data.education && Array.isArray(data.education)) {
      for (const edu of data.education) {
        const institution = edu.institution || edu.institution_name || edu.school;
        const degree = edu.degree || edu.qualification;
        if (!institution || !degree) continue;
        edu.existsInDb = !!similarity.findEducationMatch(dbEducation, institution, degree);
      }
    }

    if (data.certifications && Array.isArray(data.certifications)) {
      for (const cert of data.certifications) {
        const certName = cert.certification_name || cert.name || cert.title;
        if (!certName) continue;
        cert.existsInDb = !!similarity.findCertificationMatch(dbCertifications, certName);
      }
    }

    if (data.achievements && Array.isArray(data.achievements)) {
      for (const ach of data.achievements) {
        const title = ach.title || ach.name;
        if (!title) continue;
        ach.existsInDb = !!similarity.findAchievementMatch(dbAchievements, title);
      }
    }

    if (data.projects && Array.isArray(data.projects)) {
      for (const proj of data.projects) {
        const title = proj.title || proj.name || proj.project_name;
        if (!title) continue;
        proj.existsInDb = !!similarity.findProjectMatch(dbProjects, title);
      }
    }

    if (data.testimonials && Array.isArray(data.testimonials)) {
      for (const test of data.testimonials) {
        const author = test.author_name || test.name || test.author;
        if (!author) continue;
        test.existsInDb = !!similarity.findTestimonialMatch(dbTestimonials, author);
      }
    }

    return aiParsedData;
  }
}

module.exports = new CVImportController();
