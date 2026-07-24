/**
 * CV Mapper Service
 * 
 * Intelligently maps parsed CV data to portfolio modules.
 * Transforms CV sections into portfolio-ready content.
 */

class CVMapperService {
  /**
   * Map parsed CV data to portfolio modules
   * @param {Object} parsedCV - Parsed CV data from CVParserService
   * @returns {Object} - Mapped portfolio data ready for import
   */
  mapToPortfolio(parsedCV) {
    const { parsed } = parsedCV;

    return {
      hero: this.mapToHero(parsed),
      about: this.mapToAbout(parsed),
      skills: this.mapToSkills(parsed),
      experience: this.mapToExperience(parsed),
      education: this.mapToEducation(parsed),
      certifications: this.mapToCertifications(parsed),
      achievements: this.mapToAchievements(parsed),
      projects: this.mapToProjects(parsed),
      social: this.mapToSocial(parsed),
      settings: this.mapToSettings(parsed),
    };
  }

  /**
   * Map to Hero section
   */
  mapToHero(data) {
    const { personalInfo, summary } = data;

    return {
      greeting: this.generateGreeting(),
      name: personalInfo.name || 'Your Name',
      title: this.inferTitle(data) || 'Professional',
      description: summary || this.generateDescription(data),
      primaryCTA: {
        text: 'View My Work',
        link: '#projects',
      },
      secondaryCTA: {
        text: 'Get In Touch',
        link: '#contact',
      },
      showImage: true,
      imageUrl: null, // User will upload later
      backgroundType: 'gradient',
    };
  }

  /**
   * Map to About section
   */
  mapToAbout(data) {
    const { personalInfo, summary, hobbies, skills, experience } = data;

    // Generate bio from summary and experience
    let bio = summary || '';
    
    if (!bio && experience.length > 0) {
      const yearsExp = this.calculateYearsOfExperience(experience);
      const primarySkill = skills[0] || 'professional';
      bio = `Experienced ${primarySkill} with ${yearsExp}+ years of expertise in delivering high-quality results. `;
      bio += `Passionate about innovation and continuous learning.`;
    }

    return {
      title: 'About Me',
      subtitle: `Learn more about ${personalInfo.name?.split(' ')[0] || 'me'}`,
      bio: bio || 'Professional with a passion for excellence and innovation.',
      imageUrl: null, // User uploads later
      highlights: this.generateHighlights(data),
      values: this.generateValues(data),
      identityCards: this.generateIdentityCards(data),
      explorations: hobbies.map(hobby => ({
        icon: this.selectIconForHobby(hobby),
        title: hobby,
        description: `Passionate about ${hobby.toLowerCase()}`,
      })),
      showHighlights: true,
      showValues: true,
      showIdentityCards: true,
      showExplorations: hobbies.length > 0,
    };
  }

  /**
   * Map to Skills
   */
  mapToSkills(data) {
    const { skills, experience } = data;

    // Categorize skills
    const categorizedSkills = this.categorizeSkills(skills);
    
    return Object.keys(categorizedSkills).map((category, index) => ({
      name: category,
      category: category,
      proficiency: this.inferProficiency(categorizedSkills[category], experience),
      yearsOfExperience: this.inferSkillYears(categorizedSkills[category], experience),
      icon: this.selectIconForSkillCategory(category),
      order: index,
      featured: index < 6, // Feature top 6
      skills: categorizedSkills[category],
    }));
  }

  /**
   * Map to Experience
   */
  mapToExperience(data) {
    const { experience } = data;

    return experience.map((exp, index) => ({
      company: exp.company || 'Company Name',
      position: exp.title || 'Position',
      location: exp.location,
      startDate: this.formatDate(exp.startDate),
      endDate: exp.current ? null : this.formatDate(exp.endDate),
      current: exp.current || false,
      description: this.formatDescription(exp.description),
      responsibilities: exp.description,
      achievements: exp.achievements,
      technologies: this.extractTechnologies(exp.description.concat(exp.achievements)),
      type: this.inferEmploymentType(exp),
      order: index,
      featured: index < 3, // Feature most recent 3
    }));
  }

  /**
   * Map to Education
   */
  mapToEducation(data) {
    const { education } = data;

    return education.map((edu, index) => ({
      institution: edu.institution || 'Educational Institution',
      degree: edu.degree || 'Degree',
      field: this.extractFieldOfStudy(edu.degree),
      location: edu.location,
      startDate: this.formatDate(edu.startDate),
      endDate: this.formatDate(edu.endDate),
      grade: edu.grade,
      description: edu.description,
      achievements: [],
      activities: [],
      order: index,
      featured: index === 0, // Feature highest/most recent
    }));
  }

