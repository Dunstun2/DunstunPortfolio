'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from '@/components/PreviewLink';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import { Share2, Heart, MessageCircle, MoreVertical, Star } from 'lucide-react';
import { getOptimizedImageUrl } from '@/utils/urls';

interface BlogPostClientProps {
  initialPost: any;
}

export default function BlogPostClient({ initialPost }: BlogPostClientProps) {
  const params = useParams();
  const router = useRouter();
  const refreshKey = useRealtimeRefresh('blogComments');
  const [post, setPost] = useState<any>(initialPost);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [socials, setSocials] = useState<any[]>([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [adminPhoto, setAdminPhoto] = useState<string>('');
  
  // Comment Form State
  const [commentForm, setCommentForm] = useState({ author_name: '', author_email: '', content: '' });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState('');
  const [commentError, setCommentError] = useState('');
  const [rating, setRating] = useState(0);

  // Load liked status and current URL from localStorage/window on client
  useEffect(() => {
    if (typeof window !== 'undefined' && post?.slug) {
      setHasLiked(!!localStorage.getItem(`liked_${post.slug}`));
      setShareUrl(window.location.href);
    }
  }, [post?.slug]);

  useEffect(() => {
    if (!post) return;
    
    // Parse blocks
    let parsedBlocks = [];
    try {
      parsedBlocks = JSON.parse(post.content || '[]');
      if (!Array.isArray(parsedBlocks)) {
        parsedBlocks = post.content ? [{ id: '1', type: 'p', content: post.content }] : [];
      }
    } catch {
      parsedBlocks = post.content ? [{ id: '1', type: 'p', content: post.content }] : [];
    }
    setBlocks(parsedBlocks);

    // Load comments
    fetchApi(`/blog-comments/post/${post.id}`)
      .then(cRes => setComments(cRes.data || []))
      .catch(console.error);

    // Load recent posts
    fetchApi(`/blog?limit=3`)
      .then(rRes => {
        if (rRes.success) {
          setRecentPosts(rRes.data.filter((p: any) => p.id !== post.id).slice(0, 3));
        }
      }).catch(console.error);

    // Load active socials
    fetchApi('/social')
      .then(res => {
        if (res.success && res.data) {
          setSocials(res.data);
        }
      }).catch(console.error);

    // Fetch admin profile photo as fallback for author avatar
    if (!post.author_avatar_url) {
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
    }
  }, [post?.id, refreshKey]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingComment(true);
    setCommentSuccess('');
    setCommentError('');
    try {
      // Submit comment
      await fetchApi('/blog-comments', {
        method: 'POST',
        body: JSON.stringify({ ...commentForm, post_id: post.id })
      });

      // Submit rating if selected
      if (rating > 0) {
        const rateRes = await fetchApi(`/blog/post/${post.slug}/rate`, {
          method: 'POST',
          body: JSON.stringify({ rating })
        });
        if (rateRes.success) {
          setPost((prev: any) => ({
            ...prev,
            rating_total: rateRes.data.rating_total,
            rating_count: rateRes.data.rating_count
          }));
        }
      }

      setCommentSuccess('Your comment has been submitted and is pending approval.');
      setCommentForm({ author_name: '', author_email: '', content: '' });
      setRating(0);
    } catch (err: any) {
      setCommentError(err.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = async () => {
    if (hasLiked) return;
    try {
      const res = await fetchApi(`/blog/post/${post.slug}/like`, { method: 'POST' });
      if (res.success) {
        setPost((prev: any) => ({ ...prev, likes: res.data.likes }));
        setHasLiked(true);
        localStorage.setItem(`liked_${post.slug}`, 'true');
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (!post) return null;

  return (
    <article className="min-h-screen bg-bg-dark text-text-light py-12 md:py-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header: Author, Date, Reading Time */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-white/10">
              {(post.author_avatar_url || adminPhoto) ? (
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
            <div className="text-sm font-semibold text-text-light/90">
              {post.author_name || 'Admin'} 
              <span className="text-text-light/50 font-normal mx-1">·</span> 
              <span className="text-text-light/70">{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              {post.reading_time > 0 && (
                <>
                  <span className="text-text-light/50 font-normal mx-1">·</span> 
                  <span className="text-text-light/70">{post.reading_time} min read</span>
                </>
              )}
            </div>
          </div>
          <button className="text-text-light/50 hover:text-text-light transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-heading-light mb-4 leading-tight tracking-tight">
          <InlineResourceText resource="blog" id={post.id} field="title" defaultValue={post.title} />
        </h1>

        {/* Star Rating */}
        {(() => {
          const avgRating = post.rating_count > 0 ? post.rating_total / post.rating_count : 0;
          return (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${avgRating >= star ? 'fill-yellow-500 text-yellow-500' : 'text-text-light/30'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-text-light/60">
                {post.rating_count > 0 ? `${avgRating.toFixed(1)} (${post.rating_count} ${post.rating_count === 1 ? 'rating' : 'ratings'})` : 'No ratings yet'}
              </span>
            </div>
          );
        })()}

        {/* Excerpt */}
        <p className="text-lg md:text-xl text-text-light/90 leading-relaxed mb-8 font-medium">
          <InlineResourceText resource="blog" id={post.id} field="excerpt" multiline defaultValue={post.excerpt} />
        </p>

        {/* Featured Image */}
        {post.featured_image_url && (
          <figure className="mb-12">
            <div className="w-full rounded-2xl overflow-hidden bg-black/20">
              <img
                src={getOptimizedImageUrl(post.featured_image_url, { width: 1200 })}
                alt={post.title}
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className="text-center text-xs font-medium text-text-light/50 mt-3">
              Cover photo displayed prominently at the top of a blog page
            </figcaption>
          </figure>
        )}

        {/* Main Content Layout */}
        <div className="prose prose-invert prose-lg max-w-none prose-a:text-primary hover:prose-a:text-primary-light prose-img:rounded-xl space-y-8 text-text-light/90 leading-relaxed text-base md:text-lg mb-16">
          {blocks.map((block) => (
            <div key={block.id} className="block-wrapper">
              {block.type === 'h2' && <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-4 text-heading-light tracking-tight">{block.content}</h2>}
              {block.type === 'h3' && <h3 className="text-xl md:text-2xl font-bold mt-8 mb-4 text-heading-light">{block.content}</h3>}
              {block.type === 'p' && <p className="mb-6 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: block.content }} />}
              {block.type === 'quote' && (
                <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-text-light/80 text-xl font-serif">
                  "{block.content}"
                </blockquote>
              )}
              {block.type === 'code' && (
                <div className="my-8 rounded-xl overflow-hidden bg-[#0d1117] border border-white/10 shadow-lg">
                  {block.language && (
                    <div className="bg-white/5 px-4 py-2 border-b border-white/10 text-xs text-text-light/60 font-mono flex justify-between items-center">
                      <span>{block.language}</span>
                      <button onClick={() => navigator.clipboard.writeText(block.content)} className="hover:text-white transition-colors">Copy</button>
                    </div>
                  )}
                  <pre className="p-4 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">
                    <code>{block.content}</code>
                  </pre>
                </div>
              )}
              {block.type === 'ul' && (
                <ul className="list-disc pl-6 space-y-2 my-6">
                  {(block.content || '').split('\n').filter(Boolean).map((item: string, i: number) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
              )}
              {block.type === 'ol' && (
                <ol className="list-decimal pl-6 space-y-2 my-6">
                  {(block.content || '').split('\n').filter(Boolean).map((item: string, i: number) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ol>
              )}
              {block.type === 'callout' && (
                <div className="bg-primary/10 p-6 rounded-xl my-8 border border-primary/20">
                  <div className="flex gap-4">
                    <span className="text-2xl">💡</span>
                    <div className="flex-1" dangerouslySetInnerHTML={{ __html: block.content }} />
                  </div>
                </div>
              )}
              {block.type === 'hr' && (
                <hr className="border-white/10 my-10" />
              )}
              {block.type === 'img' && block.url && (
                <figure className="my-10">
                  <img
                    src={getOptimizedImageUrl(block.url, { width: 800 })}
                    alt={block.caption || 'Image'}
                    className="w-full rounded-2xl object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  {block.caption && (
                    <figcaption className="text-center text-xs text-text-light/50 mt-3">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Social Share */}
        {(() => {
          const shareText = `Check out this post: "${post.title}"`;
          
          const hasFacebook = socials.some(s => s.platform_name.toLowerCase().includes('facebook'));
          const hasTwitter = socials.some(s => s.platform_name.toLowerCase().includes('twitter') || s.platform_name.toLowerCase() === 'x');
          const hasLinkedIn = socials.some(s => s.platform_name.toLowerCase().includes('linkedin'));
          const hasWhatsApp = socials.some(s => s.platform_name.toLowerCase().includes('whatsapp'));
          
          const showAll = !hasFacebook && !hasTwitter && !hasLinkedIn && !hasWhatsApp;
          
          return (
            <div className="border-t border-b border-white/10 py-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Facebook */}
                {(showAll || hasFacebook) && (
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="text-text-light/50 hover:text-text-light transition-colors" title="Share on Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
                  </a>
                )}
                {/* Twitter / X */}
                {(showAll || hasTwitter) && (
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className="text-text-light/50 hover:text-text-light transition-colors" title="Share on Twitter">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
                {/* LinkedIn */}
                {(showAll || hasLinkedIn) && (
                  <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(post.excerpt || '')}`} target="_blank" rel="noreferrer" className="text-text-light/50 hover:text-text-light transition-colors" title="Share on LinkedIn">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                )}
                {/* WhatsApp */}
                {(showAll || hasWhatsApp) && (
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' - ' + shareUrl)}`} target="_blank" rel="noreferrer" className="text-text-light/50 hover:text-text-light transition-colors" title="Share on WhatsApp">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.023-5.115-2.887-6.979C16.584 1.9 14.111.875 11.487.875 6.052.875 1.626 5.3 1.622 10.74c-.001 1.716.463 3.397 1.343 4.922L1.97 21.09l5.586-1.464c1.554.847 3.197 1.29 4.823 1.292z" /></svg>
                  </a>
                )}
                {/* Copy Link */}
                <button onClick={copyToClipboard} className="text-text-light/50 hover:text-text-light transition-colors" title="Copy Link">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })()}

        <div className="flex items-center justify-between mb-16 text-text-light/60 text-sm font-medium">
          <div className="flex items-center gap-6">
            <span>{post.views || 0} views</span>
            <span>{comments.length || 0} comments</span>
            <span>{post.likes || 0} likes</span>
          </div>
          <button 
            onClick={handleLike} 
            disabled={hasLiked}
            className={`${hasLiked ? 'text-red-500 cursor-default' : 'hover:text-red-500'} transition-colors flex items-center gap-1`}
          >
            <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-heading-light">Recent Posts</h3>
              <Link href="/blog" className="text-sm font-semibold text-text-light/60 hover:text-primary transition-colors">See All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentPosts.map(rp => (
                <div key={rp.id} className="group rounded-2xl overflow-hidden bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                  {rp.featured_image_url && (
                    <Link href={`/blog/${rp.slug}`} className="block aspect-[16/9] w-full overflow-hidden">
                      <img
                        src={getOptimizedImageUrl(rp.featured_image_url, { width: 400, height: 250 })}
                        alt={rp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>
                  )}
                  <div className="p-4">
                    <Link href={`/blog/${rp.slug}`}>
                      <h4 className="text-base font-bold text-heading-light mb-1 line-clamp-1 group-hover:text-primary transition-colors">{rp.title}</h4>
                    </Link>
                    <div className="flex justify-between items-center mt-4 text-text-light/40">
                      <div className="flex items-center gap-3">
                        <button className="hover:text-red-500 transition-colors"><Heart className="w-4 h-4" /></button>
                        <button className="hover:text-primary transition-colors"><MessageCircle className="w-4 h-4" /></button>
                      </div>
                      <button className="hover:text-primary transition-colors"><Share2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="border border-white/10 rounded-2xl p-6 md:p-8 bg-black/20 mb-20" id="comments">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-heading-light">Comments</h3>
            {(() => {
              const avgRating = post.rating_count > 0 ? post.rating_total / post.rating_count : 0;
              return (
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3 h-3 ${avgRating >= star ? 'fill-yellow-500 text-yellow-500' : 'text-text-light/30'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-text-light/60">
                    {post.rating_count > 0 ? `${avgRating.toFixed(1)} (${post.rating_count} ${post.rating_count === 1 ? 'rating' : 'ratings'})` : 'No ratings yet'}
                  </span>
                </div>
              );
            })()}
          </div>
          
          <form onSubmit={handleCommentSubmit} className="border border-white/10 rounded-xl overflow-hidden bg-bg-dark/50 mb-8">
            <div className="p-4 border-b border-white/10 flex items-center gap-4">
              <span className="text-xs font-bold text-heading-light">Add a rating</span>
              <div className="flex text-text-light/30">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none hover:text-yellow-500 transition-colors">
                    <Star className={`w-4 h-4 ${rating >= star ? 'fill-yellow-500 text-yellow-500' : 'fill-current'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4">
              <textarea 
                required 
                value={commentForm.content}
                onChange={e => setCommentForm({...commentForm, content: e.target.value})}
                className="w-full bg-transparent text-text-light placeholder:text-text-light/40 focus:outline-none text-sm resize-none h-16"
                placeholder="Write a comment..."
              />
            </div>
            
            {/* Optional Name/Email inputs that expand when typing comment */}
            {commentForm.content.length > 0 && (
              <div className="p-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/40">
                <input type="text" required placeholder="Your Name" value={commentForm.author_name} onChange={e => setCommentForm({...commentForm, author_name: e.target.value})} className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-text-light focus:outline-none focus:border-primary" />
                <input type="email" required placeholder="Your Email" value={commentForm.author_email} onChange={e => setCommentForm({...commentForm, author_email: e.target.value})} className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-text-light focus:outline-none focus:border-primary" />
              </div>
            )}

            {commentForm.content.length > 0 && (
              <div className="p-4 border-t border-white/10 flex justify-end">
                <button type="submit" disabled={submittingComment} className="px-6 py-2 bg-primary text-black text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors">
                  {submittingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            )}
          </form>

          {commentSuccess && <div className="text-green-400 text-sm mb-6">{commentSuccess}</div>}
          {commentError && <div className="text-red-400 text-sm mb-6">{commentError}</div>}

          <div className="space-y-6">
            {comments.map((comment: any) => (
              <div key={comment.id} className="pb-6 border-b border-white/5 last:border-0 last:pb-0">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-text-light/60">
                    {comment.author_name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-heading-light">{comment.author_name}</span>
                      {comment.is_author_reply && (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-primary/20 text-primary">Author</span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-text-light/40">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-text-light/80 text-sm leading-relaxed whitespace-pre-wrap pl-12">
                  {comment.content}
                </div>
                
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-12 mt-6 space-y-6 border-l-2 border-white/5 pl-4">
                    {comment.replies.map((reply: any) => (
                      <div key={reply.id}>
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] text-text-light/60">
                            {reply.author_name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-heading-light">{reply.author_name}</span>
                              {reply.is_author_reply && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] uppercase font-bold bg-primary/20 text-primary">Author</span>
                              )}
                            </div>
                            <span className="text-[10px] font-medium text-text-light/40">{new Date(reply.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-text-light/80 text-sm leading-relaxed pl-9">
                          {reply.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </article>
  );
}
