/**
 * Similarity Engine for Portfolio CV Import
 * 
 * Uses Token Overlap (Jaccard) and Levenshtein Distance algorithms to compute
 * weighted multi-field similarity scores between incoming CV data and database entries.
 */

// Calculate Token Similarity (Jaccard Index)
function tokenSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const clean = s => String(s).toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const words1 = new Set(clean(str1).split(/\s+/).filter(w => w.length > 1));
  const words2 = new Set(clean(str2).split(/\s+/).filter(w => w.length > 1));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }

  const union = new Set([...words1, ...words2]).size;
  return intersection / union;
}

// Calculate Levenshtein Distance Similarity
function levenshteinSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  const a = String(s1).toLowerCase().trim();
  const b = String(s2).toLowerCase().trim();
  if (a === b) return 1;

  const track = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= b.length; j += 1) track[j][0] = j;

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  const distance = track[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

// Compute best combined similarity score for text fields
function textSimilarity(a, b) {
  if (!a || !b) return 0;
  const normA = String(a).toLowerCase().trim();
  const normB = String(b).toLowerCase().trim();

  if (normA === normB) return 1.0;

  // Substring containment check for short skill names (e.g. "React" inside "React.js")
  const cleanA = normA.replace(/[^a-z0-9]/g, '');
  const cleanB = normB.replace(/[^a-z0-9]/g, '');
  if (cleanA && cleanB && (cleanA === cleanB || cleanA.includes(cleanB) || cleanB.includes(cleanA))) {
    return 0.95;
  }

  const lev = levenshteinSimilarity(a, b);
  const tok = tokenSimilarity(a, b);
  return Math.max(lev, tok);
}

/**
 * Match Skills
 */
function findSkillMatch(dbSkills, incomingSkillName) {
  if (!incomingSkillName || !dbSkills || dbSkills.length === 0) return null;
  
  let bestMatch = null;
  let highestScore = 0;

  for (const skill of dbSkills) {
    const score = textSimilarity(skill.name, incomingSkillName);
    if (score > highestScore && score >= 0.6) { // 60% similarity threshold
      highestScore = score;
      bestMatch = skill;
    }
  }

  return bestMatch;
}

// Extract a 4-digit year from a date string (ISO or partial)
function extractYear(dateStr) {
  if (!dateStr) return null;
  const match = String(dateStr).match(/\b(\d{4})\b/);
  return match ? parseInt(match[1], 10) : null;
}

// Years match: both present and within 1 year of each other
function yearsMatch(y1, y2) {
  if (y1 == null || y2 == null) return null; // null = unknown, don't penalise
  return Math.abs(y1 - y2) <= 1;
}

/**
 * Match Experience
 * Fields: company (35%) + position (35%) + start_year (30%)
 * All three must strongly agree before calling it a duplicate.
 */
function findExperienceMatch(dbExperiences, company, position, startDate) {
  if (!dbExperiences || dbExperiences.length === 0) return null;

  const incomingYear = extractYear(startDate);

  let bestMatch = null;
  let highestScore = 0;

  for (const exp of dbExperiences) {
    const companyScore  = textSimilarity(exp.company, company);
    const positionScore = textSimilarity(exp.position, position);

    // Year comparison (only counts if both dates are known)
    const dbYear = extractYear(exp.start_date);
    const yearMatch = yearsMatch(incomingYear, dbYear);

    let totalScore;
    if (yearMatch === null) {
      // Unknown dates — use company + position only, higher threshold
      totalScore = (companyScore * 0.5) + (positionScore * 0.5);
    } else if (yearMatch) {
      // Dates agree — weight company+position+date
      totalScore = (companyScore * 0.35) + (positionScore * 0.35) + 0.30;
    } else {
      // Dates disagree — strong penalty; same company/role ≠ same entry
      totalScore = (companyScore * 0.35) + (positionScore * 0.35) + 0.0;
    }

    // Require BOTH company and position to be strong matches (≥0.65)
    // This stops 'Kenyatta National Hospital + Attachment' from matching 'KNH + Attachment' for a different person in a different year
    const bothFieldsStrong = companyScore >= 0.65 && positionScore >= 0.65;

    if (bothFieldsStrong && totalScore > highestScore && totalScore >= 0.65) {
      highestScore = totalScore;
      bestMatch = exp;
    }
  }

  return bestMatch;
}

/**
 * Match Education
 * Fields: institution (25%) + degree (25%) + field_of_study (35%) + start_year (15%)
 *
 * WHY field_of_study is the biggest weight:
 * Two people can attend the same university and earn the same degree type
 * ("Bachelor of Science") but in completely different subjects.
 * field_of_study is the KEY differentiator — "Biomedical Engineering" ≠ "Library Science".
 */
function findEducationMatch(dbEducations, institution, degree, fieldOfStudy, startDate) {
  if (!dbEducations || dbEducations.length === 0) return null;

  const incomingYear = extractYear(startDate);

  let bestMatch = null;
  let highestScore = 0;

  for (const edu of dbEducations) {
    const instScore   = textSimilarity(edu.institution, institution);
    const degreeScore = textSimilarity(edu.degree, degree);
    const fieldScore  = textSimilarity(edu.field_of_study, fieldOfStudy);

    // Year comparison
    const dbYear   = extractYear(edu.start_date);
    const yearMatch = yearsMatch(incomingYear, dbYear);

    // If field_of_study is available on BOTH sides and they clearly don't match, reject immediately
    const fieldAvailable = edu.field_of_study && fieldOfStudy;
    if (fieldAvailable && fieldScore < 0.45) {
      // Different subjects at same institution — definitely NOT a duplicate
      continue;
    }

    let totalScore;
    if (yearMatch === null) {
      totalScore = (instScore * 0.30) + (degreeScore * 0.30) + (fieldScore * 0.40);
    } else if (yearMatch) {
      totalScore = (instScore * 0.25) + (degreeScore * 0.25) + (fieldScore * 0.35) + 0.15;
    } else {
      // Different start year — likely a different person
      totalScore = (instScore * 0.25) + (degreeScore * 0.25) + (fieldScore * 0.35) + 0.0;
    }

    // Require institution to be a strong match — at minimum the school must match
    if (instScore < 0.6) continue;

    if (totalScore > highestScore && totalScore >= 0.70) {
      highestScore = totalScore;
      bestMatch = edu;
    }
  }

  return bestMatch;
}

/**
 * Match Certifications
 */
function findCertificationMatch(dbCertifications, certName) {
  if (!certName || !dbCertifications || dbCertifications.length === 0) return null;

  let bestMatch = null;
  let highestScore = 0;

  for (const cert of dbCertifications) {
    const score = textSimilarity(cert.certification_name || cert.name, certName);
    if (score > highestScore && score >= 0.6) {
      highestScore = score;
      bestMatch = cert;
    }
  }

  return bestMatch;
}

/**
 * Match Achievements
 */
function findAchievementMatch(dbAchievements, title) {
  if (!title || !dbAchievements || dbAchievements.length === 0) return null;

  let bestMatch = null;
  let highestScore = 0;

  for (const ach of dbAchievements) {
    const score = textSimilarity(ach.title, title);
    if (score > highestScore && score >= 0.6) {
      highestScore = score;
      bestMatch = ach;
    }
  }

  return bestMatch;
}

/**
 * Match Projects
 */
function findProjectMatch(dbProjects, title) {
  if (!title || !dbProjects || dbProjects.length === 0) return null;

  let bestMatch = null;
  let highestScore = 0;

  for (const proj of dbProjects) {
    const score = textSimilarity(proj.title, title);
    if (score > highestScore && score >= 0.6) {
      highestScore = score;
      bestMatch = proj;
    }
  }

  return bestMatch;
}

/**
 * Match Testimonials
 */
function findTestimonialMatch(dbTestimonials, authorName) {
  if (!authorName || !dbTestimonials || dbTestimonials.length === 0) return null;

  let bestMatch = null;
  let highestScore = 0;

  for (const test of dbTestimonials) {
    const score = textSimilarity(test.author_name, authorName);
    if (score > highestScore && score >= 0.6) {
      highestScore = score;
      bestMatch = test;
    }
  }

  return bestMatch;
}

module.exports = {
  textSimilarity,
  findSkillMatch,
  findExperienceMatch,
  findEducationMatch,
  findCertificationMatch,
  findAchievementMatch,
  findProjectMatch,
  findTestimonialMatch,
};
