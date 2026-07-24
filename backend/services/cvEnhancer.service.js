/**
 * CV Enhancer Service
 * 
 * AI-powered content enhancement for imported CV data.
 * Improves descriptions, extracts keywords, optimizes for SEO.
 */

class CVEnhancerService {
  /**
   * Enhance all CV sections with AI improvements
   * @param {Object} mappedData - Mapped CV data from cvMapper
   * @returns {Object} - Enhanced CV data
   */
  enhanceCV(mappedData) {
    return {
      hero: this.enhanceHero(mappedData.hero),
      about: this.enhanceAbout(mappedData.about),
      skills: this.enhanceSkills(mappedData.skills),
      experience: this.enhanceExperience(mappedData.experience),
      education: this.enhanceEducation(mappedData.education),
      certifications: this.enhanceCertifications(mappedData.certifications),
      achievements: this.enhanceAchievements(mappedData.achievements),
      projects: this.enhanceProjects(mappedData.projects),
      social: mappedData.social, // No enhancement needed
      settings: this.enhanceSettings(mappedData.settings),
    };
  }

  /**
   * Enhance Hero section
   */
  enhanceHero(hero) {
    return {
      ...hero,
      greeting: this.enhanceGreeting(hero.greeting),
      title: this.enhanceTitle(hero.title),
      description: this.enhanceDescription(hero.description, 'hero'),
      keywords: this.extractKeywords(hero.description),
    };
  }

  /**
   * Enhance About section
   */
  enhanceAbout(about) {
    return {
      ...about,
      bio: this.enhanceBio(about.bio),
      highlights: about.highlights.map(h => ({
        ...h,
        title: this.capitalizeWords(h.title),
      })),
      values: about.values.map(v => ({
        ...v,
        title: this.capitalizeWords(v.title),
        description: this.enhanceDescription(v.description, 'value'),
      })),
      keywords: this.extractKeywords(about.bio),
    };
  }

  /**
   * Enhance Skills
   */
  enhanceSkills(skills) {
    return skills.map(skill => ({
      ...skill,
      name: this.normalizeSkillName(skill.name),
      category: this.enhanceSkillCategory(skill.category),
      proficiency: this.enhanceProficiency(skill.proficiency, skill.name),
      keywords: this.extractSkillKeywords(skill.name),
      description: this.generateSkillDescription(skill.name, skill.proficiency),
    }));
  }

  /**
   * Enhance Experience
   */
  enhanceExperience(experience) {
    return experience.map(exp => ({
      ...exp,
      position: this.enhanceJobTitle(exp.position),
      company: this.enhanceCompanyName(exp.company),
      description: this.enhanceJobDescription(exp.description),
      responsibilities: this.enhanceResponsibilities(exp.responsibilities),
      achievements: this.enhanceAchievements(exp.achievements),
      keywords: this.extractJobKeywords(exp.position, exp.description),
      industry: this.inferIndustry(exp.company, exp.position),
    }));
  }

  /**
   * Enhance Education
   */
  enhanceEducation(education) {
    return education.map(edu => ({
      ...edu,
      degree: this.enhanceDegree(edu.degree),
      institution: this.enhanceInstitution(edu.institution),
      field: this.enhanceFieldOfStudy(edu.field),
      description: edu.description ? this.enhanceDescription(edu.description, 'education') : null,
      keywords: this.extractEducationKeywords(edu.degree, edu.field),
    }));
  }

  /**
   * Enhance Certifications
   */
  enhanceCertifications(certifications) {
    return certifications.map(cert => ({
      ...cert,
      title: this.enhanceCertificationTitle(cert.title),
      issuer: this.enhanceIssuer(cert.issuer),
      description: this.generateCertificationDescription(cert.title, cert.issuer),
      skills: this.extractCertificationSkills(cert.title),
      keywords: this.extractKeywords(cert.title),
      category: this.categorizeCertification(cert.title),
    }));
  }