  /**
   * Map to Certifications
   */
  mapToCertifications(data) {
    const { certifications } = data;

    return certifications.map((cert, index) => ({
      title: cert.name,
      issuer: cert.issuer || 'Certified Organization',
      issueDate: this.formatDate(cert.date),
      expiryDate: null,
      credentialId: cert.credentialId,
      credentialUrl: null,
      description: `Professional certification in ${cert.name}`,
      skills: this.extractSkillsFromCertification(cert.name),
      order: index,
      featured: index < 5,
    }));
  }

  /**
   * Map to Achievements
   */
  mapToAchievements(data) {
    const { achievements, experience } = data;

    // Combine explicit achievements with experience achievements
    const allAchievements = [...achievements];
    
    experience.forEach(exp => {
      exp.achievements.forEach(ach => {
        allAchievements.push({
          title: ach,
          description: `Achievement at ${exp.company}`,
          date: exp.startDate,
        });
      });
    });

    return allAchievements.slice(0, 20).map((ach, index) => ({
      title: ach.title,
      description: ach.description || ach.title,
      date: this.formatDate(ach.date),
      category: this.categorizeAchievement(ach.title),
      icon: this.selectIconForAchievement(ach.title),
      order: index,
      featured: index < 6,
    }));
  }

  /**
   * Map to Projects
   */
  mapToProjects(data) {
    const { projects, experience } = data;

    // If no explicit projects, create from experience
    if (projects.length === 0) {
      return experience.slice(0, 3).map((exp, index) => ({
        title: `${exp.title} Project`,
        description: exp.description.join(' ') || 'Professional project showcasing expertise.',
        longDescription: exp.description.join('\n\n'),
        imageUrl: null,
        technologies: this.extractTechnologies(exp.description),
        category: 'Professional Work',
        featured: index === 0,
        startDate: this.formatDate(exp.startDate),
        endDate: exp.current ? null : this.formatDate(exp.endDate),
        status: exp.current ? 'in-progress' : 'completed',
        projectUrl: null,
        githubUrl: null,
        demoUrl: null,
        order: index,
      }));
    }

    return projects.map((proj, index) => ({
      title: proj.title,
      description: proj.description.join(' ').slice(0, 200),
      longDescription: proj.description.join('\n\n'),
      imageUrl: null,
      technologies: proj.technologies,
      category: 'Portfolio',
      featured: index < 3,
      startDate: null,
      endDate: null,
      status: 'completed',
      projectUrl: null,
      githubUrl: null,
      demoUrl: null,
      order: index,
    }));
  }

  /**
   * Map to Social Accounts
   */
  mapToSocial(data) {
    const { personalInfo } = data;
    const socials = [];

    if (personalInfo.email) {
      socials.push({
        platform: 'Email',
        url: `mailto:${personalInfo.email}`,
        username: personalInfo.email,
        order: 0,
        featured: true,
      });
    }

    if (personalInfo.phone) {
      socials.push({
        platform: 'Phone',
        url: `tel:${personalInfo.phone}`,
        username: personalInfo.phone,
        order: 1,
        featured: true,
      });
    }

    if (personalInfo.linkedin) {
      socials.push({
        platform: 'LinkedIn',
        url: personalInfo.linkedin,
        username: personalInfo.linkedin.split('/').pop(),
        order: 2,
        featured: true,
      });
    }

    if (personalInfo.github) {
      socials.push({
        platform: 'GitHub',
        url: personalInfo.github,
        username: personalInfo.github.split('/').pop(),
        order: 3,
        featured: true,
      });
    }

    if (personalInfo.website) {
      socials.push({
        platform: 'Website',
        url: personalInfo.website,
        username: personalInfo.website,
        order: 4,
        featured: true,
      });
    }

    return socials;
  }

