/**
 * AI Document Parser Service
 *
 * Replaces the old regex-based cvParser + cvMapper + cvEnhancer pipeline
 * with a single Gemini AI call that reads the full document, understands it,
 * and outputs structured JSON matching the exact database schemas.
 *
 * Supports: CVs, Recommendation Letters, and general attachments.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIDocumentParserService {
  constructor() {
    this.genAI = null;
    this.model = null;
  }

  /**
   * Lazily initialise the Gemini client (so the module can be required even
   * before the env var is set – e.g. during tests).
   */
  _ensureClient() {
    if (this.model) return;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not set. Add it to your .env file. ' +
        'Get a free key at https://aistudio.google.com'
      );
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,       // Low temperature for accuracy
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Database schema definitions (used inside the prompt so the AI
  // knows the exact column names, types and constraints).
  // ─────────────────────────────────────────────────────────────

  get SCHEMAS() {
    return {
      experience: {
        description: 'Work / professional experience entries',
        fields: {
          company:           { type: 'string', required: true,  note: 'Company / organisation name' },
          position:          { type: 'string', required: true,  note: 'Job title / position held' },
          employment_type:   { type: 'string', required: false, note: 'Full-time | Part-time | Contract | Internship | Freelance' },
          location:          { type: 'string', required: false, note: 'City, Country' },
          work_mode:         { type: 'string', required: false, note: 'On-site | Remote | Hybrid' },
          department:        { type: 'string', required: false, note: 'Department within the company' },
          industry:          { type: 'string', required: false, note: 'Industry sector' },
          start_date:        { type: 'string', required: true,  note: 'YYYY-MM-DD format. If only year is known use YYYY-01-01' },
          end_date:          { type: 'string', required: false, note: 'YYYY-MM-DD format or null if current' },
          is_current:        { type: 'boolean', required: true, note: 'true if "Present" / "Current" / ongoing' },
          short_summary:     { type: 'string', required: false, note: 'One-sentence summary of the role' },
          full_description:  { type: 'string', required: false, note: 'Detailed description of the role' },
          responsibilities:  { type: 'array of strings', required: false, note: 'Key responsibilities. Each item is a single responsibility sentence.' },
          achievements:      { type: 'array of strings', required: false, note: 'Quantified achievements. Each item is a single achievement sentence.' },
          key_contributions: { type: 'array of strings', required: false, note: 'Key contributions made' },
          associated_skills: { type: 'array of strings', required: false, note: 'Skills used in this role' },
          status:            { type: 'string', required: true,  note: 'Always set to "published"' },
          featured:          { type: 'boolean', required: true, note: 'true for the 3 most recent roles' },
          order:             { type: 'integer', required: true, note: '0 for the most recent, incrementing' },
        },
      },

      education: {
        description: 'Academic education entries',
        fields: {
          degree:              { type: 'string', required: true,  note: 'Degree name, e.g. "Master of Science"' },
          institution:         { type: 'string', required: true,  note: 'University / school name' },
          institution_type:    { type: 'string', required: false, note: 'University | College | Institute | School' },
          field_of_study:      { type: 'string', required: true,  note: 'Field / major, e.g. "Biomedical Engineering"' },
          specialization:      { type: 'string', required: false, note: 'Specialization within the field' },
          faculty:             { type: 'string', required: false, note: 'Faculty name' },
          department:          { type: 'string', required: false, note: 'Department name' },
          start_date:          { type: 'string', required: true,  note: 'YYYY-MM-DD format' },
          end_date:            { type: 'string', required: false, note: 'YYYY-MM-DD format or null if current' },
          is_current:          { type: 'boolean', required: true, note: 'true if still studying' },
          grade:               { type: 'string', required: false, note: 'Grade / classification' },
          gpa:                 { type: 'string', required: false, note: 'GPA if available' },
          honors:              { type: 'string', required: false, note: 'Honors e.g. cum laude' },
          short_summary:       { type: 'string', required: false, note: 'Brief summary' },
          full_description:    { type: 'string', required: false, note: 'Detailed description' },
          coursework:          { type: 'array of strings', required: false, note: 'Key courses taken' },
          achievements:        { type: 'array of strings', required: false, note: 'Academic achievements' },
          activities:          { type: 'array of strings', required: false, note: 'Extra-curricular activities' },
          research_title:      { type: 'string', required: false, note: 'Research / thesis title' },
          research_description:{ type: 'string', required: false, note: 'Research description' },
          research_supervisor: { type: 'string', required: false, note: 'Supervisor name' },
          status:              { type: 'string', required: true,  note: 'Always "published"' },
          featured:            { type: 'boolean', required: true, note: 'true for the highest / most recent degree' },
          order:               { type: 'integer', required: true, note: '0 for most recent, incrementing' },
        },
      },

      skills: {
        description: 'Individual skill entries',
        fields: {
          name:        { type: 'string', required: true,  note: 'Skill name, properly capitalised' },
          category:    { type: 'string', required: false, note: 'Category, e.g. "Programming Languages", "Frameworks", "Soft Skills", "Tools"' },
          proficiency: { type: 'integer', required: false, note: 'Proficiency 1-100. Estimate based on context (expert→90, intermediate→60, beginner→30)' },
          order:       { type: 'integer', required: true, note: 'Sequential order starting from 0' },
        },
      },

      certifications: {
        description: 'Professional certifications and licenses',
        fields: {
          certification_name:     { type: 'string', required: true,  note: 'Full certification name' },
          issuing_organization:   { type: 'string', required: true,  note: 'Organization that issued it' },
          category:               { type: 'string', required: false, note: 'Category: Cloud | Security | Project Management | Programming | Data | Other' },
          issue_date:             { type: 'string', required: false, note: 'YYYY-MM-DD or YYYY-MM or YYYY' },
          expiration_date:        { type: 'string', required: false, note: 'YYYY-MM-DD or null' },
          does_not_expire:        { type: 'boolean', required: false, note: 'true if the cert does not expire' },
          credential_id:          { type: 'string', required: false, note: 'Credential / certificate ID' },
          credential_url:         { type: 'string', required: false, note: 'URL to verify the credential' },
          short_description:      { type: 'string', required: false, note: 'Brief description of the certification' },
          skills_covered:         { type: 'string', required: false, note: 'Comma-separated skills covered' },
          status:                 { type: 'string', required: true,  note: 'Always "published"' },
          featured:               { type: 'boolean', required: true, note: 'true for the first 5' },
          order:                  { type: 'integer', required: true, note: '0-based sequential order' },
        },
      },

      achievements: {
        description: 'Awards, honors, accomplishments',
        fields: {
          title:             { type: 'string', required: true,  note: 'Achievement title' },
          category:          { type: 'string', required: false, note: 'Award | Honor | Recognition | Leadership | Project' },
          short_description: { type: 'string', required: false, note: 'Brief description' },
          full_description:  { type: 'string', required: false, note: 'Detailed description' },
          date:              { type: 'string', required: false, note: 'Date or year' },
          organization:      { type: 'string', required: false, note: 'Awarding organization' },
          location:          { type: 'string', required: false, note: 'Location' },
          impact:            { type: 'string', required: false, note: 'Impact / significance' },
          status:            { type: 'string', required: true,  note: 'Always "published"' },
          featured:          { type: 'boolean', required: true, note: 'true for first 6' },
          order:             { type: 'integer', required: true, note: '0-based' },
        },
      },

      projects: {
        description: 'Portfolio projects',
        fields: {
          title:        { type: 'string', required: true,  note: 'Project title' },
          slug:         { type: 'string', required: true,  note: 'URL-friendly slug, lowercase with hyphens' },
          description:  { type: 'string', required: true,  note: 'Short description (1-2 sentences)' },
          content:      { type: 'string', required: false, note: 'Long-form content / write-up' },
          category:     { type: 'string', required: false, note: 'Project category' },
          project_type: { type: 'string', required: false, note: 'Type: Web App | Mobile App | API | Research | Other' },
          start_date:   { type: 'string', required: false, note: 'YYYY-MM-DD or null' },
          end_date:     { type: 'string', required: false, note: 'YYYY-MM-DD or null' },
          problem:      { type: 'string', required: false, note: 'Problem statement' },
          solution:     { type: 'string', required: false, note: 'Solution summary' },
          my_role:      { type: 'string', required: false, note: 'Role in the project' },
          technologies: { type: 'array of strings', required: false, note: 'Technologies used' },
          features:     { type: 'array of strings', required: false, note: 'Key features' },
          outcomes:     { type: 'string', required: false, note: 'Outcomes / results' },
          status:       { type: 'string', required: true,  note: 'Always "published"' },
          featured:     { type: 'boolean', required: true, note: 'true for first 3' },
        },
      },

      testimonials: {
        description: 'Recommendations / testimonials from colleagues, managers, clients',
        fields: {
          author_name:   { type: 'string', required: true,  note: 'Name of the person giving the testimonial' },
          author_title:  { type: 'string', required: false, note: 'Their job title' },
          company:       { type: 'string', required: false, note: 'Their company' },
          relationship:  { type: 'string', required: false, note: 'Relationship: Manager | Colleague | Client | Professor | Mentor' },
          content:       { type: 'string', required: true,  note: 'The testimonial / recommendation text' },
          status:        { type: 'string', required: true,  note: 'Always "published"' },
          featured:      { type: 'boolean', required: true, note: 'true for first 3' },
          order:         { type: 'integer', required: true, note: '0-based' },
        },
      },

      social: {
        description: 'Social media / contact links',
        fields: {
          platform_name: { type: 'string', required: true,  note: 'Platform: LinkedIn | GitHub | Twitter | Email | Phone | Website' },
          url:           { type: 'string', required: true,  note: 'Full URL (mailto: for email, tel: for phone)' },
          username:      { type: 'string', required: false, note: 'Username or identifier' },
          display_order: { type: 'integer', required: true, note: '0-based' },
          is_active:     { type: 'boolean', required: true, note: 'Always true' },
        },
      },
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  Public API
  // ─────────────────────────────────────────────────────────────

  /**
   * Parse a document using Gemini AI.
   *
   * @param {string} extractedText – The full text extracted from the document.
   * @param {string} documentType  – "cv" | "recommendation" | "auto" (default "auto").
   * @returns {Promise<Object>} – { documentType, data: { experience, education, ... } }
   */
  async parseDocument(extractedText, documentType = 'auto') {
    this._ensureClient();

    if (!extractedText || extractedText.trim().length < 20) {
      throw new Error('Document text is too short or empty. Please upload a valid document.');
    }

    const prompt = this._buildPrompt(extractedText, documentType);

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse the JSON response
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (jsonErr) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1].trim());
        } else {
          console.error('AI returned non-JSON:', text.substring(0, 500));
          throw new Error('AI returned invalid JSON. Please try again.');
        }
      }

      // Validate and sanitise the output
      const sanitised = this._sanitiseOutput(parsed);

      return sanitised;
    } catch (error) {
      console.error('Gemini AI parsing error:', error);

      if (error.message?.includes('API key')) {
        throw new Error('Invalid Gemini API key. Check your GEMINI_API_KEY in .env');
      }
      if (error.message?.includes('quota')) {
        throw new Error('Gemini API quota exceeded. Please try again later.');
      }

      throw new Error(`AI parsing failed: ${error.message}`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  Prompt construction
  // ─────────────────────────────────────────────────────────────

  _buildPrompt(text, documentType) {
    const schemaStr = JSON.stringify(this.SCHEMAS, null, 2);

    return `You are an expert document analyst for a professional portfolio website.

Your task: Read the document below, understand ALL of it, and extract EVERY piece of relevant information into structured JSON that matches the database schemas provided.

## DOCUMENT TYPE
${documentType === 'auto'
  ? 'Auto-detect the document type. It could be a CV/Resume, a Recommendation Letter, or another professional document.'
  : `This document is a ${documentType === 'cv' ? 'CV / Resume' : 'Recommendation Letter'}.`
}

## CRITICAL RULES
1. **Extract EVERYTHING.** Do not skip or summarise. Every job, every degree, every skill, every certification mentioned must be captured.
2. **Dates MUST be in YYYY-MM-DD format.** If only the year is known, use YYYY-01-01. If month and year are known, use YYYY-MM-01. If a date says "Present" or "Current", set end_date to null and is_current to true.
3. **Status must always be "published"** for all records.
4. **Proficiency for skills** must be an integer 1-100. Estimate intelligently: if the CV shows years of experience with a skill → 80-95, if it's listed without elaboration → 50-70, if marked as beginner → 20-40.
5. **Slugs** must be URL-friendly: lowercase, hyphens instead of spaces, no special characters.
6. **Do NOT invent data.** Only extract what is actually in the document. If a field is not mentioned, set it to null or omit it.
7. **Order fields:** Most recent items first (order: 0), then incrementing.
8. **For Recommendation Letters:** Extract the recommender's name, title, company, and the full recommendation text into the testimonials section. Also extract any skills, achievements, or experience details mentioned.

## DATABASE SCHEMAS
Each top-level key in your output must be an array of objects matching these schemas:

${schemaStr}

## OUTPUT FORMAT
Return a single JSON object with this exact structure:
{
  "documentType": "cv" | "recommendation" | "other",
  "summary": "A brief 1-2 sentence summary of what was extracted",
  "data": {
    "experience": [...],
    "education": [...],
    "skills": [...],
    "certifications": [...],
    "achievements": [...],
    "projects": [...],
    "testimonials": [...],
    "social": [...]
  }
}

Only include sections that have data. Empty arrays should be omitted.
The "data" object must contain ONLY the keys listed above.

## DOCUMENT TEXT
---BEGIN DOCUMENT---
${text}
---END DOCUMENT---

Now parse the document and return the structured JSON.`;
  }

  // ─────────────────────────────────────────────────────────────
  //  Output sanitisation & validation
  // ─────────────────────────────────────────────────────────────

  _sanitiseOutput(parsed) {
    const result = {
      documentType: parsed.documentType || 'other',
      summary: parsed.summary || 'Document parsed successfully',
      data: {},
    };

    const data = parsed.data || parsed;

    // Process each section through its validator
    const sectionKeys = [
      'experience', 'education', 'skills', 'certifications',
      'achievements', 'projects', 'testimonials', 'social',
    ];

    for (const key of sectionKeys) {
      if (data[key] && Array.isArray(data[key]) && data[key].length > 0) {
        result.data[key] = data[key].map((item, idx) =>
          this._sanitiseRecord(item, key, idx)
        );
      }
    }

    return result;
  }

  _sanitiseRecord(record, sectionKey, index) {
    const schema = this.SCHEMAS[sectionKey];
    if (!schema) return record;

    const sanitised = {};

    for (const [field, spec] of Object.entries(schema.fields)) {
      let value = record[field];

      // Skip auto-generated fields
      if (field === 'id') continue;

      if (value === undefined || value === null) {
        if (spec.required && field === 'status') {
          sanitised[field] = 'published';
        } else if (spec.required && field === 'order') {
          sanitised[field] = index;
        } else if (spec.required && field === 'featured') {
          sanitised[field] = false;
        } else if (spec.required && field === 'is_active') {
          sanitised[field] = true;
        } else if (spec.required && field === 'is_current') {
          sanitised[field] = false;
        } else if (value === undefined && !spec.required) {
          // Skip optional missing fields
          continue;
        } else {
          sanitised[field] = null;
        }
        continue;
      }

      // Type coercion
      if (spec.type === 'integer' && typeof value !== 'number') {
        value = parseInt(value, 10);
        if (isNaN(value)) value = spec.required ? 0 : null;
      }

      if (spec.type === 'boolean' && typeof value !== 'boolean') {
        value = value === 'true' || value === true || value === 1;
      }

      if (spec.type === 'string' && typeof value !== 'string') {
        value = String(value);
      }

      if (spec.type === 'array of strings') {
        if (!Array.isArray(value)) {
          value = typeof value === 'string' ? [value] : [];
        }
        value = value.map(v => String(v));
      }

      // Clamp proficiency
      if (field === 'proficiency' && typeof value === 'number') {
        value = Math.max(1, Math.min(100, value));
      }

      // Ensure status is always published
      if (field === 'status') {
        value = 'published';
      }

      sanitised[field] = value;
    }

    return sanitised;
  }
}

module.exports = new AIDocumentParserService();