  /**
   * Enhance Achievements
   */
  enhanceAchievements(achievements) {
    return achievements.map(ach => ({
      ...ach,
      title: this.enhanceAchievementTitle(ach.title),
      description: this.enhanceAchievementDescription(ach.description || ach.title),
      impact: this.inferImpact(ach.title, ach.description),
      keywords: this.extractKeywords(ach.title),
    }));
  }

  /**
   * Enhance Projects
   */
  enhanceProjects(projects) {
    return projects.map(proj => ({
      ...proj,
      title: this.enhanceProjectTitle(proj.title),
      description: this.enhanceProjectDescription(proj.description),
      longDescription: this.enhanceLongDescription(proj.longDescription),
      technologies: this.enhanceTechnologies(proj.technologies),
      keywords: this.extractProjectKeywords(proj.title, proj.description, proj.technologies),
      complexity: this.inferComplexity(proj.technologies, proj.description),
    }));
  }

  /**
   * Enhance Settings
   */
  enhanceSettings(settings) {
    return {
      ...settings,
      site_description: this.enhanceSEODescription(settings.site_description),
      keywords: this.extractKeywords(settings.site_description),
    };
  }

  // ==================== ENHANCEMENT METHODS ====================

  /**
   * Enhance greeting with personality
   */
  enhanceGreeting(greeting) {
    const enhanced = {
      'Hello': 'Hello! 👋',
      'Hi there': 'Hi there! 👋',
      'Welcome': 'Welcome! 🎉',
      'Hey': 'Hey! 👋',
      'Greetings': 'Greetings! 🌟',
    };
    
    return enhanced[greeting] || greeting;
  }

  /**
   * Enhance professional title
   */
  enhanceTitle(title) {
    if (!title) return title;

    // Add descriptive adjectives
    const enhancements = {
      'Developer': 'Full Stack Developer',
      'Engineer': 'Software Engineer',
      'Designer': 'Creative Designer',
      'Manager': 'Project Manager',
      'Analyst': 'Data Analyst',
      'Consultant': 'Technical Consultant',
    };

    for (const [key, enhanced] of Object.entries(enhancements)) {
      if (title.toLowerCase().includes(key.toLowerCase()) && !title.includes('Full Stack') && !title.includes('Senior')) {
        return enhanced;
      }
    }

    return title;
  }

  /**
   * Enhance description with better formatting and keywords
   */
  enhanceDescription(description, context) {
    if (!description) return description;

    let enhanced = description;

    // Remove redundant phrases
    enhanced = enhanced.replace(/\b(very|really|quite|extremely)\s+/gi, '');
    
    // Improve action words
    const improvements = {
      'worked on': 'developed',
      'did': 'executed',
      'made': 'created',
      'helped': 'assisted',
      'used': 'utilized',
      'good at': 'proficient in',
      'know': 'experienced with',
    };

    for (const [weak, strong] of Object.entries(improvements)) {
      enhanced = enhanced.replace(new RegExp(`\\b${weak}\\b`, 'gi'), strong);
    }

    // Add context-specific enhancements
    if (context === 'hero') {
      enhanced = this.addActionWords(enhanced);
    } else if (context === 'value') {
      enhanced = this.addImpactWords(enhanced);
    }

    return this.capitalizeFirstLetter(enhanced);
  }

  /**
   * Enhance bio with better structure
   */
  enhanceBio(bio) {
    if (!bio) return bio;

    let enhanced = bio;

    // Ensure it starts with an engaging opener
    if (!enhanced.match(/^(Passionate|Experienced|Dedicated|Skilled|Creative|Innovative)/)) {
      enhanced = `Passionate ${enhanced}`;
    }

    // Add professional tone
    enhanced = enhanced.replace(/\bI am\b/gi, 'I\'m');
    enhanced = enhanced.replace(/\bI have\b/gi, 'I\'ve');
    
    return this.enhanceDescription(enhanced, 'bio');
  }

  /**
   * Normalize skill names
   */
  normalizeSkillName(name) {
    const normalizations = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'py': 'Python',
      'css3': 'CSS3',
      'html5': 'HTML5',
      'nodejs': 'Node.js',
      'reactjs': 'React.js',
      'vuejs': 'Vue.js',
      'angularjs': 'Angular',
    };