  /**
   * Map to Settings
   */
  mapToSettings(data) {
    const { personalInfo } = data;

    return {
      site_title: `${personalInfo.name}'s Portfolio` || 'My Portfolio',
      site_description: data.summary || 'Professional portfolio showcasing my work and experience.',
      contact_email: personalInfo.email,
      contact_phone: personalInfo.phone,
      location: personalInfo.location,
      footer_text: `© ${new Date().getFullYear()} ${personalInfo.name}. All rights reserved.`,
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Generate greeting based on time or random
   */
  generateGreeting() {
    const greetings = ['Hello', 'Hi there', 'Welcome', 'Hey', 'Greetings'];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Infer professional title from CV data
   */
  inferTitle(data) {
    const { experience, education, skills } = data;

    // Try from most recent job
    if (experience.length > 0) {
      return experience[0].title;
    }

    // Try from education
    if (education.length > 0 && education[0].degree) {
      const degree = education[0].degree.toLowerCase();
      if (degree.includes('engineer')) return 'Engineer';
      if (degree.includes('developer')) return 'Developer';
      if (degree.includes('designer')) return 'Designer';
      if (degree.includes('manager')) return 'Manager';
    }

    // Try from top skills
    if (skills.length > 0) {
      const topSkill = skills[0].toLowerCase();
      if (topSkill.includes('develop')) return 'Developer';
      if (topSkill.includes('design')) return 'Designer';
      if (topSkill.includes('engineer')) return 'Engineer';
    }

    return 'Professional';
  }

  /**
   * Generate description from CV data
   */
  generateDescription(data) {
    const { skills, experience } = data;
    const yearsExp = this.calculateYearsOfExperience(experience);
    const topSkills = skills.slice(0, 3).join(', ');

    if (yearsExp > 0 && topSkills) {
      return `Experienced professional with ${yearsExp}+ years specializing in ${topSkills}. Passionate about delivering excellence.`;
    }

    return 'Dedicated professional committed to excellence and continuous growth.';
  }

  /**
   * Calculate years of experience
   */
  calculateYearsOfExperience(experience) {
    if (experience.length === 0) return 0;

    const dates = experience
      .map(exp => parseInt(exp.startDate))
      .filter(year => !isNaN(year));

    if (dates.length === 0) return 0;

    const earliestYear = Math.min(...dates);
    const currentYear = new Date().getFullYear();

    return currentYear - earliestYear;
  }

  /**
   * Generate highlights from CV
   */
  generateHighlights(data) {
    const highlights = [];
    const { experience, education, certifications, skills } = data;

    if (experience.length > 0) {
      const years = this.calculateYearsOfExperience(experience);
      if (years > 0) {
        highlights.push({
          icon: 'briefcase',
          title: 'Experience',
          value: `${years}+ Years`,
          order: 0,
        });
      }
    }

    if (education.length > 0) {
      highlights.push({
        icon: 'graduation-cap',
        title: 'Education',
        value: education[0].degree || 'Qualified',
        order: 1,
      });
    }

    if (certifications.length > 0) {
      highlights.push({
        icon: 'certificate',
        title: 'Certifications',
        value: `${certifications.length} Certified`,
        order: 2,
      });
    }

    if (skills.length > 0) {
      highlights.push({
        icon: 'code',
        title: 'Skills',
        value: `${skills.length}+ Skills`,
        order: 3,
      });
    }

    return highlights;
  }

  /**
   * Generate core values
   */
  generateValues(data) {
    const defaultValues = [
      {
        icon: 'target',
        title: 'Excellence',
        description: 'Committed to delivering high-quality work',
        order: 0,
      },
      {
        icon: 'lightbulb',
        title: 'Innovation',
        description: 'Always seeking creative solutions',
        order: 1,
      },
      {
        icon: 'users',
        title: 'Collaboration',
        description: 'Strong team player and communicator',
        order: 2,
      },
      {
        icon: 'trending-up',
        title: 'Growth',
        description: 'Continuous learning and development',
        order: 3,
      },
    ];

    return defaultValues;
  }

  /**
   * Generate identity cards
   */
  generateIdentityCards(data) {
    const cards = [];
    const { skills, experience, personalInfo } = data;

    if (skills.length > 0) {
      cards.push({
        label: 'Specialty',
        value: skills[0],
        order: 0,
      });
    }

    if (experience.length > 0) {
      cards.push({
        label: 'Current Role',
        value: experience[0].title,
        order: 1,
      });
    }

    if (personalInfo.location) {
      cards.push({
        label: 'Location',
        value: personalInfo.location,
        order: 2,
      });
    }

    cards.push({
      label: 'Availability',
      value: 'Open to opportunities',
      order: 3,
    });

    return cards;
  }

  /**
   * Categorize skills into groups
   */
  categorizeSkills(skills) {
    const categories = {
      'Technical Skills': [],
      'Professional Skills': [],
      'Tools & Technologies': [],
      'Soft Skills': [],
    };

    const technicalKeywords = ['programming', 'development', 'engineering', 'software', 'hardware', 'database', 'network', 'system'];
    const toolsKeywords = ['microsoft', 'adobe', 'google', 'aws', 'azure', 'docker', 'kubernetes', 'git'];
    const softKeywords = ['communication', 'leadership', 'teamwork', 'problem', 'analytical', 'management', 'planning'];

    skills.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      
      if (softKeywords.some(kw => lowerSkill.includes(kw))) {
        categories['Soft Skills'].push(skill);
      } else if (toolsKeywords.some(kw => lowerSkill.includes(kw))) {
        categories['Tools & Technologies'].push(skill);
      } else if (technicalKeywords.some(kw => lowerSkill.includes(kw))) {
        categories['Technical Skills'].push(skill);
      } else {
        categories['Professional Skills'].push(skill);
      }
    });

    // Remove empty categories
    Object.keys(categories).forEach(key => {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    });

    return categories;
  }

  /**
   * Infer skill proficiency level
   */
  inferProficiency(skills, experience) {
    // Default to intermediate
    return 'Intermediate';
  }

  /**
   * Infer years of skill experience
   */
  inferSkillYears(skills, experience) {
    // Could be enhanced to check if skill mentioned in experience
    const years = this.calculateYearsOfExperience(experience);
    return Math.min(years, 10) || 1;
  }

  /**
   * Format description array to string
   */
  formatDescription(descriptions) {
    if (Array.isArray(descriptions)) {
      return descriptions.join('\n\n');
    }
    return descriptions || '';
  }

  /**
   * Extract technologies from text
   */
  extractTechnologies(textArray) {
    const text = Array.isArray(textArray) ? textArray.join(' ') : textArray;
    const commonTech = [
      'JavaScript', 'Python', 'Java', 'C++', 'React', 'Angular', 'Vue',
      'Node.js', 'Django', 'Flask', 'SQL', 'MongoDB', 'PostgreSQL',
      'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'Linux'
    ];

    return commonTech.filter(tech => 
      text.toLowerCase().includes(tech.toLowerCase())
    );
  }

  /**
   * Infer employment type
   */
  inferEmploymentType(experience) {
    const text = experience.description.join(' ').toLowerCase();
    
    if (text.includes('intern')) return 'Internship';
    if (text.includes('contract')) return 'Contract';
    if (text.includes('freelance')) return 'Freelance';
    if (text.includes('part-time')) return 'Part-time';
    
    return 'Full-time';
  }

  /**
   * Extract field of study from degree
   */
  extractFieldOfStudy(degree) {
    if (!degree) return null;
    
    const fields = [
      'Engineering', 'Computer Science', 'Business', 'Medicine',
      'Law', 'Arts', 'Science', 'Education', 'Design'
    ];

    for (const field of fields) {
      if (degree.toLowerCase().includes(field.toLowerCase())) {
        return field;
      }
    }

    return 'General Studies';
  }

  /**
   * Extract skills from certification name
   */
  extractSkillsFromCertification(certName) {
    const skills = [];
    const commonSkills = [
      'AWS', 'Azure', 'Google Cloud', 'PMP', 'Agile', 'Scrum',
      'Java', 'Python', 'JavaScript', 'React', 'Angular'
    ];

    commonSkills.forEach(skill => {
      if (certName.toLowerCase().includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    });

    return skills;
  }

  /**
   * Categorize achievement
   */
  categorizeAchievement(title) {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('award')) return 'Award';
    if (lowerTitle.includes('certification')) return 'Certification';
    if (lowerTitle.includes('project')) return 'Project';
    if (lowerTitle.includes('team') || lowerTitle.includes('lead')) return 'Leadership';
    
    return 'Professional';
  }

  /**
   * Format date to ISO string
   */
  formatDate(dateStr) {
    if (!dateStr) return null;
    
    // If already a year
    if (/^\d{4}$/.test(dateStr)) {
      return `${dateStr}-01-01`;
    }

    // Try to parse as date
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Ignore
    }

    return dateStr;
  }

  /**
   * Select icon for hobby
   */
  selectIconForHobby(hobby) {
    const hobbyMap = {
      'reading': 'book',
      'swimming': 'activity',
      'music': 'music',
      'sports': 'award',
      'travel': 'map',
      'photography': 'camera',
      'cooking': 'coffee',
      'gaming': 'gamepad',
    };

    const lowerHobby = hobby.toLowerCase();
    for (const [key, icon] of Object.entries(hobbyMap)) {
      if (lowerHobby.includes(key)) return icon;
    }

    return 'star';
  }

  /**
   * Select icon for skill category
   */
  selectIconForSkillCategory(category) {
    const categoryMap = {
      'Technical Skills': 'code',
      'Professional Skills': 'briefcase',
      'Tools & Technologies': 'tool',
      'Soft Skills': 'users',
    };

    return categoryMap[category] || 'star';
  }

  /**
   * Select icon for achievement
   */
  selectIconForAchievement(title) {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('award')) return 'award';
    if (lowerTitle.includes('certificate')) return 'certificate';
    if (lowerTitle.includes('project')) return 'folder';
    if (lowerTitle.includes('team')) return 'users';
    
    return 'star';
  }
}

module.exports = new CVMapperService();
