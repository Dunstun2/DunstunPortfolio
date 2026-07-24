/**
 * CV Parser Service
 * 
 * Extracts text from various document formats (PDF, DOCX, TXT)
 * and intelligently parses CV sections into structured data.
 */

const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

class CVParserService {
  /**
   * Extract text from uploaded CV file
   * @param {string} filePath - Path to the uploaded file
   * @param {string} fileType - MIME type of the file
   * @returns {Promise<string>} - Extracted text content
   */
  async extractText(filePath, fileType) {
    try {
      if (fileType === 'application/pdf' || filePath.endsWith('.pdf')) {
        return await this.extractFromPDF(filePath);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        filePath.endsWith('.docx')
      ) {
        return await this.extractFromDOCX(filePath);
      } else if (fileType === 'text/plain' || filePath.endsWith('.txt')) {
        return await this.extractFromTXT(filePath);
      } else {
        throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT files.');
      }
    } catch (error) {
      console.error('Error extracting text from CV:', error);
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF file
   */
  async extractFromPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  /**
   * Extract text from DOCX file
   */
  async extractFromDOCX(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      throw new Error(`DOCX parsing failed: ${error.message}`);
    }
  }

  /**
   * Extract text from TXT file
   */
  async extractFromTXT(filePath) {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`TXT reading failed: ${error.message}`);
    }
  }

  /**
   * Parse CV text into structured sections
   * @param {string} text - Raw CV text
   * @returns {Object} - Parsed CV data with sections
   */
  parseCV(text) {
    const sections = {
      personalInfo: this.extractPersonalInfo(text),
      summary: this.extractSummary(text),
      skills: this.extractSkills(text),
      experience: this.extractExperience(text),
      education: this.extractEducation(text),
      certifications: this.extractCertifications(text),
      achievements: this.extractAchievements(text),
      languages: this.extractLanguages(text),
      hobbies: this.extractHobbies(text),
      references: this.extractReferences(text),
      projects: this.extractProjects(text),
    };

    return {
      raw: text,
      parsed: sections,
      metadata: {
        parsedAt: new Date(),
        wordCount: text.split(/\s+/).length,
        hasEmail: !!sections.personalInfo.email,
        hasPhone: !!sections.personalInfo.phone,
        sectionsFound: Object.keys(sections).filter(key => {
          const section = sections[key];
          if (Array.isArray(section)) return section.length > 0;
          if (typeof section === 'object') return Object.keys(section).length > 0;
          return !!section;
        }),
      },
    };
  }

  /**
   * Extract personal information (name, email, phone, location)
   */
  extractPersonalInfo(text) {
    const info = {};

    // Extract email
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emailMatch = text.match(emailRegex);
    info.email = emailMatch ? emailMatch[0] : null;

    // Extract phone (various formats)
    const phoneRegex = /(?:(?:\+|00)?254|0)?[-.\s]?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{3,4}/g;
    const phoneMatch = text.match(phoneRegex);
    info.phone = phoneMatch ? phoneMatch[0].trim() : null;

    // Extract name (usually first line or before contact info)
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.length < 50 && !firstLine.includes('@') && !phoneRegex.test(firstLine)) {
      info.name = firstLine.toUpperCase() === firstLine ? this.toTitleCase(firstLine) : firstLine;
    }

    // Extract location (look for cities, countries)
    const locationRegex = /(?:location|address|based in|from)[\s:]*([^\n]+)/gi;
    const locationMatch = locationRegex.exec(text);
    info.location = locationMatch ? locationMatch[1].trim() : null;

    // Extract LinkedIn
    const linkedinRegex = /(?:linkedin\.com\/in\/|linkedin:?\s*)([a-zA-Z0-9-]+)/gi;
    const linkedinMatch = linkedinRegex.exec(text);
    info.linkedin = linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : null;

    // Extract GitHub
    const githubRegex = /(?:github\.com\/|github:?\s*)([a-zA-Z0-9-]+)/gi;
    const githubMatch = githubRegex.exec(text);
    info.github = githubMatch ? `https://github.com/${githubMatch[1]}` : null;

    // Extract portfolio/website
    const websiteRegex = /(https?:\/\/[^\s]+)/gi;
    const websiteMatch = text.match(websiteRegex);
    if (websiteMatch) {
      info.website = websiteMatch.find(url =>
        !url.includes('linkedin.com') && !url.includes('github.com')
      );
    }

    return info;
  }

  /**
   * Extract professional summary/profile
   */
  extractSummary(text) {
    const summaryRegex = /(?:profile summary|professional summary|summary|profile|about me|objective)[\s:]*\n([^\n]+(?:\n(?!\s*(?:skills|experience|education|work|employment))[^\n]+)*)/gi;
    const match = summaryRegex.exec(text);

    if (match && match[1]) {
      return match[1].trim().replace(/\s+/g, ' ');
    }

    // Fallback: Look for paragraph after name/contact
    const lines = text.split('\n');
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 50 && !line.includes('@') && !line.match(/\d{3}/)) {
        return line;
      }
    }

    return null;
  }

  /**
   * Extract skills section
   */
  extractSkills(text) {
    const skills = [];

    // Look for skills section
    const skillsRegex = /(?:skills|technical skills|core competencies|expertise)[\s:]*\n([\s\S]+?)(?:\n\s*(?:experience|education|work|employment|projects|certifications)|$)/gi;
    const match = skillsRegex.exec(text);

    if (match && match[1]) {
      const skillsText = match[1];

      // Extract bullet points or comma-separated skills
      const lines = skillsText.split('\n');
      lines.forEach(line => {
        line = line.trim().replace(/^[·•\-*]\s*/, '');

        if (line.length > 2 && line.length < 100) {
          // Split by comma or slash
          const items = line.split(/[,/]/).map(s => s.trim()).filter(s => s.length > 2);
          items.forEach(item => {
            // Clean up and extract skill name
            const cleaned = item.replace(/[·•\-*]/g, '').trim();
            if (cleaned && !skills.includes(cleaned)) {
              skills.push(cleaned);
            }
          });
        }
      });
    }

    return skills.slice(0, 30); // Limit to 30 skills
  }

  /**
   * Extract work experience
   */
  extractExperience(text) {
    const experiences = [];

    // Look for experience section
    const expRegex = /(?:work experience|experience|employment history|professional experience)[\s:]*\n([\s\S]+?)(?:\n\s*(?:education|skills|certifications|projects)|$)/gi;
    const match = expRegex.exec(text);

    if (match && match[1]) {
      const expText = match[1];

      // Split by job entries (look for dates or role patterns)
      const entries = this.splitByPattern(expText, /\d{4}|\d{1,2}\/\d{4}/);

      entries.forEach(entry => {
        const exp = this.parseExperienceEntry(entry);
        if (exp) experiences.push(exp);
      });
    }

    return experiences;
  }

  /**
   * Parse individual experience entry
   */
  parseExperienceEntry(text) {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return null;

    const experience = {
      title: null,
      company: null,
      location: null,
      startDate: null,
      endDate: null,
      current: false,
      description: [],
      achievements: [],
    };

    // First line usually contains role and company
    const firstLine = lines[0].trim();

    // Extract dates
    const dateRegex = /(?:(?:january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2})[\s,/-]*(?:\d{4}|\d{2}))/gi;
    const dates = text.match(dateRegex);

    if (dates && dates.length >= 1) {
      experience.startDate = this.parseDate(dates[0]);
      if (dates.length >= 2) {
        experience.endDate = this.parseDate(dates[1]);
      } else if (text.toLowerCase().includes('present') || text.toLowerCase().includes('current')) {
        experience.current = true;
      }
    }

    // Extract company name (often after "at", "@", or on second line)
    const companyMatch = firstLine.match(/(?:at|@)\s+([^,\n]+)/i);
    if (companyMatch) {
      experience.company = companyMatch[1].trim();
      experience.title = firstLine.replace(companyMatch[0], '').trim();
    } else {
      // Role might be first line, company second
      experience.title = firstLine;
      if (lines.length > 1) {
        const secondLine = lines[1].trim();
        if (!dateRegex.test(secondLine)) {
          experience.company = secondLine;
        }
      }
    }

    // Extract responsibilities/achievements (bullet points)
    lines.slice(1).forEach(line => {
      line = line.trim().replace(/^[·•\-*]\s*/, '');
      if (line.length > 10 && !dateRegex.test(line)) {
        if (line.toLowerCase().includes('achieved') ||
          line.toLowerCase().includes('improved') ||
          line.toLowerCase().includes('increased')) {
          experience.achievements.push(line);
        } else {
          experience.description.push(line);
        }
      }
    });

    return experience.title ? experience : null;
  }

  /**
   * Extract education
   */
  extractEducation(text) {
    const education = [];

    const eduRegex = /(?:education|academic|qualifications)[\s:]*\n([\s\S]+?)(?:\n\s*(?:experience|skills|certifications|projects|references)|$)/gi;
    const match = eduRegex.exec(text);

    if (match && match[1]) {
      const eduText = match[1];
      const entries = this.splitByPattern(eduText, /\d{4}/);

      entries.forEach(entry => {
        const edu = this.parseEducationEntry(entry);
        if (edu) education.push(edu);
      });
    }

    return education;
  }

  /**
   * Parse individual education entry
   */
  parseEducationEntry(text) {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length === 0) return null;

    const edu = {
      degree: null,
      institution: null,
      location: null,
      startDate: null,
      endDate: null,
      grade: null,
      description: null,
    };

    // Extract dates
    const dateRegex = /\d{4}/g;
    const dates = text.match(dateRegex);
    if (dates) {
      edu.startDate = dates[0];
      edu.endDate = dates[dates.length - 1];
    }

    // First or second line usually contains institution
    lines.forEach(line => {
      if (line.toLowerCase().includes('university') ||
        line.toLowerCase().includes('college') ||
        line.toLowerCase().includes('institute') ||
        line.toLowerCase().includes('school')) {
        edu.institution = line.replace(/\d{4}.*/, '').trim();
      } else if (line.toLowerCase().includes('bachelor') ||
        line.toLowerCase().includes('master') ||
        line.toLowerCase().includes('degree') ||
        line.toLowerCase().includes('diploma') ||
        line.toLowerCase().includes('certificate')) {
        edu.degree = line.replace(/\d{4}.*/, '').trim();
      }
    });

    return edu.institution || edu.degree ? edu : null;
  }

  /**
   * Extract certifications
   */
  extractCertifications(text) {
    const certifications = [];

    const certRegex = /(?:certifications?|qualifications?|licenses?)[\s:]*\n([\s\S]+?)(?:\n\s*(?:experience|education|skills|projects|references)|$)/gi;
    const match = certRegex.exec(text);

    if (match && match[1]) {
      const certText = match[1];
      const lines = certText.split('\n');

      lines.forEach(line => {
        line = line.trim().replace(/^[·•\-*]\s*/, '');
        if (line.length > 5 && line.length < 200) {
          const cert = {
            name: line,
            issuer: null,
            date: null,
            credentialId: null,
          };

          // Extract date if present
          const dateMatch = line.match(/\d{4}/);
          if (dateMatch) {
            cert.date = dateMatch[0];
            cert.name = line.replace(/\d{4}.*/, '').trim();
          }

          certifications.push(cert);
        }
      });
    }

    return certifications.slice(0, 20);
  }

  /**
   * Extract achievements
   */
  extractAchievements(text) {
    const achievements = [];

    const achRegex = /(?:achievements?|accomplishments?|awards?|honors?)[\s:]*\n([\s\S]+?)(?:\n\s*(?:experience|education|skills|references)|$)/gi;
    const match = achRegex.exec(text);

    if (match && match[1]) {
      const achText = match[1];
      const lines = achText.split('\n');

      lines.forEach(line => {
        line = line.trim().replace(/^[·•\-*]\s*/, '');
        if (line.length > 10) {
          achievements.push({
            title: line,
            description: null,
            date: this.extractDateFromText(line),
          });
        }
      });
    }

    return achievements.slice(0, 15);
  }

  /**
   * Extract languages
   */
  extractLanguages(text) {
    const languages = [];

    const langRegex = /(?:languages?)[\s:]*\n([\s\S]+?)(?:\n\s*(?:experience|education|skills|references|hobbies)|$)/gi;
    const match = langRegex.exec(text);

    if (match && match[1]) {
      const langText = match[1];
      const lines = langText.split('\n');

      lines.forEach(line => {
        line = line.trim().replace(/^[·•\-*]\s*/, '');
        if (line.length > 2 && line.length < 100) {
          // Extract language and proficiency level
          const parts = line.split(/[-–:()]/);
          languages.push({
            name: parts[0].trim(),
            proficiency: parts[1]?.trim() || 'Intermediate',
          });
        }
      });
    }

    return languages.slice(0, 10);
  }

  /**
   * Extract hobbies/interests
   */
  extractHobbies(text) {
    const hobbies = [];

    const hobbyRegex = /(?:hobbies?|interests?)[\s:]*\n([\s\S]+?)(?:\n\s*(?:references?|$))/gi;
    const match = hobbyRegex.exec(text);

    if (match && match[1]) {
      const hobbyText = match[1];
      const lines = hobbyText.split('\n');

      lines.forEach(line => {
        line = line.trim().replace(/^[·•\-*]\s*/, '');
        if (line.length > 2 && line.length < 100) {
          // Split by comma
          const items = line.split(',').map(s => s.trim());
          hobbies.push(...items.filter(item => item.length > 2));
        }
      });
    }

    return hobbies.slice(0, 10);
  }

  /**
   * Extract references
   */
  extractReferences(text) {
    const references = [];

    const refRegex = /(?:references?)[\s:]*\n([\s\S]+?)$/gi;
    const match = refRegex.exec(text);

    if (match && match[1]) {
      const refText = match[1];
      const entries = refText.split(/\d\.\s+/).filter(e => e.trim());

      entries.forEach(entry => {
        const ref = this.parseReferenceEntry(entry);
        if (ref) references.push(ref);
      });
    }

    return references;
  }

  /**
   * Parse reference entry
   */
  parseReferenceEntry(text) {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length === 0) return null;

    const ref = {
      name: lines[0].trim(),
      title: null,
      company: null,
      email: null,
      phone: null,
    };

    // Extract email
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) ref.email = emailMatch[0];

    // Extract phone
    const phoneRegex = /(?:\+?[\d\s()-]+)/g;
    const phoneMatches = text.match(phoneRegex);
    if (phoneMatches) {
      ref.phone = phoneMatches.find(p => p.length > 8);
    }

    // Extract title/company
    lines.slice(1).forEach(line => {
      if (!emailRegex.test(line) && !line.match(/tel|phone|mobile/i)) {
        if (!ref.title) {
          ref.title = line.trim();
        } else if (!ref.company) {
          ref.company = line.trim();
        }
      }
    });

    return ref;
  }

  /**
   * Extract projects (if mentioned)
   */
  extractProjects(text) {
    const projects = [];

    const projRegex = /(?:projects?|portfolio)[\s:]*\n([\s\S]+?)(?:\n\s*(?:experience|education|skills|references)|$)/gi;
    const match = projRegex.exec(text);

    if (match && match[1]) {
      const projText = match[1];
      const lines = projText.split('\n');

      let currentProject = null;

      lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('·') || line.startsWith('•') || line.startsWith('-')) {
          if (currentProject) projects.push(currentProject);

          currentProject = {
            title: line.replace(/^[·•\-*]\s*/, ''),
            description: [],
            technologies: [],
          };
        } else if (currentProject && line.length > 10) {
          currentProject.description.push(line);
        }
      });

      if (currentProject) projects.push(currentProject);
    }

    return projects.slice(0, 10);
  }

  /**
   * Helper: Split text by pattern
   */
  splitByPattern(text, pattern) {
    const entries = [];
    const lines = text.split('\n');
    let currentEntry = [];

    lines.forEach(line => {
      if (pattern.test(line) && currentEntry.length > 0) {
        entries.push(currentEntry.join('\n'));
        currentEntry = [line];
      } else {
        currentEntry.push(line);
      }
    });

    if (currentEntry.length > 0) {
      entries.push(currentEntry.join('\n'));
    }

    return entries.filter(e => e.trim().length > 0);
  }

  /**
   * Helper: Parse date string
   */
  parseDate(dateStr) {
    // Try to extract year at minimum
    const yearMatch = dateStr.match(/\d{4}/);
    return yearMatch ? yearMatch[0] : dateStr;
  }

  /**
   * Helper: Extract date from text
   */
  extractDateFromText(text) {
    const yearMatch = text.match(/\d{4}/);
    return yearMatch ? yearMatch[0] : null;
  }

  /**
   * Helper: Convert to title case
   */
  toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
}

module.exports = new CVParserService();
