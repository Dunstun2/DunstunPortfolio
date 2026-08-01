const { SchemaType } = require('@google/generative-ai');

const documentSchema = {
  type: SchemaType.OBJECT,
  properties: {
    documentType: { type: SchemaType.STRING, description: "Type of document, e.g. cv, recommendation, auto" },
    summary: { type: SchemaType.STRING, description: "Brief summary of the document" },
    experience: {
      type: SchemaType.ARRAY,
      description: "Work / professional experience entries",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          company: { type: SchemaType.STRING, description: "Company / organisation name" },
          position: { type: SchemaType.STRING, description: "Job title / position held" },
          employment_type: { type: SchemaType.STRING, description: "Full-time | Part-time | Contract | Internship | Freelance" },
          location: { type: SchemaType.STRING, description: "City, Country" },
          work_mode: { type: SchemaType.STRING, description: "On-site | Remote | Hybrid" },
          department: { type: SchemaType.STRING, description: "Department within the company" },
          industry: { type: SchemaType.STRING, description: "Industry sector" },
          start_date: { type: SchemaType.STRING, description: "YYYY-MM-DD format. If only year is known use YYYY-01-01" },
          end_date: { type: SchemaType.STRING, description: "YYYY-MM-DD format or null if current" },
          is_current: { type: SchemaType.BOOLEAN, description: "true if \"Present\" / \"Current\" / ongoing" },
          short_summary: { type: SchemaType.STRING, description: "One-sentence summary of the role" },
          full_description: { type: SchemaType.STRING, description: "Detailed description of the role" },
          responsibilities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Key responsibilities. Each item is a single responsibility sentence." },
          achievements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Quantified achievements. Each item is a single achievement sentence." },
          key_contributions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Key contributions made" },
          associated_skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Skills used in this role" },
          status: { type: SchemaType.STRING, description: "Always set to \"published\"" },
          featured: { type: SchemaType.BOOLEAN, description: "true for the 3 most recent roles" },
          order: { type: SchemaType.INTEGER, description: "0 for the most recent, incrementing" },
        }
      }
    },
    education: {
      type: SchemaType.ARRAY,
      description: "Academic education entries",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          degree: { type: SchemaType.STRING, description: "Degree name, e.g. \"Master of Science\"" },
          institution: { type: SchemaType.STRING, description: "University / school name" },
          institution_type: { type: SchemaType.STRING, description: "University | College | Institute | School" },
          field_of_study: { type: SchemaType.STRING, description: "Field / major, e.g. \"Biomedical Engineering\"" },
          specialization: { type: SchemaType.STRING, description: "Specialization within the field" },
          faculty: { type: SchemaType.STRING, description: "Faculty name" },
          department: { type: SchemaType.STRING, description: "Department name" },
          start_date: { type: SchemaType.STRING, description: "YYYY-MM-DD format" },
          end_date: { type: SchemaType.STRING, description: "YYYY-MM-DD format or null if current" },
          is_current: { type: SchemaType.BOOLEAN, description: "true if still studying" },
          grade: { type: SchemaType.STRING, description: "Grade / classification" },
          gpa: { type: SchemaType.STRING, description: "GPA if available" },
          honors: { type: SchemaType.STRING, description: "Honors e.g. cum laude" },
          short_summary: { type: SchemaType.STRING, description: "Brief summary" },
          full_description: { type: SchemaType.STRING, description: "Detailed description" },
          coursework: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Key courses taken" },
          achievements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Academic achievements" },
          activities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Extra-curricular activities" },
          research_title: { type: SchemaType.STRING, description: "Research / thesis title" },
          research_description: { type: SchemaType.STRING, description: "Research description" },
          research_supervisor: { type: SchemaType.STRING, description: "Supervisor name" },
          status: { type: SchemaType.STRING, description: "Always \"published\"" },
          featured: { type: SchemaType.BOOLEAN, description: "true for the highest / most recent degree" },
          order: { type: SchemaType.INTEGER, description: "0 for most recent, incrementing" },
        }
      }
    },
    skills: {
      type: SchemaType.ARRAY,
      description: "Individual skill entries",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: "Skill name, properly capitalised" },
          category: { type: SchemaType.STRING, description: "Category, e.g. \"Programming Languages\", \"Frameworks\", \"Soft Skills\", \"Tools\"" },
          proficiency: { type: SchemaType.INTEGER, description: "Proficiency 1-100. Estimate based on context (expert→90, intermediate→60, beginner→30)" },
          order: { type: SchemaType.INTEGER, description: "Sequential order starting from 0" },
        }
      }
    },
    certifications: {
      type: SchemaType.ARRAY,
      description: "Professional certifications and licenses",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          certification_name: { type: SchemaType.STRING, description: "Full certification name" },
          issuing_organization: { type: SchemaType.STRING, description: "Organization that issued it" },
          category: { type: SchemaType.STRING, description: "Category: Cloud | Security | Project Management | Programming | Data | Other" },
          issue_date: { type: SchemaType.STRING, description: "YYYY-MM-DD or YYYY-MM or YYYY" },
          expiration_date: { type: SchemaType.STRING, description: "YYYY-MM-DD or null" },
          does_not_expire: { type: SchemaType.BOOLEAN, description: "true if the cert does not expire" },
          credential_id: { type: SchemaType.STRING, description: "Credential / certificate ID" },
          credential_url: { type: SchemaType.STRING, description: "URL to verify the credential" },
          short_description: { type: SchemaType.STRING, description: "Brief description of the certification" },
          skills_covered: { type: SchemaType.STRING, description: "Comma-separated skills covered" },
          status: { type: SchemaType.STRING, description: "Always \"published\"" },
          featured: { type: SchemaType.BOOLEAN, description: "true for the first 5" },
          order: { type: SchemaType.INTEGER, description: "0-based sequential order" },
        }
      }
    },
    achievements: {
      type: SchemaType.ARRAY,
      description: "Awards, honors, accomplishments",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Achievement title" },
          category: { type: SchemaType.STRING, description: "Award | Honor | Recognition | Leadership | Project" },
          short_description: { type: SchemaType.STRING, description: "Brief description" },
          full_description: { type: SchemaType.STRING, description: "Detailed description" },
          date: { type: SchemaType.STRING, description: "Date or year" },
          organization: { type: SchemaType.STRING, description: "Awarding organization" },
          location: { type: SchemaType.STRING, description: "Location" },
          impact: { type: SchemaType.STRING, description: "Impact / significance" },
          status: { type: SchemaType.STRING, description: "Always \"published\"" },
          featured: { type: SchemaType.BOOLEAN, description: "true for first 6" },
          order: { type: SchemaType.INTEGER, description: "0-based" },
        }
      }
    },
    projects: {
      type: SchemaType.ARRAY,
      description: "Portfolio projects",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Project title" },
          slug: { type: SchemaType.STRING, description: "URL-friendly slug, lowercase with hyphens" },
          description: { type: SchemaType.STRING, description: "Short description (1-2 sentences)" },
          content: { type: SchemaType.STRING, description: "Long-form content / write-up" },
          category: { type: SchemaType.STRING, description: "Project category" },
          project_type: { type: SchemaType.STRING, description: "Type: Web App | Mobile App | API | Research | Other" },
          start_date: { type: SchemaType.STRING, description: "YYYY-MM-DD or null" },
          end_date: { type: SchemaType.STRING, description: "YYYY-MM-DD or null" },
          problem: { type: SchemaType.STRING, description: "Problem statement" },
          solution: { type: SchemaType.STRING, description: "Solution summary" },
          my_role: { type: SchemaType.STRING, description: "Role in the project" },
          technologies: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Technologies used" },
          features: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Key features" },
          outcomes: { type: SchemaType.STRING, description: "Outcomes / results" },
          status: { type: SchemaType.STRING, description: "Always \"published\"" },
          featured: { type: SchemaType.BOOLEAN, description: "true for first 3" },
        }
      }
    },
    testimonials: {
      type: SchemaType.ARRAY,
      description: "Recommendations / testimonials from colleagues, managers, clients",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          author_name: { type: SchemaType.STRING, description: "Name of the person giving the testimonial" },
          author_title: { type: SchemaType.STRING, description: "Their job title" },
          company: { type: SchemaType.STRING, description: "Their company" },
          relationship: { type: SchemaType.STRING, description: "Relationship: Manager | Colleague | Client | Professor | Mentor" },
          content: { type: SchemaType.STRING, description: "The testimonial / recommendation text" },
          status: { type: SchemaType.STRING, description: "Always \"published\"" },
          featured: { type: SchemaType.BOOLEAN, description: "true for first 3" },
          order: { type: SchemaType.INTEGER, description: "0-based" },
        }
      }
    },
    social: {
      type: SchemaType.ARRAY,
      description: "Social media / contact links",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          platform_name: { type: SchemaType.STRING, description: "Platform: LinkedIn | GitHub | Twitter | Email | Phone | Website" },
          url: { type: SchemaType.STRING, description: "Full URL (mailto: for email, tel: for phone)" },
          username: { type: SchemaType.STRING, description: "Username or identifier" },
          display_order: { type: SchemaType.INTEGER, description: "0-based" },
          is_active: { type: SchemaType.BOOLEAN, description: "Always true" },
        }
      }
    },
  }
};

console.log(code);