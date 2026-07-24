'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';
import ContactCTA from '@/components/layout/ContactCTA';
import Head from 'next/head';

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const refreshKey = useRealtimeRefresh('blogComments');
  const [post, setPost] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Comment Form State
  const [commentForm, setCommentForm] = useState({ author_name: '', author_email: '', content: '' });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState('');
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    if (!params.slug) return;
    
    setLoading(true);
    fetchApi(`/blog/post/${params.slug}`)
      .then(async (res) => {
        setPost(res.data);
        
        // Parse blocks
        let parsedBlocks = [];
        try {
          parsedBlocks = JSON.parse(res.data.content || '[]');
          if (!Array.isArray(parsedBlocks)) {
            parsedBlocks = res.data.content ? [{ id: '1', type: 'p', content: res.data.content }] : [];
          }
        } catch {
          parsedBlocks = res.data.content ? [{ id: '1', type: 'p', content: res.data.content }] : [];
        }
        setBlocks(parsedBlocks);

        if (res.data.category) {
          const catRes = await fetchApi('/blog-categories/active');
          const cat = catRes.data.find((c: any) => c.slug === res.data.category);
          setCategory(cat);
        }
        // Load comments
        fetchApi(`/blog-comments/post/${res.data.id}`)
          .then(cRes => setComments(cRes.data))
          .catch(console.error);
      })
      .catch((err) => {
        console.error(err);
        router.push('/blog'); // Redirect if not found
      })
      .finally(() => setLoading(false));
  }, [params.slug, refreshKey]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingComment(true);
    setCommentSuccess('');
    setCommentError('');
    try {
      await fetchApi('/blog-comments', {
        method: 'POST',
        body: JSON.stringify({ ...commentForm, post_id: post.id })
      });
      setCommentSuccess('Your comment has been submitted and is pending approval.');
      setCommentForm({ author_name: '', author_email: '', content: '' });
    } catch (err: any) {
      setCommentError(err.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <>
      <Head>
        <title>{post.seo_title || post.title}</title>
        <meta name="description" content={post.seo_description || post.excerpt} />
        {post.seo_keywords && <meta name="keywords" content={post.seo_keywords} />}
      </Head>

      <article className="min-h-screen bg-bg-dark text-text-light pt-24 pb-12">
        {/* Post Header */}
        <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <span>/</span>
            {category && (
              <>
                <Link href={`/blog?category=${category.slug}`} className="hover:text-primary transition-colors">{category.name}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-500 truncate max-w-[200px]">{post.title}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-800 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                {post.author_avatar_url ? (
                  <img src={post.author_avatar_url} alt={post.author_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-black font-bold text-lg">
                    {(post.author_name || 'A')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">{post.author_name || 'Admin'}</p>
                <p className="text-xs text-primary">{post.author_title || 'Author'}</p>
              </div>
            </div>
            <div className="h-10 w-px bg-gray-800"></div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-300">
                {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-xs text-gray-500">
                {post.reading_time} min read • {post.views} views
              </p>
            </div>
          </div>
        </header>

        {/* JSON-LD Structured Data for Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.excerpt,
              image: post.featured_image_url || undefined,
              author: {
                '@type': 'Person',
                name: post.author_name || 'Admin',
              },
              datePublished: post.published_at,
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': typeof window !== 'undefined' ? window.location.href : '',
              },
            }),
          }}
        />

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16">
            <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative group">
              <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-40"></div>
            </div>
          </div>
        )}

        {/* Main Content Layout with Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left/Main Column: Article Body & Comments */}
            <div className="lg:col-span-8 space-y-12">
              <div className="prose prose-invert prose-lg max-w-none prose-a:text-primary hover:prose-a:text-primary-dark prose-img:rounded-xl prose-img:border prose-img:border-gray-800 space-y-8 text-gray-300 leading-relaxed text-lg">
                {blocks.map((block) => (
                  <div key={block.id} id={block.type === 'h2' || block.type === 'h3' ? `heading-${block.id}` : undefined} className="block-wrapper scroll-mt-28">
                    {block.type === 'h2' && <h2 className="text-3xl font-bold mt-12 mb-6 text-white border-b border-gray-800 pb-3">{block.content}</h2>}
                    {block.type === 'h3' && <h3 className="text-2xl font-bold mt-8 mb-4 text-white">{block.content}</h3>}
                    {block.type === 'p' && <p className="text-gray-300 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: block.content }} />}
                    {block.type === 'quote' && (
                      <blockquote className="border-l-4 border-primary pl-6 py-4 my-8 italic text-gray-300 bg-gray-900/60 rounded-r-xl text-xl font-serif">
                        "{block.content}"
                      </blockquote>
                    )}
                    {block.type === 'code' && (
                      <div className="my-8 rounded-xl overflow-hidden border border-gray-800 bg-gray-950 shadow-xl">
                        {block.language && (
                          <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 text-xs text-primary uppercase tracking-wider font-mono font-semibold flex justify-between items-center">
                            <span>{block.language}</span>
                            <button onClick={() => navigator.clipboard.writeText(block.content)} className="text-gray-400 hover:text-white text-xs">Copy</button>
                          </div>
                        )}
                        <pre className="p-5 overflow-x-auto text-sm text-gray-200 font-mono leading-relaxed">
                          <code>{block.content}</code>
                        </pre>
                      </div>
                    )}
                    {block.type === 'ul' && (
                      <ul className="list-disc pl-6 space-y-2 text-gray-300 my-6">
                        {(block.content || '').split('\n').filter(Boolean).map((item: string, i: number) => (
                          <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                      </ul>
                    )}
                    {block.type === 'ol' && (
                      <ol className="list-decimal pl-6 space-y-2 text-gray-300 my-6">
                        {(block.content || '').split('\n').filter(Boolean).map((item: string, i: number) => (
                          <li key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                      </ol>
                    )}
                    {block.type === 'callout' && (
                      <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-2xl my-8 text-gray-200 shadow-lg">
                        <div className="flex gap-3">
                          <span className="text-2xl">💡</span>
                          <div className="flex-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.content }} />
                        </div>
                      </div>
                    )}
                    {block.type === 'hr' && (
                      <hr className="border-gray-800 my-12" />
                    )}
                    {block.type === 'img' && block.url && (
                      <figure className="my-10">
                        <img src={block.url} alt={block.caption || 'Blog image'} className="w-full rounded-2xl shadow-2xl border border-gray-800 object-cover" />
                        {block.caption && (
                          <figcaption className="text-center text-sm text-gray-500 mt-4 italic">
                            {block.caption}
                          </figcaption>
                        )}
                      </figure>
                    )}
                  </div>
                ))}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="pt-8 border-t border-gray-800 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-gray-400 mr-2">Tags:</span>
                  {post.tags.map((tag: string) => (
                    <Link key={tag} href={`/blog?tag=${tag}`} className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-sm rounded-full transition-colors">
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Author Bio Card */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-lg">
                <div className="w-20 h-20 shrink-0 rounded-full bg-gray-800 overflow-hidden border-2 border-primary">
                  {post.author_avatar_url ? (
                    <img src={post.author_avatar_url} alt={post.author_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-black font-bold text-2xl">
                      {(post.author_name || 'A')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold text-white mb-1">Written by {post.author_name || 'Admin'}</h3>
                  <p className="text-sm text-primary mb-3 font-medium">{post.author_title || 'Software Architect'}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Thank you for reading! I write articles on full-stack architecture, software engineering principles, and modern web development best practices.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Table of Contents & Quick Actions */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="sticky top-28 space-y-6">
                
                {/* Table of Contents */}
                {blocks.some(b => b.type === 'h2' || b.type === 'h3') && (
                  <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 backdrop-blur shadow-xl">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Table of Contents
                    </h3>
                    <nav className="space-y-2 text-sm">
                      {blocks.filter(b => b.type === 'h2' || b.type === 'h3').map((heading) => (
                        <a
                          key={heading.id}
                          href={`#heading-${heading.id}`}
                          className={`block transition-colors hover:text-primary ${
                            heading.type === 'h3' ? 'pl-4 text-gray-500 hover:text-gray-300 text-xs' : 'text-gray-400 font-medium'
                          }`}
                        >
                          {heading.content}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Share Article */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 backdrop-blur shadow-xl space-y-4">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400">Share Article</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Article URL copied to clipboard!');
                        }
                      }}
                      className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold border border-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>🔗</span> Copy Link
                    </button>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold border border-gray-700 transition-colors"
                      title="Share on Twitter"
                    >
                      𝕏
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold border border-gray-700 transition-colors"
                      title="Share on LinkedIn"
                    >
                      in
                    </a>
                  </div>
                </div>

              </div>
            </aside>

          </div>
        </div>

        {/* Phase 2: Comments */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-16 border-t border-gray-800" id="comments">
          <h3 className="text-2xl font-bold text-white mb-8">Join the Discussion</h3>
          
          <form onSubmit={handleCommentSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 mb-12">
            <h4 className="text-lg font-semibold text-white">Leave a Comment</h4>
            
            {commentSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm">
                {commentSuccess}
              </div>
            )}
            
            {commentError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                {commentError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Name <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={commentForm.author_name}
                  onChange={e => setCommentForm({...commentForm, author_name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Email <span className="text-red-400">*</span> <span className="text-gray-500 font-normal ml-1">(will not be published)</span></label>
                <input 
                  type="email" 
                  required 
                  value={commentForm.author_email}
                  onChange={e => setCommentForm({...commentForm, author_email: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Comment <span className="text-red-400">*</span></label>
              <textarea 
                required 
                value={commentForm.content}
                onChange={e => setCommentForm({...commentForm, content: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors h-32 resize-y"
                placeholder="Share your thoughts..."
              />
            </div>
            
            <button 
              type="submit" 
              disabled={submittingComment}
              className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {submittingComment ? 'Submitting...' : 'Post Comment'}
            </button>
          </form>

          <div className="space-y-8">
            <h4 className="text-xl font-bold text-white mb-6">
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </h4>
            
            {comments.map((comment: any) => (
              <div key={comment.id} className="space-y-6">
                <div className={`p-6 rounded-2xl border ${comment.is_author_reply ? 'bg-primary/5 border-primary/20' : 'bg-gray-900 border-gray-800'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-400">
                      {comment.author_name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{comment.author_name}</span>
                        {comment.is_author_reply && (
                          <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary border border-primary/30">Author</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                    {comment.content}
                  </div>
                </div>
                
                {/* Threaded Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-8 md:ml-12 space-y-6 border-l-2 border-gray-800 pl-4 md:pl-6">
                    {comment.replies.map((reply: any) => (
                      <div key={reply.id} className={`p-6 rounded-2xl border ${reply.is_author_reply ? 'bg-primary/5 border-primary/20' : 'bg-gray-900 border-gray-800'}`}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-400">
                            {reply.author_name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{reply.author_name}</span>
                              {reply.is_author_reply && (
                                <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary border border-primary/30">Author</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{new Date(reply.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
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

        <div className="mt-24">
          <ContactCTA />
        </div>
      </article>
    </>
  );
}
