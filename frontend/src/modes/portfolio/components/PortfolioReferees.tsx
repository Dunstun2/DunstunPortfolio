'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineResourceImage from '@/templateEngine/components/InlineResourceImage';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';
import { Mail, Phone, Building2, UserCheck, Calendar } from 'lucide-react';

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

export default function RefereesSection() {
  const { isInlineEditing } = useInlineEdit();
  const [referees, setReferees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const refreshKey = useRealtimeRefresh('referees');

  useEffect(() => {
    fetchApi('/referees/published')
      .then(res => {
        setReferees(res.data || []);
      })
      .catch(err => {
        console.warn('Could not fetch referees:', err);
        setReferees([]);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return null;
  if (!referees.length && !isInlineEditing) return null;

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          <ColoredTitle settingKey="referees_title" title="Professional References" />
        </h2>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Trusted professionals and leaders who can speak to my work ethic, skills, and background.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {referees.map(referee => (
          <div
            key={referee.id}
            className="glass p-6 rounded-2xl border border-white/10 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 shadow-lg relative group"
          >
            <div>
              {/* Header: Photo & Submitter Info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0 bg-primary/10 flex items-center justify-center">
                  {referee.avatar_url ? (
                    <InlineResourceImage
                      resource="referees"
                      id={referee.id}
                      field="avatar_url"
                      currentSrc={referee.avatar_url}
                      alt={referee.full_name}
                      className="w-full h-full object-cover"
                      wrapperClassName="w-full h-full"
                      width={150}
                      height={150}
                    />
                  ) : (
                    <UserCheck className="w-6 h-6 text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-heading-light truncate">
                    <InlineResourceText
                      resource="referees"
                      id={referee.id}
                      field="full_name"
                      defaultValue={referee.full_name}
                    />
                  </h3>
                  <p className="text-sm font-medium text-primary flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      <InlineResourceText
                        resource="referees"
                        id={referee.id}
                        field="job_title"
                        defaultValue={referee.job_title}
                      />
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    <InlineResourceText
                      resource="referees"
                      id={referee.id}
                      field="organization"
                      defaultValue={referee.organization}
                    />
                  </p>
                </div>
              </div>

              {/* Relationship & Duration Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {referee.relationship && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    <InlineResourceText
                      resource="referees"
                      id={referee.id}
                      field="relationship"
                      defaultValue={referee.relationship}
                    />
                  </span>
                )}
                {referee.years_known && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-muted-foreground border border-white/10 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <InlineResourceText
                      resource="referees"
                      id={referee.id}
                      field="years_known"
                      defaultValue={referee.years_known}
                    />
                  </span>
                )}
              </div>

              {/* Context / Overview */}
              {referee.context && (
                <p className="text-xs text-text-light/80 leading-relaxed mb-4 italic bg-black/10 dark:bg-white/5 p-3 rounded-xl border border-white/5">
                  &ldquo;
                  <InlineResourceText
                    resource="referees"
                    id={referee.id}
                    field="context"
                    multiline
                    defaultValue={referee.context}
                  />
                  &rdquo;
                </p>
              )}
            </div>

            {/* Contact Details & Links */}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-1.5 text-xs text-muted-foreground">
              {referee.email && (
                <a
                  href={`mailto:${referee.email}`}
                  className="flex items-center gap-2 text-primary hover:underline truncate"
                >
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{referee.email}</span>
                </a>
              )}
              {referee.phone && (
                <a
                  href={`tel:${referee.phone}`}
                  className="flex items-center gap-2 text-primary hover:underline truncate"
                >
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{referee.phone}</span>
                </a>
              )}
              {referee.linkedin_url && (
                <a
                  href={referee.linkedin_url.startsWith('http') ? referee.linkedin_url : `https://${referee.linkedin_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-secondary hover:underline truncate"
                >
                  <LinkedinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>LinkedIn Profile ↗</span>
                </a>
              )}
              {!referee.email && !referee.phone && (
                <p className="text-[11px] text-muted-foreground italic">
                  Contact details available upon request
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
