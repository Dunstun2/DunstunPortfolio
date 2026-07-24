'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';
import ContactCTA from '@/components/layout/ContactCTA';
import Head from 'next/head';

export default function BlogPage() {
  const refreshKey = useRealtimeRefresh('blog');
  const refreshKeySettings = useRealtimeRefresh('settings');
  const [posts, setPosts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [featuredPost, setFeaturedPost] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([
      fetchApi('/blog-categories/active'),
      fetchApi('/blog/featured'),
      fetchApi('/settings')
    ])
      .then(([categoriesRes, featuredRes, settingsRes]) => {
        setCategories(categoriesRes.data || []);
        setFeaturedPost(featuredRes.data[0] || null);
        setSettings(settingsRes.data);
      })
      .catch(console.error);
  }, [refreshKeySettings]);

  useEffect(() => {
    let url = '/blog/published';
    const params = new URLSearchParams();
    if (activeCategory) params.append('category', activeCategory);
    if (searchQuery) params.append('search', searchQuery);

    fetchApi(`${url}?${params.toString()}`).then(res => setPosts(res.data)).catch(console.error);
  }, [refreshKey, activeCategory, searchQuery]);

  return (
    <>
      <Head>
        <title>Blog | Software Development & Technology Insights</title>
        <meta name="description" content="A collection of thoughts on software development, technology, and life. Discover my latest articles and insights." />
        <meta name="keywords" content="blog, technology, software development, programming, web development" />
      </Head>
      <div className="min-h-screen bg-bg-dark text-text-light pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          {/* Header */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {(settings?.blog_page_title || 'Insights, Ideas & Experiences').split(' ').map((word: string, i: number, arr: string[]) => (
                i === arr.length - 1 ? <span key={i} className="text-primary">{word}</span> : word + ' '
              ))}
            </h1>
            <p className="text-lg text-gray-400">
              {settings?.blog_page_subtitle || 'A collection of thoughts on software development, technology, and life.'}
            </p>

            <div className="max-w-xl mx-auto pt-4 relative">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-full px-6 py-3 text-white focus:outline-none focus:border-primary pl-12 shadow-inner"
              />
              <svg className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setActiveCategory('')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === ''
                  ? 'bg-primary text-black shadow-lg shadow-primary/20'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
                  }`}
              >
                All Topics
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeCategory === cat.slug
                    ? 'bg-primary text-black shadow-lg shadow-primary/20'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
                    }`}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Featured Post (Only show if no search/category filter) */}
          {featuredPost && !activeCategory && !searchQuery && (
            <Link href={`/blog/${featuredPost.slug}`} className="block group">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 group-hover:border-primary/50 transition-colors shadow-lg">
                <div className="relative h-64 md:h-auto w-full">
                  {featuredPost.featured_image_url ? (
                    <img src={featuredPost.featured_image_url} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <span className="text-gray-600 text-4xl font-bold">BLOG</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-primary text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Featured
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span>{new Date(featuredPost.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-700"></span>
                    <span>{featuredPost.reading_time} min read</span>
                    {featuredPost.category && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-700"></span>
                        <span className="text-primary">{categories.find(c => c.slug === featuredPost.category)?.name || featuredPost.category}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 group-hover:text-primary transition-colors line-clamp-2">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-400 mb-6 line-clamp-3 text-lg">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-gray-700">
                      {featuredPost.author_avatar_url ? (
                        <img src={featuredPost.author_avatar_url} alt={featuredPost.author_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary text-black font-bold">
                          {(featuredPost.author_name || 'A')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{featuredPost.author_name || 'Admin'}</p>
                      <p className="text-xs text-gray-500">{featuredPost.author_title || 'Author'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Latest Posts Grid */}
          <div className="space-y-8">
            {activeCategory || searchQuery ? (
              <h2 className="text-2xl font-bold text-white">
                {searchQuery ? `Search Results for "${searchQuery}"` : `${categories.find(c => c.slug === activeCategory)?.name || 'Category'} Posts`}
              </h2>
            ) : (
              <h2 className="text-2xl font-bold text-white">Latest Posts</h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <p>No posts found matching your criteria.</p>
                </div>
              ) : posts.map(post => (
                <Link href={`/blog/${post.slug}`} key={post.id} className="group flex flex-col bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors shadow-lg">
                  <div className="relative h-56 w-full overflow-hidden">
                    {post.featured_image_url ? (
                      <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    )}
                    {post.category && (
                      <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full border border-gray-700/50">
                        {categories.find(c => c.slug === post.category)?.name || post.category}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                      <span>{post.reading_time} min read</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-800">
                      <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden">
                        {post.author_avatar_url ? (
                          <img src={post.author_avatar_url} alt={post.author_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary text-black font-bold text-xs">
                            {(post.author_name || 'A')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-300">{post.author_name || 'Admin'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

        <div className="mt-20">
          <ContactCTA />
        </div>
      </div>
    </>
  );
}
