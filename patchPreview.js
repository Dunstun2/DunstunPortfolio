const fs = require('fs');

const filePath = 'frontend/src/app/admin/cv-import/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace Experience
const expRegex = /<div key=\{i\} className="border-l-4 border-blue-500 pl-4 group">([\s\S]*?)<\/ul>\s*<\/div>\s*\)}/g;
const expReplace = `<div key={i} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6 group">
                  <div className="flex justify-between items-start gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {exp.position_title || exp.position || exp.title} at {exp.company_name || exp.company}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {exp.existsInDb ? (
                        <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                          Already Exists (Will Update)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded border border-green-300 dark:border-green-700">
                          New Entry
                        </span>
                      )}
                      <button
                        onClick={() => openEdit('experience', i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        title="Edit this experience"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Role & Company Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Company:</span> {exp.company_name || exp.company}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Position:</span> {exp.position_title || exp.position || exp.title}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Employment Type:</span> {exp.employment_type || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Work Mode:</span> {exp.work_mode || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Department:</span> {exp.department || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Industry:</span> {exp.industry || '-'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Duration & Location</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Start Date:</span> {exp.start_date}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">End Date:</span> {exp.end_date || 'Present'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Location:</span> {exp.location || '-'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Role Description</h4>
                      <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                        {exp.short_summary && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Short Summary:</span>
                            <p className="mt-1">{exp.short_summary}</p>
                          </div>
                        )}
                        {exp.full_description && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Full Description:</span>
                            <p className="mt-1 whitespace-pre-wrap">{exp.full_description}</p>
                          </div>
                        )}
                        {exp.responsibilities && exp.responsibilities.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Responsibilities:</span>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {exp.responsibilities.map((r: string, j: number) => <li key={j}>{r}</li>)}
                            </ul>
                          </div>
                        )}
                        {exp.key_contributions && exp.key_contributions.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Key Contributions:</span>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {exp.key_contributions.map((r: string, j: number) => <li key={j}>{r}</li>)}
                            </ul>
                          </div>
                        )}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Achievements:</span>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {exp.achievements.map((r: string, j: number) => <li key={j}>{r}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {(exp.associated_skills?.length > 0 || exp.related_projects?.length > 0) && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Relational</h4>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          {exp.associated_skills && exp.associated_skills.length > 0 && (
                            <p><span className="font-semibold text-gray-900 dark:text-gray-100">Associated Skills:</span> {exp.associated_skills.join(', ')}</p>
                          )}
                          {exp.related_projects && exp.related_projects.length > 0 && (
                            <p><span className="font-semibold text-gray-900 dark:text-gray-100">Related Projects:</span> {exp.related_projects.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>`;
// Replace using string functions because Regex is tricky across multiple lines
let expStart = content.indexOf('<div key={i} className="border-l-4 border-blue-500 pl-4 group">');
let expEnd = content.indexOf('</div>\n              ))}', expStart);
if (expStart > -1 && expEnd > -1) {
    content = content.substring(0, expStart) + expReplace + content.substring(expEnd);
}

