/**
 * CV Import Controller
 * 
 * Handles CV upload, parsing, preview, and importing to portfolio
 */

const cvParserService = require('../services/cvParser.service');
const cvMapperService = require('../services/cvMapper.service');
const cvEnhancerService = require('../services/cvEnhancer.service');
const { Hero, About, AboutHighlight, AboutValue, AboutIdentityCard, AboutExploration } = require('../models');
const { Skill, Experience, Education, Certification, Achievement } = require('../models');
const { Project, SocialAccount, Setting } = require('../models');
const CVImport = require('../models/CVImport');
const fs = require('fs').promises;
const path = require('path');

class CVImportController {
  /**
   * Upload and parse CV
   * POST /api/cv/upload
   */
  async uploadAndParse(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please upload a CV file (PDF, DOCX, or TXT).',
        });
      }

      const file = req.file;
      const filePath = file.path;
      const fileType = file.mimetype;

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

      // Extract text from CV
      const extractedText = await cvParserService.extractText(filePath, fileType);

      // Parse CV into structured data
      const parsedCV = cvParserService.parseCV(extractedText);

      // Map to portfolio modules
      const mappedData = cvMapperService.mapToPortfolio(parsedCV);

      // Enhance with AI improvements
      const enhancedData = cvEnhancerService.enhanceCV(mappedData);

      // Save import record
      const cvImport = await CVImport.create({
        fileName: file.originalname,
        fileSize: file.size,
        fileType: fileType,
        filePath: filePath,
        extractedText: extractedText,
        parsedData: parsedCV,
        mappedData: mappedData,
        enhancedData: enhancedData,
        status: 'parsed',
        importedBy: req.user?.id || null,
      });

      // Clean up file after processing (optional - keep for preview)
      // await fs.unlink(filePath).catch(() => {});

      return res.status(200).json({
        success: true,
        message: 'CV uploaded and parsed successfully',
        data: {
          importId: cvImport.id,
          fileName: file.originalname,
          metadata: parsedCV.metadata,
          preview: {
            personalInfo: parsedCV.parsed.personalInfo,
            summary: parsedCV.parsed.summary,
            skillsCount: parsedCV.parsed.skills.length,
            experienceCount: parsedCV.parsed.experience.length,
            educationCount: parsedCV.parsed.education.length,
            certificationsCount: parsedCV.parsed.certifications.length,
            achievementsCount: parsedCV.parsed.achievements.length,
          },
          mappedData: mappedData,
          enhancedData: enhancedData,
        },
      });
    } catch (error) {
      console.error('Error uploading and parsing CV:', error);

      // Clean up file on error
      if (req.file?.path) {
        await fs.unlink(req.file.path).catch(() => { });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to process CV',
        error: error.message,
      });
    }
  }

  /**
   * Get parsed CV preview
   * GET /api/cv/preview/:importId
   */
  async getPreview(req, res) {
    try {
      const { importId } = req.params;

      const cvImport = await CVImport.findByPk(importId);

      if (!cvImport) {
        return res.status(404).json({
          success: false,
          message: 'CV import not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: cvImport.id,
          fileName: cvImport.fileName,
          status: cvImport.status,
          parsedData: cvImport.parsedData,
          mappedData: cvImport.mappedData,
          enhancedData: cvImport.enhancedData,
          createdAt: cvImport.createdAt,
        },
      });
    } catch (error) {
      console.error('Error fetching CV preview:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch CV preview',
        error: error.message,
      });
    }
  }

  /**
   * Import CV data to portfolio
   * POST /api/cv/import/:importId
   */
  async importToPortfolio(req, res) {
    try {
      const { importId } = req.params;
      const { sections = [], useEnhanced = true } = req.body; // Option to use enhanced data

      const cvImport = await CVImport.findByPk(importId);

      if (!cvImport) {
        return res.status(404).json({
          success: false,
          message: 'CV import not found',
        });
      }

      if (cvImport.status === 'imported') {
        return res.status(400).json({
          success: false,
          message: 'This CV has already been imported',
        });
      }

      // Choose between enhanced or mapped data
      const dataToImport = useEnhanced && cvImport.enhancedData ? cvImport.enhancedData : cvImport.mappedData;
      const importAll = sections.length === 0 || sections.includes('all');

      const results = {
        hero: null,
        about: null,
        skills: [],
        experience: [],
        education: [],
        certifications: [],
        achievements: [],
        projects: [],
        social: [],
        settings: [],
      };

      // Import Hero
      if (importAll || sections.includes('hero')) {
        const heroData = dataToImport.hero;
        const existingHero = await Hero.findOne();

        if (existingHero) {
          await existingHero.update(heroData);
          results.hero = existingHero;
        } else {
          results.hero = await Hero.create(heroData);
        }
      }

      // Import About
      if (importAll || sections.includes('about')) {
        const aboutData = dataToImport.about;
        const existingAbout = await About.findOne();

        if (existingAbout) {
          await existingAbout.update({
            title: aboutData.title,
            subtitle: aboutData.subtitle,
            bio: aboutData.bio,
            imageUrl: aboutData.imageUrl,
          });
          results.about = existingAbout;

          // Update nested sections
          await AboutHighlight.destroy({ where: {} });
          await AboutValue.destroy({ where: {} });
          await AboutIdentityCard.destroy({ where: {} });
          await AboutExploration.destroy({ where: {} });
        } else {
          results.about = await About.create({
            title: aboutData.title,
            subtitle: aboutData.subtitle,
            bio: aboutData.bio,
            imageUrl: aboutData.imageUrl,
          });
        }

        // Create highlights
        if (aboutData.highlights) {
          for (const highlight of aboutData.highlights) {
            await AboutHighlight.create({
              ...highlight,
              aboutId: results.about.id,
            });
          }
        }

        // Create values
        if (aboutData.values) {
          for (const value of aboutData.values) {
            await AboutValue.create({
              ...value,
              aboutId: results.about.id,
            });
          }
        }

        // Create identity cards
        if (aboutData.identityCards) {
          for (const card of aboutData.identityCards) {
            await AboutIdentityCard.create({
              ...card,
              aboutId: results.about.id,
            });
          }
        }

        // Create explorations
        if (aboutData.explorations) {
          for (const exploration of aboutData.explorations) {
            await AboutExploration.create({
              ...exploration,
              aboutId: results.about.id,
            });
          }
        }
      }

      // Import Skills
      if (importAll || sections.includes('skills')) {
        for (const skillData of dataToImport.skills) {
          const skill = await Skill.create(skillData);
          results.skills.push(skill);
        }
      }

      // Import Experience
      if (importAll || sections.includes('experience')) {
        for (const expData of dataToImport.experience) {
          const experience = await Experience.create(expData);
          results.experience.push(experience);
        }
      }

      // Import Education
      if (importAll || sections.includes('education')) {
        for (const eduData of dataToImport.education) {
          const education = await Education.create(eduData);
          results.education.push(education);
        }
      }

      // Import Certifications
      if (importAll || sections.includes('certifications')) {
        for (const certData of dataToImport.certifications) {
          const certification = await Certification.create(certData);
          results.certifications.push(certification);
        }
      }

      // Import Achievements
      if (importAll || sections.includes('achievements')) {
        for (const achData of dataToImport.achievements) {
          const achievement = await Achievement.create(achData);
          results.achievements.push(achievement);
        }
      }

      // Import Projects
      if (importAll || sections.includes('projects')) {
        for (const projData of dataToImport.projects) {
          const project = await Project.create(projData);
          results.projects.push(project);
        }
      }

      // Import Social Accounts
      if (importAll || sections.includes('social')) {
        for (const socialData of dataToImport.social) {
          const social = await SocialAccount.create({
            platform_name: socialData.platform,
            url: socialData.url,
            username: socialData.username,
            display_order: socialData.order,
            is_active: true,
          });
          results.social.push(social);
        }
      }

      // Import Settings
      if (importAll || sections.includes('settings')) {
        for (const [key, value] of Object.entries(dataToImport.settings)) {
          if (value) {
            const [setting, created] = await Setting.findOrCreate({
              where: { key },
              defaults: {
                key,
                value,
                type: 'text',
                category: 'general',
              },
            });

            if (!created) {
              await setting.update({ value });
            }

            results.settings.push(setting);
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
        message: 'CV data imported successfully',
        data: {
          imported: {
            hero: results.hero ? 1 : 0,
            about: results.about ? 1 : 0,
            skills: results.skills.length,
            experience: results.experience.length,
            education: results.education.length,
            certifications: results.certifications.length,
            achievements: results.achievements.length,
            projects: results.projects.length,
            social: results.social.length,
            settings: results.settings.length,
          },
          results,
        },
      });
    } catch (error) {
      console.error('Error importing CV data:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to import CV data',
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
   * Enhance parsed CV data with AI improvements
   * POST /api/cv/enhance/:importId
   */
  async enhanceCV(req, res) {
    try {
      const { importId } = req.params;

      const cvImport = await CVImport.findByPk(importId);

      if (!cvImport) {
        return res.status(404).json({
          success: false,
          message: 'CV import not found',
        });
      }

      if (!cvImport.mappedData) {
        return res.status(400).json({
          success: false,
          message: 'CV must be parsed first before enhancement',
        });
      }

      // Enhance the mapped data
      const enhancedData = cvEnhancerService.enhanceCV(cvImport.mappedData);

      // Update the import record with enhanced data
      await cvImport.update({
        enhancedData: enhancedData,
      });

      return res.status(200).json({
        success: true,
        message: 'CV data enhanced successfully',
        data: {
          original: cvImport.mappedData,
          enhanced: enhancedData,
          improvements: this.getImprovementsSummary(cvImport.mappedData, enhancedData),
        },
      });
    } catch (error) {
      console.error('Error enhancing CV data:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to enhance CV data',
        error: error.message,
      });
    }
  }

  /**
   * Get improvements summary comparing original vs enhanced
   */
  getImprovementsSummary(original, enhanced) {
    const improvements = {
      hero: [],
      about: [],
      skills: [],
      experience: [],
      projects: [],
      totalEnhancements: 0,
    };

    // Compare hero section
    if (enhanced.hero?.keywords && enhanced.hero.keywords.length > 0) {
      improvements.hero.push(`Added ${enhanced.hero.keywords.length} SEO keywords`);
      improvements.totalEnhancements++;
    }

    // Compare about section
    if (enhanced.about?.keywords && enhanced.about.keywords.length > 0) {
      improvements.about.push(`Added ${enhanced.about.keywords.length} content keywords`);
      improvements.totalEnhancements++;
    }

    // Compare skills
    const skillsWithDesc = enhanced.skills?.filter(s => s.description).length || 0;
    if (skillsWithDesc > 0) {
      improvements.skills.push(`Generated descriptions for ${skillsWithDesc} skills`);
      improvements.totalEnhancements++;
    }

    // Compare experience
    const expWithKeywords = enhanced.experience?.filter(e => e.keywords?.length > 0).length || 0;
    if (expWithKeywords > 0) {
      improvements.experience.push(`Added keywords to ${expWithKeywords} positions`);
      improvements.totalEnhancements++;
    }

    // Compare projects
    const projWithComplexity = enhanced.projects?.filter(p => p.complexity).length || 0;
    if (projWithComplexity > 0) {
      improvements.projects.push(`Analyzed complexity for ${projWithComplexity} projects`);
      improvements.totalEnhancements++;
    }

    return improvements;
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
          message: 'CV import not found',
        });
      }

      // Clean up file if exists
      if (cvImport.filePath) {
        await fs.unlink(cvImport.filePath).catch(() => { });
      }

      await cvImport.destroy();

      return res.status(200).json({
        success: true,
        message: 'CV import deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting CV import:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete CV import',
        error: error.message,
      });
    }
  }
}

module.exports = new CVImportController();
