'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import Link from 'next/link';

export default function AboutPage() {
  const [about, setAbout] = useState<any>(null);
  const [hero, setHero] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchApi('/about/published')
        .then(res => setAbout(res.data))
        .catch(err => {
          console.warn('No published about section found:', err);
          setAbout(null);
        }),
      fetchApi('/hero/published')
        .then(res => setHero(res.data))
        .catch(err => {
          console.warn('Could not fetch hero data, using default:', err);
          setHero(null);
        })
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!about) {
    return null;
  }

  const validHighlights = about.highlights?.filter((h: any) => h.title) || [];
  const validExplorations = about.explorations?.filter((e: any) => e.title && e.category) || [];

  // Merge Hero Professional Titles with Manual Identity Cards
  const heroTitles = hero?.professional_title ? hero.professional_title.split('|').map((t: string) => t.trim()).filter(Boolean) : [];
  const manualCards = about.identity_cards?.filter((c: any) => c.title) || [];
  
  const mergedCards: any[] = [];
  
  heroTitles.forEach((title: string, index: number) => {
    const matchedManual = manualCards.find((c: any) => c.title.toLowerCase() === title.toLowerCase());
    mergedCards.push({
      id: `hero-title-${index}`,
      title: title,
      description: matchedManual ? matchedManual.description : '',
    });
  });

  manualCards.forEach((c: any) => {
    if (!heroTitles.some((t: string) => t.toLowerCase() === c.title.toLowerCase())) {
      mergedCards.push(c);
    }
  });

  const validCards = mergedCards;

  const heroImage = about.hero_image_url || about.image_url;
  const heroTitle = about.hero_title || 'About Me';

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] pb-24">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-bg-light dark:bg-bg-dark">
        {heroImage ? (
          <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[80vh]">
            {heroImage.match(/\.(mp4|webm|ogg|mov)$/i) ? (
              <video 
                src={heroImage} 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover object-top opacity-40 dark:opacity-20 block absolute inset-0"
              />
            ) : (
              <img 
                src={heroImage} 
                alt="Hero Background" 
                className="w-full h-full object-cover object-top opacity-40 dark:opacity-20 block absolute inset-0"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-light dark:to-bg-dark z-0 pointer-events-none" />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 sm:px-6 lg:px-8 pointer-events-none">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-heading-light mb-4 md:mb-6 text-center drop-shadow-lg">
                {heroTitle}
              </h1>
              <div className="w-16 md:w-24 h-1 bg-primary mx-auto rounded-full shadow-sm" />
            </div>
          </div>
        ) : (
          <div className="py-32 flex items-center justify-center relative" style={{ minHeight: '50vh' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-bg-light/90 to-bg-light dark:from-bg-dark/90 dark:to-bg-dark z-0" />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-heading-light mb-6">
                {heroTitle}
              </h1>
              <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-8" />
            </div>
          </div>
        )}
      </section>

      {/* 2. Intro Section */}
      <section className="relative z-20 w-full">
        <div className="glass py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-x-0 rounded-none">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
            {about.image_url && (
              <div className="w-40 h-40 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary/30 flex-shrink-0 shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.2)]">
                <img src={about.image_url} alt="Profile" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 text-left w-full">
              <h2 className="text-3xl font-bold text-heading-light mb-6">
                About <span className="text-primary">Me</span>
              </h2>
              <div 
                className="text-text-light text-base md:text-lg leading-relaxed prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: about.content }}
              />
              
              <div className="mt-8 pt-6 border-t border-gray-700/50 grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-4 justify-start w-full">
                <Link href="/skills" className="text-center px-4 md:px-5 py-2.5 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 hover:border-secondary/60 rounded-full transition-colors text-sm font-medium">
                  Skills
                </Link>
                <Link href="/experience" className="text-center px-4 md:px-5 py-2.5 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 hover:border-secondary/60 rounded-full transition-colors text-sm font-medium">
                  Experience
                </Link>
                <Link href="/education" className="text-center px-4 md:px-5 py-2.5 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 hover:border-secondary/60 rounded-full transition-colors text-sm font-medium">
                  Education
                </Link>
                <Link href="/projects" className="text-center px-4 md:px-5 py-2.5 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 hover:border-secondary/60 rounded-full transition-colors text-sm font-medium">
                  Projects
                </Link>
                <Link href="/contact" className="col-span-2 md:col-span-1 text-center px-4 md:px-5 py-2.5 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 hover:border-secondary/60 rounded-full transition-colors text-sm font-medium">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Who I Am (Cards) */}
      {validCards.length > 0 && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h2 className="text-3xl font-bold text-primary mb-16 text-center">Who I Am</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {validCards.map((card: any) => (
              <div key={card.id} className="glass p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                    {card.title.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-heading-light">{card.title}</h3>
                </div>
                <p className="text-text-light leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. My Story / Journey (Card Form) */}
      {about.story_title && about.story_content && (
        <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="glass p-10 md:p-14 rounded-[2rem] border border-black/5 dark:border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-colors"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 text-center relative z-10">
              {about.story_title}
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-secondary rounded-full"></span>
            </h2>
            <div className="text-text-light leading-relaxed prose prose-lg dark:prose-invert max-w-none relative z-10">
              <div dangerouslySetInnerHTML={{ __html: about.story_content }} />
            </div>
          </div>
        </section>
      )}

      {/* 6. Philosophy & Drive */}
      {(about.philosophy_title || about.drive_title) && (
        <section className="py-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {about.philosophy_title && (
                <div className="bg-black/5 dark:bg-white/5 p-10 md:p-14 rounded-[2rem] border border-black/5 dark:border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
                  <h3 className="text-sm tracking-widest text-primary uppercase font-bold mb-4">Philosophy</h3>
                  <h2 className="text-3xl font-bold text-heading-light mb-6">{about.philosophy_title}</h2>
                  <blockquote className="text-xl italic text-heading-light mb-8 border-l-4 border-primary pl-6">
                    "{about.philosophy_statement}"
                  </blockquote>
                  <p className="text-text-light text-lg leading-relaxed">{about.philosophy_description}</p>
                </div>
              )}
              {about.drive_title && (
                <div className="bg-black/5 dark:bg-white/5 p-10 md:p-14 rounded-[2rem] border border-black/5 dark:border-white/5 relative overflow-hidden group">
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-colors"></div>
                  <h3 className="text-sm tracking-widest text-secondary uppercase font-bold mb-4">What Drives Me</h3>
                  <h2 className="text-3xl font-bold text-heading-light mb-6">{about.drive_title}</h2>
                  <blockquote className="text-xl italic text-heading-light mb-8 border-l-4 border-secondary pl-6">
                    "{about.drive_statement}"
                  </blockquote>
                  <p className="text-text-light text-lg leading-relaxed">{about.drive_description}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. Timeline & Exploring (Side by Side on Large Screens) */}
      {(validHighlights.length > 0 || validExplorations.length > 0) && (
        <section className="py-12 bg-black/5 dark:bg-white/5 border-y border-black/5 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              
              {/* Key Milestones */}
              {validHighlights.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-16 text-center lg:text-left">Key Milestones</h2>
                  <div className="relative border-l-2 border-primary/30 ml-4 md:ml-8 space-y-12">
                    {validHighlights.map((item: any, i: number) => (
                      <div key={item.id} className="relative pl-8 md:pl-12">
                        <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-primary ring-4 ring-bg-light dark:ring-bg-dark"></div>
                        <div className="flex flex-wrap items-baseline gap-x-3 mb-2">
                          <span className="text-primary font-bold tracking-widest text-sm">{item.date}</span>
                          <h3 className="text-xl md:text-2xl font-bold text-heading-light">{item.title}</h3>
                        </div>
                        <p className="text-text-light text-lg">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Currently Exploring */}
              {validExplorations.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-16 text-center lg:text-left">Currently Exploring</h2>
                  <div className="flex flex-col gap-6">
                    {validExplorations.map((exp: any) => (
                      <div key={exp.id} className="glass px-6 py-5 rounded-2xl flex flex-col gap-2 hover:border-primary/50 transition-colors w-full">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">{exp.category}</span>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-heading-light font-medium text-lg flex-1">{exp.title}</span>
                          {exp.link_url && (
                            <a href={exp.link_url.startsWith('http') ? exp.link_url : `https://${exp.link_url}`} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-secondary/80 transition-colors flex-shrink-0">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* 8. Vision & Final CTA */}
      {(about.vision_title || about.vision_statement) && (
        <section className="py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <div className="glass p-10 md:p-16 rounded-[3rem] relative overflow-hidden border border-primary/20 shadow-[0_0_50px_rgba(var(--color-primary-rgb),0.1)] group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl mix-blend-screen pointer-events-none group-hover:bg-primary/20 transition-colors duration-700"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl mix-blend-screen pointer-events-none group-hover:bg-secondary/20 transition-colors duration-700"></div>
            
            <div className="relative z-10">
              <h2 className="text-sm tracking-widest text-primary uppercase font-bold mb-4">The Future</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-heading-light mb-8">{about.vision_title}</h3>
              <p className="text-xl md:text-2xl text-white mb-10 leading-relaxed max-w-3xl mx-auto font-medium italic border-y border-white/10 py-8">
                "{about.vision_statement}"
              </p>
              <div className="text-text-light mb-12 max-w-3xl mx-auto text-lg leading-relaxed">
                {about.vision_description}
              </div>
              
              <Link href="/contact" className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-primary rounded-full hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] transition-all hover:-translate-y-1 hover:scale-105 border border-primary/50">
                Let's Build Something Together
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
