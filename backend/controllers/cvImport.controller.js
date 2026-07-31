/**
 * CV Import Controller
 * 
 * Handles Document upload, AI parsing, preview, and importing to portfolio
 */

const cvParserService = require('../services/cvParser.service'); // Kept only for extractText
const aiDocumentParserService = require('../services/aiDocumentParser.service');
const { Hero, About, AboutHighlight, AboutValue, AboutIdentityCard, AboutExploration } = require('../models');
const { Skill, Experience, Education, Certification, Achievement, Testimonial } = require('../models');
const { Project, SocialAccount, Setting } = require('../models');
const CVImport = require('../models/CVImport');
const fs = require('fs').promises;
const path = require('path');

class CVImportController {
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

      // 1. Extract raw text from the document
      const extractedText = await cvParserService.extractText(filePath, fileType);

      // 2. Pass to AI for structured parsing and mapping
      const aiParsedData = await aiDocumentParserService.parseDocument(extractedText, documentType);

      // 3. Save import record
      const cvImport = await CVImport.create({
        fileName: file.originalname,
        fileSize: file.size,
        fileType: fileType,
        filePath: filePath,
        extractedText: extractedText,
        parsedData: null, // Legacy, no longer used
        mappedData: aiParsedData, // We store the AI output directly in mappedData
        enhancedData: null, // Legacy, AI output is already enhanced
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
          mappedData: aiParsedData, // Send this back for the preview UI
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
        for (const skillData of dataToImport.skills) {
          try {
            if (!skillData.name) continue;
            const skill = await Skill.create(skillData);
            results.skills.push(skill);
          } catch (err) {
            console.error('Failed to import skill:', err.message);
          }
        }
      }

      // Import Experience
      if ((importAll || sections.includes('experience')) && dataToImport.experience) {
        for (const expData of dataToImport.experience) {
          try {
            if (!expData.company) expData.company = 'Company';
            if (!expData.position) expData.position = 'Position';
            if (!expData.start_date) expData.start_date = '2020-01-01';
            const experience = await Experience.create(expData);
            results.experience.push(experience);
          } catch (err) {
            console.error('Failed to import experience:', err.message);
          }
        }
      }

      // Import Education
      if ((importAll || sections.includes('education')) && dataToImport.education) {
        for (const eduData of dataToImport.education) {
          try {
            if (!eduData.degree) eduData.degree = 'Qualification';
            if (!eduData.institution) eduData.institution = 'Institution';
            if (!eduData.field_of_study) eduData.field_of_study = 'General Study';
            if (!eduData.start_date) eduData.start_date = '2020-01-01';
            const education = await Education.create(eduData);
            results.education.push(education);
          } catch (err) {
            console.error('Failed to import education:', err.message);
          }
        }
      }

      // Import Certifications
      if ((importAll || sections.includes('certifications')) && dataToImport.certifications) {
        for (const certData of dataToImport.certifications) {
          try {
            if (!certData.certification_name) certData.certification_name = 'Certification';
            if (!certData.issuing_organization) certData.issuing_organization = 'Organization';
            const certification = await Certification.create(certData);
            results.certifications.push(certification);
          } catch (err) {
            console.error('Failed to import certification:', err.message);
          }
        }
      }

      // Import Achievements
      if ((importAll || sections.includes('achievements')) && dataToImport.achievements) {
        for (const achData of dataToImport.achievements) {
          try {
            if (!achData.title) achData.title = 'Achievement';
            const achievement = await Achievement.create(achData);
            results.achievements.push(achievement);
          } catch (err) {
            console.error('Failed to import achievement:', err.message);
          }
        }
      }

      // Import Projects
      if ((importAll || sections.includes('projects')) && dataToImport.projects) {
        for (const projData of dataToImport.projects) {
          try {
            if (!projData.title) projData.title = 'Project';
            if (!projData.description) projData.description = projData.title;
            if (!projData.slug) {
              projData.slug = projData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
            }
            const project = await Project.create(projData);
            results.projects.push(project);
          } catch (err) {
            console.error('Failed to import project:', err.message);
          }
        }
      }

      // Import Testimonials (from Recommendation letters)
      if ((importAll || sections.includes('testimonials')) && dataToImport.testimonials) {
        for (const testimonialData of dataToImport.testimonials) {
          try {
            if (!testimonialData.author_name) testimonialData.author_name = 'Anonymous';
            if (!testimonialData.content) testimonialData.content = 'Recommendation';
            const testimonial = await Testimonial.create(testimonialData);
            results.testimonials.push(testimonial);
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

  // The enhanceCV endpoint is removed because AI automatically enhances data during parsing
}

module.exports = new CVImportController();