    const normalized = normalizations[name.toLowerCase()];
    return normalized || this.capitalizeWords(name);
  }

  /**
   * Enhance skill category
   */
  enhanceSkillCategory(category) {
    const enhancements = {
      'technical': 'Technical Skills',
      'programming': 'Programming Languages',
      'framework': 'Frameworks & Libraries',
      'database': 'Database Technologies',
      'tool': 'Development Tools',
      'soft': 'Professional Skills',
    };

    for (const [key, enhanced] of Object.entries(enhancements)) {
      if (category.toLowerCase().includes(key)) {
        return enhanced;
      }
    }

    return this.capitalizeWords(category);
  }

  /**
   * Enhance proficiency level
   */
  enhanceProficiency(proficiency, skillName) {
    // Add context-based proficiency suggestions
    const expertSkills = ['html', 'css', 'javascript', 'communication', 'teamwork'];
    const intermediateSkills = ['react', 'python', 'java', 'sql'];

    if (proficiency === 'Intermediate') {
      if (expertSkills.some(skill => skillName.toLowerCase().includes(skill))) {
        return 'Advanced';
      }
    }

    return proficiency;
  }

  /**
   * Generate skill description
   */
  generateSkillDescription(skillName, proficiency) {
    const templates = {
      'Advanced': `Expert-level proficiency in ${skillName} with extensive hands-on experience.`,
      'Intermediate': `Solid working knowledge of ${skillName} with practical application experience.`,
      'Beginner': `Foundational knowledge of ${skillName} with growing expertise.`,
    };

    return templates[proficiency] || `Experienced with ${skillName}.`;
  }

  /**
   * Enhance job title
   */
  enhanceJobTitle(title) {
    if (!title) return title;

    // Capitalize properly
    return title.split(' ').map(word => {
      // Don't capitalize articles, prepositions, conjunctions unless they're the first word
      const lowercase = ['and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
      return lowercase.includes(word.toLowerCase()) ? word.toLowerCase() : this.capitalizeWords(word);
    }).join(' ');
  }

  /**
   * Enhance company name
   */
  enhanceCompanyName(name) {
    if (!name) return name;

    // Proper capitalization for companies
    return name.split(' ').map(word => {
      // Handle special cases
      if (word.toLowerCase() === 'llc') return 'LLC';
      if (word.toLowerCase() === 'inc') return 'Inc.';
      if (word.toLowerCase() === 'corp') return 'Corp.';
      if (word.toLowerCase() === 'ltd') return 'Ltd.';
      
      return this.capitalizeWords(word);
    }).join(' ');
  }

  /**
   * Enhance job description
   */
  enhanceJobDescription(description) {
    if (!description) return description;

    let enhanced = description;

    // Replace weak verbs with strong action verbs
    const actionVerbs = {
      'did': 'executed',
      'made': 'developed',
      'worked on': 'implemented',
      'helped with': 'contributed to',
      'was responsible for': 'managed',
      'took care of': 'oversaw',
      'dealt with': 'handled',
    };

    for (const [weak, strong] of Object.entries(actionVerbs)) {
      enhanced = enhanced.replace(new RegExp(`\\b${weak}\\b`, 'gi'), strong);
    }

    // Add metrics where possible
    enhanced = this.suggestMetrics(enhanced);

    return enhanced;
  }

  /**
   * Enhance responsibilities list
   */
  enhanceResponsibilities(responsibilities) {
    if (!Array.isArray(responsibilities)) return responsibilities;

    return responsibilities.map(resp => {
      let enhanced = resp;

      // Ensure starts with action verb
      if (!enhanced.match(/^(Developed|Implemented|Managed|Led|Created|Designed|Optimized|Collaborated)/)) {
        // Try to detect and replace weak starters
        enhanced = enhanced.replace(/^(Was|Did|Worked|Helped)/, 'Managed');
      }

      return this.enhanceDescription(enhanced, 'responsibility');
    });
  }

  /**
   * Enhance degree title
   */
  enhanceDegree(degree) {
    if (!degree) return degree;

    const degreeMap = {
      'bsc': 'Bachelor of Science',
      'ba': 'Bachelor of Arts',
      'msc': 'Master of Science',
      'ma': 'Master of Arts',
      'phd': 'Doctor of Philosophy',
      'diploma': 'Diploma',
      'certificate': 'Certificate',
    };

    const lower = degree.toLowerCase();
    for (const [abbr, full] of Object.entries(degreeMap)) {
      if (lower.includes(abbr)) {
        return degree.replace(new RegExp(abbr, 'gi'), full);
      }
    }

    return this.capitalizeWords(degree);
  }

  /**
   * Enhance institution name
   */
  enhanceInstitution(name) {
    if (!name) return name;

    // Capitalize properly
    return name.split(' ').map(word => {
      if (word.toLowerCase() === 'university') return 'University';
      if (word.toLowerCase() === 'college') return 'College';
      if (word.toLowerCase() === 'institute') return 'Institute';
      if (word.toLowerCase() === 'school') return 'School';
      
      return this.capitalizeWords(word);
    }).join(' ');
  }

  /**
   * Enhance field of study
   */
  enhanceFieldOfStudy(field) {
    if (!field) return field;

    const fieldMap = {
      'computer science': 'Computer Science',
      'information technology': 'Information Technology',
      'software engineering': 'Software Engineering',
      'business administration': 'Business Administration',
      'mechanical engineering': 'Mechanical Engineering',
      'electrical engineering': 'Electrical Engineering',
    };

    const normalized = fieldMap[field.toLowerCase()] || this.capitalizeWords(field);
    return normalized;
  }

  /**
   * Enhance certification title
   */
  enhanceCertificationTitle(title) {
    if (!title) return title;

    // Handle common abbreviations
    const abbreviations = {
      'aws': 'AWS',
      'pmp': 'PMP',
      'cissp': 'CISSP',
      'ccna': 'CCNA',
      'mcse': 'MCSE',
      'oracle': 'Oracle',
      'microsoft': 'Microsoft',
      'google': 'Google',
    };

    let enhanced = title;
    for (const [abbr, full] of Object.entries(abbreviations)) {
      enhanced = enhanced.replace(new RegExp(`\\b${abbr}\\b`, 'gi'), full);
    }

    return this.capitalizeWords(enhanced);
  }

  /**
   * Enhance issuer name
   */
  enhanceIssuer(issuer) {
    if (!issuer) return 'Certified Organization';

    const issuers = {
      'aws': 'Amazon Web Services (AWS)',
      'microsoft': 'Microsoft Corporation',
      'google': 'Google LLC',
      'oracle': 'Oracle Corporation',
      'cisco': 'Cisco Systems',
      'pmi': 'Project Management Institute (PMI)',
    };

    const enhanced = issuers[issuer.toLowerCase()] || this.capitalizeWords(issuer);
    return enhanced;
  }

  /**
   * Generate certification description
   */
  generateCertificationDescription(title, issuer) {
    return `Professional certification in ${title} issued by ${issuer}, demonstrating expertise and industry-recognized skills.`;
  }

  /**
   * Categorize certification
   */
  categorizeCertification(title) {
    const categories = {
      'Cloud': ['aws', 'azure', 'gcp', 'cloud'],
      'Project Management': ['pmp', 'agile', 'scrum', 'project'],
      'Security': ['cissp', 'security', 'ethical', 'penetration'],
      'Networking': ['ccna', 'network', 'routing', 'switching'],
      'Database': ['oracle', 'sql', 'database', 'dba'],
      'Programming': ['java', 'python', 'javascript', 'developer'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => title.toLowerCase().includes(keyword))) {
        return category;
      }
    }

    return 'Professional';
  }

  /**
   * Enhance achievement title
   */
  enhanceAchievementTitle(title) {
    if (!title) return title;

    // Ensure proper capitalization
    return this.capitalizeWords(title);
  }

  /**
   * Enhance achievement description
   */
  enhanceAchievementDescription(description) {
    if (!description) return description;

    let enhanced = description;

    // Add impact words
    const impactWords = ['Successfully', 'Effectively', 'Significantly'];
    if (!impactWords.some(word => enhanced.includes(word))) {
      enhanced = `Successfully ${enhanced}`;
    }

    return this.enhanceDescription(enhanced, 'achievement');
  }

  /**
   * Infer achievement impact
   */
  inferImpact(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.match(/\d+%|\bincrease|\bimprove|\boptimiz/)) return 'High';
    if (text.match(/\bteam|\blead|\bmanag/)) return 'Medium';
    
    return 'Standard';
  }

  /**
   * Enhance project title
   */
  enhanceProjectTitle(title) {
    if (!title) return title;

    // Remove generic words and enhance
    let enhanced = title.replace(/\bproject\b/gi, '').trim();
    
    return this.capitalizeWords(enhanced) || title;
  }

  /**
   * Enhance project description
   */
  enhanceProjectDescription(description) {
    if (!description) return description;

    let enhanced = description;

    // Add technical context
    if (!enhanced.match(/\b(Built|Developed|Created|Designed)\b/)) {
      enhanced = `Developed ${enhanced}`;
    }

    return this.enhanceDescription(enhanced, 'project');
  }

  /**
   * Enhance long description
   */
  enhanceLongDescription(longDescription) {
    if (!longDescription) return longDescription;

    // Split into paragraphs and enhance each
    const paragraphs = longDescription.split('\n\n');
    
    return paragraphs.map(paragraph => 
      this.enhanceDescription(paragraph, 'project')
    ).join('\n\n');
  }

  /**
   * Enhance technologies list
   */
  enhanceTechnologies(technologies) {
    if (!Array.isArray(technologies)) return technologies;

    return technologies.map(tech => this.normalizeSkillName(tech));
  }

  /**
   * Infer project complexity
   */
  inferComplexity(technologies, description) {
    const techCount = technologies?.length || 0;
    const text = description?.toLowerCase() || '';
    
    if (techCount >= 5 || text.includes('microservice') || text.includes('distributed')) {
      return 'High';
    }
    if (techCount >= 3 || text.includes('api') || text.includes('database')) {
      return 'Medium';
    }
    
    return 'Standard';
  }

  /**
   * Enhance SEO description
   */
  enhanceSEODescription(description) {
    if (!description) return description;

    let enhanced = description;

    // Ensure it's within SEO limits (150-160 characters)
    if (enhanced.length > 160) {
      enhanced = enhanced.substring(0, 157) + '...';
    }

    // Add call to action if missing
    if (!enhanced.match(/\b(portfolio|work|projects|contact|hire)\b/i)) {
      enhanced += ' View my portfolio and get in touch.';
    }

    return enhanced;
  }

  // ==================== KEYWORD EXTRACTION ====================

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    if (!text) return [];

    // Remove common stop words
    const stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'will', 'with', 'have', 'this', 'they', 'we', 'you'
    ]);

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates

    // Return top 10 keywords
    return words.slice(0, 10);
  }

  /**
   * Extract skill-specific keywords
   */
  extractSkillKeywords(skillName) {
    const skillMap = {
      'JavaScript': ['js', 'frontend', 'backend', 'web development'],
      'React': ['jsx', 'component', 'frontend', 'ui'],
      'Node.js': ['nodejs', 'backend', 'api', 'server'],
      'Python': ['programming', 'scripting', 'automation', 'data'],
      'SQL': ['database', 'query', 'data analysis'],
    };

    return skillMap[skillName] || [skillName.toLowerCase()];
  }

  /**
   * Extract job-related keywords
   */
  extractJobKeywords(title, description) {
    const keywords = this.extractKeywords(`${title} ${description}`);
    
    // Add industry-specific terms
    const industryTerms = [
      'software', 'development', 'programming', 'engineering', 'technology',
      'management', 'leadership', 'project', 'team', 'agile', 'scrum'
    ];

    const text = `${title} ${description}`.toLowerCase();
    industryTerms.forEach(term => {
      if (text.includes(term) && !keywords.includes(term)) {
        keywords.push(term);
      }
    });

    return keywords.slice(0, 15);
  }

  /**
   * Extract education keywords
   */
  extractEducationKeywords(degree, field) {
    const keywords = [];
    
    if (degree) keywords.push(...this.extractKeywords(degree));
    if (field) keywords.push(...this.extractKeywords(field));
    
    // Add educational terms
    const eduTerms = ['education', 'academic', 'study', 'research', 'learning'];
    keywords.push(...eduTerms);
    
    return [...new Set(keywords)].slice(0, 10);
  }

  /**
   * Extract project keywords
   */
  extractProjectKeywords(title, description, technologies) {
    const keywords = [];
    
    keywords.push(...this.extractKeywords(`${title} ${description}`));
    
    if (Array.isArray(technologies)) {
      keywords.push(...technologies.map(tech => tech.toLowerCase()));
    }
    
    return [...new Set(keywords)].slice(0, 20);
  }

  /**
   * Extract certification skills
   */
  extractCertificationSkills(title) {
    const skillMap = {
      'AWS': ['cloud computing', 'amazon web services', 'devops'],
      'PMP': ['project management', 'leadership', 'planning'],
      'Scrum': ['agile', 'project management', 'teamwork'],
      'Java': ['programming', 'object-oriented', 'backend'],
      'Security': ['cybersecurity', 'network security', 'compliance'],
    };

    for (const [key, skills] of Object.entries(skillMap)) {
      if (title.includes(key)) {
        return skills;
      }
    }

    return this.extractKeywords(title);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Capitalize first letter of string
   */
  capitalizeFirstLetter(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Capitalize words properly
   */
  capitalizeWords(str) {
    if (!str) return str;
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  /**
   * Add action words to text
   */
  addActionWords(text) {
    if (!text) return text;

    const actionWords = ['driven', 'focused', 'passionate', 'dedicated', 'committed'];
    const randomAction = actionWords[Math.floor(Math.random() * actionWords.length)];
    
    if (!actionWords.some(word => text.toLowerCase().includes(word))) {
      return `${this.capitalizeFirstLetter(randomAction)} ${text.toLowerCase()}`;
    }
    
    return text;
  }

  /**
   * Add impact words
   */
  addImpactWords(text) {
    if (!text) return text;

    const impactWords = ['delivering', 'achieving', 'creating', 'building', 'driving'];
    const randomImpact = impactWords[Math.floor(Math.random() * impactWords.length)];
    
    if (!impactWords.some(word => text.toLowerCase().includes(word))) {
      return text.replace(/\b(provide|give|make)\b/gi, randomImpact);
    }
    
    return text;
  }

  /**
   * Suggest metrics for descriptions
   */
  suggestMetrics(text) {
    if (!text) return text;

    // Look for opportunities to add metrics
    const metricSuggestions = {
      'improved': 'improved by X%',
      'increased': 'increased by X%',
      'reduced': 'reduced by X%',
      'managed team': 'managed team of X members',
      'completed projects': 'completed X+ projects',
    };

    let enhanced = text;
    for (const [pattern, suggestion] of Object.entries(metricSuggestions)) {
      if (enhanced.toLowerCase().includes(pattern) && !enhanced.includes('X')) {
        enhanced = enhanced.replace(new RegExp(pattern, 'gi'), suggestion);
        break; // Only add one metric suggestion
      }
    }

    return enhanced;
  }

  /**
   * Infer industry from company and position
   */
  inferIndustry(company, position) {
    const text = `${company} ${position}`.toLowerCase();
    
    const industries = {
      'Technology': ['tech', 'software', 'digital', 'IT', 'computer'],
      'Healthcare': ['health', 'medical', 'hospital', 'clinic'],
      'Finance': ['bank', 'finance', 'investment', 'insurance'],
      'Education': ['university', 'school', 'education', 'academic'],
      'Manufacturing': ['manufacturing', 'production', 'factory'],
      'Consulting': ['consulting', 'advisory', 'services'],
    };

    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return industry;
      }
    }

    return 'General';
  }
}

module.exports = new CVEnhancerService();