// Replace Education
const eduTarget = \`                  <div key={index} className="glass p-6 md:p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.15)] hover:border-primary/30 bg-white/5 border border-gray-200 dark:border-gray-800 group">\`;
const eduEndTarget = '</div>\n                );\n              })}';

let eduStart = content.indexOf(eduTarget);
let eduEnd = content.indexOf(eduEndTarget, eduStart);

const eduReplace = \`                  <div key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6 group">
                    <div className="flex justify-between items-start gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {edu.degree || 'Degree'} at {edu.institution || 'Institution'}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {edu.existsInDb ? (
                          <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                            Already Exists (Will Update)
                          </span>
                        ) : (
                          <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded border border-green-300 dark:border-green-700">
                            New Entry
                          </span>
                        )}
                        <button
                          onClick={() => openEdit('education', index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          title="Edit this education"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Basic Info</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Degree:</span> {edu.degree || '-'}</p>
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Institution:</span> {edu.institution || '-'}</p>
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Field of Study:</span> {edu.field_of_study || '-'}</p>
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Institution Type:</span> {edu.institution_type || '-'}</p>
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Faculty:</span> {edu.faculty || '-'}</p>
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Department:</span> {edu.department || '-'}</p>
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Specialization:</span> {edu.specialization || '-'}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Duration</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Start Date:</span> {edu.start_date || '-'}</p>
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">End Date:</span> {edu.end_date || 'Present'}</p>
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Expected Graduation:</span> {edu.expected_graduation || '-'}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Performance</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Grade:</span> {edu.grade || '-'}</p>
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">GPA:</span> {edu.gpa || '-'}</p>
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Honors:</span> {edu.honors || '-'}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                          {edu.short_summary && (
                            <div>
                              <span className="font-semibold text-gray-900 dark:text-gray-100">Short Summary:</span>
                              <p className="mt-1">{edu.short_summary}</p>
                            </div>
                          )}
                          {edu.full_description && (
                            <div>
                              <span className="font-semibold text-gray-900 dark:text-gray-100">Full Description:</span>
                              <p className="mt-1 whitespace-pre-wrap">{edu.full_description}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {(edu.coursework?.length > 0 || edu.activities?.length > 0) && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Relations & Lists</h4>
                          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            {edu.coursework && edu.coursework.length > 0 && (
                              <p><span className="font-semibold text-gray-900 dark:text-gray-100">Coursework:</span> {edu.coursework.join(', ')}</p>
                            )}
                            {edu.activities && edu.activities.length > 0 && (
                              <p><span className="font-semibold text-gray-900 dark:text-gray-100">Activities:</span> {edu.activities.join(', ')}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
\`;

if (eduStart > -1 && eduEnd > -1) {
    content = content.substring(0, eduStart) + eduReplace + content.substring(eduEnd);
}

// Replace Certifications
const certTarget = \`                <div key={i} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 group">\`;
const certEndTarget = '</div>\n              ))}';
let certStart = content.indexOf(certTarget);
let certEnd = content.indexOf(certEndTarget, certStart);

const certReplace = \`                <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4 group shadow-sm">
                  <div className="flex justify-between items-start gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {cert.certification_name || cert.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {cert.existsInDb ? (
                        <span className="text-[10px] uppercase font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700 whitespace-nowrap">
                          Already Exists
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-1.5 py-0.5 rounded border border-green-300 dark:border-green-700 whitespace-nowrap">
                          New
                        </span>
                      )}
                      <button
                        onClick={() => openEdit('certifications', i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-purple-200 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        title="Edit this certification"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Basic Info</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Certification Name:</span> {cert.certification_name || cert.name || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Issuing Organization:</span> {cert.issuing_organization || cert.issuer || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Category:</span> {cert.category || '-'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Date & Credential</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Issue Date:</span> {cert.issue_date || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Expiration Date:</span> {cert.does_not_expire ? 'Does not expire' : (cert.expiration_date || '-')}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Credential ID:</span> {cert.credential_id || '-'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        {cert.short_description && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Short Description:</span>
                            <p className="mt-1">{cert.short_description}</p>
                          </div>
                        )}
                        {cert.skills_covered && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Skills Covered:</span>
                            <p className="mt-1">{cert.skills_covered}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
\`;

if (certStart > -1 && certEnd > -1) {
    content = content.substring(0, certStart) + certReplace + content.substring(certEnd);
}

// Replace Achievements
const achTarget = \`                <div key={i} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800 group">\`;
const achEndTarget = '</div>\n              ))}';
let achStart = content.indexOf(achTarget);
let achEnd = content.indexOf(achEndTarget, achStart);

const achReplace = \`                <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4 group shadow-sm">
                  <div className="flex justify-between items-start gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {ach.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {ach.existsInDb ? (
                        <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                          Already Exists (Will Update)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded border border-green-300 dark:border-green-700">
                          New Entry
                        </span>
                      )}
                      <button
                        onClick={() => openEdit('achievements', i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                        title="Edit this achievement"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Basic Info</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Title:</span> {ach.title || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Category:</span> {ach.category || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Date:</span> {ach.date || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Organization:</span> {ach.organization || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Location:</span> {ach.location || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Role:</span> {ach.role || '-'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description & Impact</h4>
                      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        {ach.short_description && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Short Description:</span>
                            <p className="mt-1">{ach.short_description}</p>
                          </div>
                        )}
                        {ach.full_description && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Full Description:</span>
                            <p className="mt-1">{ach.full_description}</p>
                          </div>
                        )}
                        {ach.impact && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Impact:</span>
                            <p className="mt-1">{ach.impact}</p>
                          </div>
                        )}
                        {ach.why_it_matters && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Why It Matters:</span>
                            <p className="mt-1">{ach.why_it_matters}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
\`;

if (achStart > -1 && achEnd > -1) {
    content = content.substring(0, achStart) + achReplace + content.substring(achEnd);
}

// Replace Projects
const projTarget = \`                <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 group">\`;
const projEndTarget = '</div>\n              ))}';
let projStart = content.indexOf(projTarget);
let projEnd = content.indexOf(projEndTarget, projStart);

const projReplace = \`                <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4 group shadow-sm">
                  <div className="flex justify-between items-start gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {proj.title || proj.project_name}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {proj.existsInDb ? (
                        <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                          Already Exists (Will Update)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded border border-green-300 dark:border-green-700">
                          New Entry
                        </span>
                      )}
                      <button
                        onClick={() => openEdit('projects', i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                        title="Edit this project"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Basic Info</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Title:</span> {proj.title || proj.project_name || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Category:</span> {proj.category || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Project Type:</span> {proj.project_type || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Start Date:</span> {proj.start_date || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">End Date:</span> {proj.end_date || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">Team Size:</span> {proj.team_size || '-'}</p>
                        <p><span className="font-semibold text-gray-900 dark:text-gray-100">My Role:</span> {proj.my_role || '-'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Details</h4>
                      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        {(proj.description || proj.short_description) && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Description:</span>
                            <p className="mt-1">{proj.description || proj.short_description}</p>
                          </div>
                        )}
                        {proj.problem && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Problem:</span>
                            <p className="mt-1">{proj.problem}</p>
                          </div>
                        )}
                        {proj.solution && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Solution:</span>
                            <p className="mt-1">{proj.solution}</p>
                          </div>
                        )}
                        {proj.responsibilities && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Responsibilities:</span>
                            <p className="mt-1">{proj.responsibilities}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tech & Features</h4>
                      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Technologies:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {proj.technologies.map((tech: string, j: number) => (
                                <span key={j} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {proj.features && proj.features.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Features:</span>
                            <ul className="list-disc list-inside mt-1">
                              {proj.features.map((f: string, j: number) => <li key={j}>{f}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
\`;

if (projStart > -1 && projEnd > -1) {
    content = content.substring(0, projStart) + projReplace + content.substring(projEnd);
}

// Replace Testimonials
const testTarget = \`                <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-indigo-500 group relative">\`;
const testEndTarget = '</div>\n              ))}';
let testStart = content.indexOf(testTarget);
let testEnd = content.indexOf(testEndTarget, testStart);

const testReplace = \`                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 group relative shadow-sm mb-4">
                  <button
                    onClick={() => openEdit('testimonials', i)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    title="Edit this testimonial"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  
                  <div className="space-y-4 pr-8">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Content</h4>
                      <p className="text-gray-800 dark:text-gray-200 italic mb-3 text-sm">"{testim.content}"</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Author Info</h4>
                      <div className="flex items-center gap-4">
                        {testim.avatar_url && (
                          <img src={testim.avatar_url} alt={testim.author_name} className="w-12 h-12 rounded-full object-cover" />
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-gray-300 w-full">
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Author Name:</span> {testim.author_name || '-'}</p>
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Author Title:</span> {testim.author_title || '-'}</p>
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Company:</span> {testim.company || testim.author_company || '-'}</p>
                          <p><span className="font-semibold text-gray-900 dark:text-gray-100">Relationship:</span> {testim.relationship || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
\`;

if (testStart > -1 && testEnd > -1) {
    content = content.substring(0, testStart) + testReplace + content.substring(testEnd);
}


fs.writeFileSync(filePath, content, 'utf8');
console.log('Done replacing');
