'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { Eye, MessageSquare, Heart, Share2, ArrowRight, Newspaper } from 'lucide-react';
import Link from '@/components/PreviewLink';
import type { TemplateSectionProps } from '@/templateEngine/types';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineText from '@/templateEngine/components/InlineText';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import { getOptimizedImageUrl } from '@/utils/urls';

export default function ObsidianBlog({ variant = 'full' }: TemplateSectionProps) {
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

  // Share handler
  const handleShare = (e: React.MouseEvent, post: any) => {
    e.preventDefault(); // Prevent navigating to the post
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`);
      alert('Link copied to clipboard!');
    }
  };

  if (!posts.length) return null;

  return (
    <section id="blog" className="py-16 md:py-24 bg-bg-dark/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16 relative gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-heading-light mb-4">
              <ColoredTitle settingKey="blog_section_title" title={settings.blog_section_title || 'Latest Insights'} />
            </h2>
            <p className="text-muted-light max-w-xl text-lg mx-auto">
              <InlineText settingKey="blog_section_subtitle" defaultValue="Thoughts, tutorials, and perspectives on topics I'm passionate about." />
            </p>
          </div>
          {variant === 'highlights' && (
            <Link
              href="/blog"
              className="text-primary hover:text-primary-light transition-colors text-sm font-medium flex items-center gap-2 group md:absolute md:right-0 md:bottom-2"
            >
              View All Posts
              <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block bg-card-dark border border-border-dark rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_25px_rgba(var(--color-primary-rgb),0.1)] transition-all duration-500"
            >
              {/* Featured Image */}
              <div className="aspect-video bg-bg-dark overflow-hidden relative">
                {post.featured_image_url ? (
                  <img
                    src={getOptimizedImageUrl(post.featured_image_url, { width: 600, height: 400 })}
                    alt={post.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-light">
                    <i className="fas fa-newspaper text-4xl opacity-30"></i>
                  </div>
                )}
                {post.featured && (
                  <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Featured
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1 h-full">
                {/* Top Row: Author & Meta & Share */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-dark border border-border-dark shrink-0">
                      {post.author_avatar_url || adminPhoto ? (
                        <img
                          src={getOptimizedImageUrl(post.author_avatar_url || adminPhoto, { width: 100, height: 100 })}
                          alt={post.author_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary text-black font-bold text-sm">
                          {(post.author_name || 'A')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-heading-light line-clamp-1">{post.author_name || 'Admin'}</div>
                      <div className="text-xs text-muted-light flex items-center gap-1.5">
                        <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {post.reading_time > 0 && (
                          <>
                            <span className="text-border-dark">•</span>
                            <span>{post.reading_time} min read</span>
                          </>
                        )}
                      </div>
                    </div>
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

                {/* Title */}
                <h3 className="text-xl font-bold text-heading-light mb-3 group-hover:text-primary transition-colors mt-2">
                  <InlineResourceText resource="blog" id={post.id} field="title" defaultValue={post.title} />
                </h3>

                {/* Excerpt */}
                {post.excerpt && (
                  <div className="mb-6">
                    <p className="text-text-light line-clamp-3 leading-relaxed mb-3">
                      <InlineResourceText resource="blog" id={post.id} field="excerpt" multiline defaultValue={post.excerpt} />
                    </p>
                    <span className="text-primary font-medium text-sm flex items-center gap-1.5 group-hover:text-primary-light transition-colors">
                      Check out <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
                
                <div className="mt-auto">
                  {/* Divider */}
                  <div className="h-px w-full bg-border-dark mb-4"></div>
                  
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
