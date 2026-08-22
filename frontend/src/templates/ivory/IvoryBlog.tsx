'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { Eye, MessageSquare, Heart, Share2, ArrowRight, Clock, Newspaper } from 'lucide-react';
import Link from '@/components/PreviewLink';
import type { TemplateSectionProps } from '@/templateEngine/types';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import InlineText from '@/templateEngine/components/InlineText';

export default function IvoryBlog({ config, variant = 'full' }: TemplateSectionProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [adminPhoto, setAdminPhoto] = useState<string>('');
  const refreshKey = useRealtimeRefresh('blog');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    fetchApi('/blog/published').then(res => {
      if (res.success) {
        let data = res.data || [];
        if (variant === 'highlights') data = data.slice(0, 3);
        setPosts(data);
      }
    }).catch(() => {});
    fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {});
    
    const fetchPhoto = async () => {
      try {
        const aboutRes = await fetchApi('/about').catch(() => null);
        if (aboutRes?.data) {
          const aboutData = Array.isArray(aboutRes.data) ? aboutRes.data[0] : aboutRes.data;
          if (aboutData?.image_url) { setAdminPhoto(aboutData.image_url); return; }
        }
        const heroRes = await fetchApi('/hero').catch(() => null);
        if (heroRes?.data) {
          const heroData = Array.isArray(heroRes.data) ? heroRes.data.find((h: any) => h.is_active) || heroRes.data[0] : heroRes.data;
          if (heroData?.image_url) { setAdminPhoto(heroData.image_url); }
        }
      } catch { /* ignore */ }
    };
    fetchPhoto();
  }, [refreshKey, refreshKeySettings, variant]);

  const handleShare = (e: React.MouseEvent, post: any) => {
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`);
      alert('Link copied to clipboard!');
    }
  };

  if (!posts.length) return null;

  return (
    <section id="blog" className="py-32 bg-bg-dark border-b border-text-light/10">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="flex flex-col items-center text-center mb-20 relative">
          <div>
            <span className="text-primary font-mono text-sm uppercase tracking-widest block mb-4">
                <InlineText settingKey="blog_section_subtitle" defaultValue="Insights" />
              </span>
            <h2 className="text-5xl md:text-6xl font-heading font-black text-heading-light tracking-tighter">
              <ColoredTitle settingKey="blog_section_title" title={settings.blog_section_title || 'Writing'} />
            </h2>
          </div>
          {variant === 'highlights' && (
            <Link href="/blog" className="mt-8 text-text-light hover:text-primary transition-colors flex items-center gap-2 border-b border-text-light/30 hover:border-primary pb-1 font-medium md:absolute md:right-0 md:bottom-2">
              Read all articles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-8">
          {posts.map((post: any) => (
            <Link key={post.id} href={`/blog/${post.slug || post.id}`} className="group">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-text-light/5 hover:bg-text-light/10 rounded-3xl p-6 md:p-8 transition-colors duration-500 border border-text-light/10 hover:border-primary/30">
                
                {/* Visual */}
                <div className="md:col-span-3 lg:col-span-2">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-bg-dark border border-text-light/10 relative">
                    {post.featured_image_url ? (
                      <img 
                        src={post.featured_image_url} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary opacity-50">
                        <Newspaper className="w-12 h-12" />
                      </div>
                    )}
                    {post.featured && (
                      <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Content */}
                <div className="md:col-span-9 lg:col-span-10 flex flex-col justify-center">
                  <div className="flex flex-wrap items-start justify-between mb-4 gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Author Info */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-bg-dark border border-text-light/10 shrink-0">
                          {post.author_avatar_url || adminPhoto ? (
                            <img src={post.author_avatar_url || adminPhoto} alt={post.author_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary text-black font-bold text-xs">
                              {(post.author_name || 'A')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-heading-light line-clamp-1">{post.author_name || 'Admin'}</span>
                      </div>

                      <span className="text-muted-light font-mono text-sm uppercase tracking-widest bg-bg-dark px-3 py-1 rounded-full border border-text-light/10">
                        {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {post.reading_time && (
                        <span className="text-muted-light font-mono text-sm uppercase tracking-widest bg-bg-dark px-3 py-1 rounded-full border border-text-light/10 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" /> {post.reading_time} min read
                        </span>
                      )}
                      {post.category && (
                        <span className="text-primary font-mono text-sm uppercase tracking-widest">
                          <InlineResourceText resource="blog" id={post.id} field="category" defaultValue={post.category} />
                        </span>
                      )}
                    </div>
                    
                    {/* Share Icon */}
                    <div 
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleShare(e, post)}
                      className="text-muted-light hover:text-primary transition-colors shrink-0 p-1 cursor-pointer"
                      title="Copy link"
                    >
                      <Share2 className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-heading font-bold text-heading-light mb-4 group-hover:text-primary transition-colors">
                    <InlineResourceText resource="blog" id={post.id} field="title" defaultValue={post.title} />
                  </h3>
                  
                  <div className="mb-6">
                    <p className="text-text-light/80 text-lg leading-relaxed line-clamp-2 max-w-4xl mb-4">
                      <InlineResourceText resource="blog" id={post.id} field="excerpt" multiline defaultValue={post.excerpt} />
                    </p>
                    <span className="text-primary font-medium text-sm flex items-center gap-1.5 group-hover:text-primary-light transition-colors">
                      Check out <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {post.tags && (
                    <div className="flex flex-wrap gap-2 mt-6">
                      {(typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags).map((tag: string, i: number) => (
                        <span key={i} className="text-xs bg-text-light/5 border border-text-light/10 text-text-light/70 px-2 py-1 rounded group-hover:border-primary/30 transition-colors">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6">
                    {/* Divider */}
                    <div className="h-px w-full bg-text-light/10 mb-4"></div>
                    
                    {/* Footer Metrics */}
                    <div className="flex items-center justify-between text-sm text-muted-light">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5" title="Views">
                          <Eye className="w-4 h-4" />
                          <span>{post.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Comments">
                          <MessageSquare className="w-4 h-4" />
                          <span>0</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5" title="Likes">
                        <span>{post.likes || 0}</span>
                        <Heart className={`w-4 h-4 ${post.likes > 0 ? 'text-red-500 fill-current' : ''}`} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
        
      </div>
    </section>
  );
}
