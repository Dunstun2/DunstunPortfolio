'use client';
import { useState, useEffect, useRef } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { API_BASE_URL, getFileUrl } from '@/utils/urls';

function AutoResizingTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(60, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
      className={`overflow-hidden resize-none ${className}`}
    />
  );
}

import BlogNavigation from './BlogNavigation';

export default function AdminBlogPosts() {
  const refreshKey = useRealtimeRefresh('blog');
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'seo'>('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [importingDoc, setImportingDoc] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  type Block = { id: string; type: 'h2' | 'h3' | 'p' | 'img' | 'code' | 'quote' | 'ul' | 'ol' | 'callout' | 'hr'; content: string; url?: string; caption?: string; language?: string };
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<Block[][]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  const pushToHistory = (newBlocks: Block[]) => {
    const updatedHistory = history.slice(0, historyStep + 1);
    setHistory([...updatedHistory, newBlocks]);
    setHistoryStep(updatedHistory.length);
    setBlocks(newBlocks);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      setBlocks(history[prevStep]);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      setBlocks(history[nextStep]);
    }
  };

  const initialForm = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    category: '',
    tags: [] as string[],
    status: 'draft',
    featured: false,
    author_name: '',
    author_title: '',
    author_avatar_url: '',
    reading_time: 0,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  };

  const [formData, setFormData] = useState<any>(initialForm);

  const [adminPhoto, setAdminPhoto] = useState<string>('');

  const loadData = () => {
    fetchApi('/blog').then(res => setItems(res.data)).catch(console.error);
    fetchApi('/blog-categories').then(res => setCategories(res.data)).catch(console.error);
    fetchApi('/blog-tags').then(res => setTags(res.data)).catch(console.error);
  };

  // Fetch admin profile photo from About or Hero sections
  useEffect(() => {
    const fetchAdminPhoto = async () => {
      try {
        // Try About section first
        const aboutRes = await fetchApi('/about').catch(() => null);
        if (aboutRes?.data) {
          const aboutData = Array.isArray(aboutRes.data) ? aboutRes.data[0] : aboutRes.data;
          if (aboutData?.image_url) {
            setAdminPhoto(aboutData.image_url);
            return;
          }
        }
        // Fall back to Hero section
        const heroRes = await fetchApi('/hero').catch(() => null);
        if (heroRes?.data) {
          const heroData = Array.isArray(heroRes.data) ? heroRes.data.find((h: any) => h.is_active) || heroRes.data[0] : heroRes.data;
          if (heroData?.image_url) {
            setAdminPhoto(heroData.image_url);
          }
        }
      } catch { /* silently ignore */ }
    };
    fetchAdminPhoto();
  }, []);

  useEffect(() => { loadData(); }, [refreshKey]);

  const uploadFile = async (file: File): Promise<string> => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('folder', '/blog');
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/media`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: uploadData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const resData = await res.json();
    return getFileUrl(resData.data.file_path);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);
    try {
      const url = await uploadFile(e.target.files[0]);
      setFormData((prev: any) => ({ ...prev, featured_image_url: url }));
    } catch (err) {
      alert('Failed to upload cover image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAuthorPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const url = await uploadFile(e.target.files[0]);
      setFormData((prev: any) => ({ ...prev, author_avatar_url: url }));
    } catch (err) {
      alert('Failed to upload author photo');
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData, content: JSON.stringify(blocks) };
      if (isEditing) {
        await fetchApi(`/blog/${editId}`, { method: 'PUT', body: JSON.stringify(dataToSubmit) });
      } else {
        await fetchApi('/blog', { method: 'POST', body: JSON.stringify(dataToSubmit) });
      }
      setIsEditing(false);
      setFormData(initialForm);
      setBlocks([]);
      setActiveTab('basic');
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      content: item.content || '',
      featured_image_url: item.featured_image_url || '',
      category: item.category || '',
      tags: item.tags || [],
      status: item.status,
      featured: item.featured,
      author_name: item.author_name || '',
      author_title: item.author_title || '',
      author_avatar_url: item.author_avatar_url || '',
      reading_time: item.reading_time || 0,
      seo_title: item.seo_title || '',
      seo_description: item.seo_description || '',
      seo_keywords: item.seo_keywords || '',
    });
    
    let parsedBlocks = [];
    try {
      parsedBlocks = JSON.parse(item.content || '[]');
      if (!Array.isArray(parsedBlocks)) {
        parsedBlocks = item.content ? [{ id: Date.now().toString(), type: 'p', content: item.content }] : [];
      }
    } catch {
      parsedBlocks = item.content ? [{ id: Date.now().toString(), type: 'p', content: item.content }] : [];
    }
    setBlocks(parsedBlocks);
    setHistory([parsedBlocks]);
    setHistoryStep(0);
    
    setEditId(item.id);
    setIsEditing(true);
    setActiveTab('basic');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await fetchApi(`/blog/${id}`, { method: 'DELETE' });
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleTagToggle = (tagSlug: string) => {
    setFormData((prev: any) => {
      const tags = prev.tags.includes(tagSlug)
        ? prev.tags.filter((t: string) => t !== tagSlug)
        : [...prev.tags, tagSlug];
      return { ...prev, tags };
    });
  };

  const addBlock = (type: Block['type']) => {
    const newBlocks = [...blocks, { id: Date.now().toString(), type, content: '' }];
    pushToHistory(newBlocks);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, ...updates } : b);
    pushToHistory(newBlocks);
  };

  const removeBlock = (id: string) => {
    const newBlocks = blocks.filter(b => b.id !== id);
    pushToHistory(newBlocks);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    pushToHistory(newBlocks);
  };

  const insertLinkToActiveBlock = (targetId?: string) => {
    let targetBlockId = targetId || activeBlockId;
    if (!targetBlockId && blocks.length > 0) {
      targetBlockId = blocks[blocks.length - 1].id;
    }
    if (!targetBlockId) return;

    const html = `<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary-dark font-medium">link text</a>`;
    const currentContent = blocks.find(b => b.id === targetBlockId)?.content || '';
    updateBlock(targetBlockId, { content: currentContent ? `${currentContent} ${html}` : html });
  };

  const insertFormatTagToActiveBlock = (tag: 'b' | 'i' | 'u' | 's' | 'mark', targetId?: string) => {
    let targetBlockId = targetId || activeBlockId;
    if (!targetBlockId && blocks.length > 0) {
      targetBlockId = blocks[blocks.length - 1].id;
    }
    if (!targetBlockId) return;

    let html = '';
    if (tag === 'b') html = `<b>bold text</b>`;
    if (tag === 'i') html = `<i>italic text</i>`;
    if (tag === 'u') html = `<u style="text-decoration: underline;">underlined text</u>`;
    if (tag === 's') html = `<s>strikethrough text</s>`;
    if (tag === 'mark') html = `<mark style="background-color: #fef08a; color: #000000; padding: 2px 6px; border-radius: 4px; font-weight: 600;">highlighted text</mark>`;
    
    const currentContent = blocks.find(b => b.id === targetBlockId)?.content || '';
    updateBlock(targetBlockId, { content: currentContent ? `${currentContent} ${html}` : html });
  };

  const handleDocumentImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setImportingDoc(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/blog/import-document`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: uploadData,
      });
      if (!res.ok) throw new Error('Document parsing failed');
      const resData = await res.json();
      const parsed = resData.data;

      if (parsed.title) {
        setFormData((prev: any) => ({
          ...prev,
          title: parsed.title,
          slug: parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          excerpt: parsed.excerpt || prev.excerpt,
        }));
      }
      if (parsed.blocks && parsed.blocks.length > 0) {
        pushToHistory(parsed.blocks);
        setActiveTab('content');
      }
      alert('Document imported successfully! Headings, paragraphs, lists, and images have been arranged into your blocks.');
    } catch (err: any) {
      alert(err.message || 'Failed to import document');
    } finally {
      setImportingDoc(false);
      e.target.value = '';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <BlogNavigation />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex flex-wrap items-center gap-3">
            Blog Posts
            <button 
              onClick={() => setShowManual(true)}
              className="text-sm px-3 py-1 bg-primary/20 text-primary rounded-full hover:bg-primary/30 transition-colors font-medium"
            >
              📖 How to Blog
            </button>
            <div className="relative inline-block">
              <input 
                type="file" 
                accept=".docx,.pdf" 
                onChange={handleDocumentImport} 
                disabled={importingDoc} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" 
              />
              <button 
                type="button" 
                disabled={importingDoc} 
                className="text-sm px-3.5 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full hover:bg-green-500/30 transition-colors font-medium flex items-center gap-1.5"
              >
                <span>📄</span> {importingDoc ? 'Extracting Article...' : 'Import Word / PDF Document'}
              </button>
            </div>
          </h1>
          <p className="text-gray-400 text-sm">Create and manage your blog articles.</p>
        </div>
        {isEditing && (
          <button onClick={() => { setIsEditing(false); setFormData(initialForm); setBlocks([]); setActiveTab('basic'); }} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Cancel Edit
          </button>
        )}
      </div>

      {showManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">📖 Blog Manual</h2>
              <button onClick={() => setShowManual(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8 text-gray-300">
              
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-5">
                <h3 className="text-xl font-bold text-primary mb-2">Welcome to the Blogging System</h3>
                <p className="text-sm">This manual will guide you through the entire journey of creating and managing a professional blog. This system was built to be fully dynamic, meaning you have complete control over every aspect without needing a developer.</p>
              </div>

              <section>
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
                  <span className="bg-gray-800 px-2 rounded text-primary">Step 1</span> The Foundation: Categories & Tags
                </h3>
                <p className="mb-4 text-sm text-gray-400">Before writing your first post, you must establish how your content will be organized. Do this in the <strong>Blog Categories</strong> and <strong>Blog Tags</strong> menus.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-bold text-white mb-1">Categories (The Chapters)</h4>
                    <p className="text-sm mb-2">Broad, high-level topics. A post usually belongs to just <strong>one</strong> category.</p>
                    <p className="text-xs text-gray-400"><em>Examples: Web Development, Design, Career Advice</em></p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-bold text-white mb-1">Tags (The Index)</h4>
                    <p className="text-sm mb-2">Specific, granular keywords. A post can have <strong>many</strong> tags.</p>
                    <p className="text-xs text-gray-400"><em>Examples: React, Next.js, CSS Grid, Interviews</em></p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
                  <span className="bg-gray-800 px-2 rounded text-primary">Step 2</span> Writing a Post
                </h3>
                <p className="mb-4 text-sm">When you click <strong>Blog Posts</strong>, you'll see a 3-tab system to build your article.</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-200">Tab 1: Basic Info</h4>
                    <p className="text-sm text-gray-400">Set your Title, Sub Title (an optional short summary for previews), Category, Tags, Cover Image, and Status. You can save a post as a <strong>Draft</strong> if you're not ready for the public to see it.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-200">Tab 2: Content Builder</h4>
                    <p className="text-sm text-gray-400 mb-2">Your post is constructed using blocks. You can stack them in any order and move them up/down.</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-400">
                      <li><strong>H2/H3:</strong> Headings to break up sections.</li>
                      <li><strong>Paragraph:</strong> Standard text. Supports basic HTML tags if needed.</li>
                      <li><strong>Quote:</strong> Pull-quotes to emphasize statements.</li>
                      <li><strong>Code:</strong> Beautifully formatted code snippets for technical readers.</li>
                      <li><strong>Image:</strong> Paste an image URL to embed visuals between paragraphs.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-200">Tab 3: SEO (Search Engine Optimization)</h4>
                    <p className="text-sm text-gray-400">This controls how your post appears on Google and when shared on LinkedIn/Twitter. If left blank, it automatically uses your Basic Info.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
                  <span className="bg-gray-800 px-2 rounded text-primary">Step 3</span> The Reader's Journey
                </h3>
                <p className="mb-4 text-sm text-gray-400">Once you change a post's status to <strong>Published</strong>, here is how the public interacts with it:</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="text-xl">🔍</span>
                    <div><strong>Discovery:</strong> Readers find your post on the main Blog page, or by clicking a specific Category/Tag pill to filter your articles.</div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-xl">📖</span>
                    <div><strong>Reading:</strong> They read the article, complete with your formatted code blocks and images. The system automatically suggests "Related Posts" based on overlapping tags.</div>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-xl">💬</span>
                    <div><strong>Engagement:</strong> At the bottom, readers can leave comments. To prevent spam, these comments do not immediately appear publicly.</div>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
                  <span className="bg-gray-800 px-2 rounded text-primary">Step 4</span> Moderation (Comments)
                </h3>
                <p className="text-sm mb-3">When a reader leaves a comment, you must moderate it:</p>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-400">
                  <li>Navigate to the <strong>Comments</strong> section in your sidebar.</li>
                  <li>Review pending comments.</li>
                  <li>Click <strong>Approve</strong> to make it visible on the live blog, or <strong>Delete</strong> for spam.</li>
                  <li>You can also reply directly from the dashboard to engage with your readers.</li>
                </ol>
              </section>

            </div>
            <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end">
              <button onClick={() => setShowManual(false)} className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary-dark transition-colors">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="flex border-b border-gray-800 overflow-x-auto custom-scrollbar">
              {['basic', 'content', 'seo'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
                </button>
              ))}
            </div>

            <div className="p-6 flex-grow space-y-6">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Title</label>
                      <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Slug</label>
                      <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary placeholder-gray-600" placeholder="Auto-generated if empty" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Sub Title (Optional)</label>
                    <textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} placeholder="A short sub title or summary for the post" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary h-24" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Category</label>
                      <input 
                        list="categories-list" 
                        value={formData.category} 
                        onChange={e => setFormData({...formData, category: e.target.value})} 
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                        placeholder="Type or select a category"
                      />
                      <datalist id="categories-list">
                        {categories.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                      </datalist>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary">
                        <option value="draft">Draft</option>
                        <option value="review">Review</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="space-y-2 flex items-center pt-8">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="form-checkbox h-5 w-5 text-primary rounded border-gray-600 bg-gray-700 focus:ring-primary focus:ring-offset-gray-900" />
                        <span className="text-sm font-medium text-gray-300">Featured Post</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleTagToggle(t.slug)}
                          className={`px-3 py-1 text-xs rounded-full border ${formData.tags.includes(t.slug) ? 'bg-primary/20 border-primary text-primary' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'}`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-gray-800">
                    <label className="block text-sm font-medium text-gray-300">Cover Image</label>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1 space-y-2">
                        <input type="text" value={formData.featured_image_url} onChange={e => setFormData({...formData, featured_image_url: e.target.value})} placeholder="Image URL" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
                      </div>
                      <div className="shrink-0 relative">
                        <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploadingImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                        <button type="button" disabled={uploadingImage} className="px-4 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap">
                          {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        </button>
                      </div>
                    </div>
                    {formData.featured_image_url && (
                      <div className="mt-4 relative h-48 w-full max-w-md rounded-lg overflow-hidden border border-gray-700">
                        <img src={formData.featured_image_url} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Author & Reading Time Section */}
                  <div className="space-y-4 pt-6 border-t border-gray-800">
                    <h4 className="text-sm font-bold text-gray-200 flex items-center gap-2">✍️ Author & Reading Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Author Name</label>
                        <input type="text" value={formData.author_name} onChange={e => setFormData({...formData, author_name: e.target.value})} placeholder="e.g. John Doe" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Author Title</label>
                        <input type="text" value={formData.author_title} onChange={e => setFormData({...formData, author_title: e.target.value})} placeholder="e.g. Software Engineer" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Est. Reading Time (min)</label>
                        <input type="number" min="0" value={formData.reading_time} onChange={e => setFormData({...formData, reading_time: parseInt(e.target.value) || 0})} placeholder="e.g. 5" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Author Cover Photo</label>
                      {adminPhoto && !formData.author_avatar_url && (
                        <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/40 shrink-0">
                            <img src={adminPhoto} alt="Admin Photo" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-400">Using your profile photo from About/Hero section</p>
                          </div>
                          <button type="button" onClick={() => setFormData({...formData, author_avatar_url: adminPhoto})} className="text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/30 transition-colors">Use This</button>
                        </div>
                      )}
                      <div className="flex gap-3 items-center">
                        <input type="text" value={formData.author_avatar_url} onChange={e => setFormData({...formData, author_avatar_url: e.target.value})} placeholder="Paste image URL or upload a photo" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
                        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm px-3 py-2.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5">
                          📷 Upload
                          <input type="file" accept="image/*" onChange={handleAuthorPhotoUpload} className="hidden" />
                        </label>
                        {(formData.author_avatar_url || adminPhoto) && (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/40 shrink-0">
                            <img src={formData.author_avatar_url || adminPhoto} alt="Author Photo" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                      {formData.author_avatar_url && adminPhoto && formData.author_avatar_url !== adminPhoto && (
                        <button type="button" onClick={() => setFormData({...formData, author_avatar_url: ''})} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">↩ Reset to profile photo</button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 italic">📅 Published date is set automatically when you change the status to "Published".</p>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="space-y-6 flex flex-col">
                  <div className="space-y-3 pb-4 border-b border-gray-800">
                    {/* Add Block Toolbar */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Add Block:</span>
                      <button type="button" onClick={() => addBlock('h2')} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded border border-gray-700">H2</button>
                      <button type="button" onClick={() => addBlock('h3')} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded border border-gray-700">H3</button>
                      <button type="button" onClick={() => addBlock('p')} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded border border-gray-700">Paragraph</button>
                      <button type="button" onClick={() => addBlock('quote')} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded border border-gray-700">Quote</button>
                      <button type="button" onClick={() => addBlock('ul')} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded border border-gray-700">• Bullet List</button>
                      <button type="button" onClick={() => addBlock('ol')} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded border border-gray-700">1. Numbered List</button>
                      <button type="button" onClick={() => addBlock('callout')} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded border border-gray-700">💡 Callout Box</button>
                      <button type="button" onClick={() => addBlock('code')} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded border border-gray-700">Code</button>
                      <button type="button" onClick={() => addBlock('img')} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded border border-gray-700">Image</button>
                      <button type="button" onClick={() => addBlock('hr')} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded border border-gray-700">― Divider Line</button>
                    </div>

                    {/* Word Formatting Ribbon Toolbar */}
                    <div className="flex flex-wrap gap-2 items-center bg-gray-950 p-2 rounded-lg border border-gray-800">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider mr-2 flex items-center gap-1">
                        <span>Formatting Ribbon:</span>
                      </span>
                      <button type="button" onClick={handleUndo} disabled={historyStep <= 0} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded font-medium border border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">↩ Undo</button>
                      <button type="button" onClick={handleRedo} disabled={historyStep >= history.length - 1} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-white rounded font-medium border border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">↪ Redo</button>
                      <div className="w-px h-4 bg-gray-800 mx-1"></div>
                      <button type="button" onClick={() => insertLinkToActiveBlock()} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-primary rounded font-medium flex items-center gap-1 border border-gray-700">🔗 Insert Link</button>
                      <button type="button" onClick={() => insertFormatTagToActiveBlock('b')} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-white font-bold rounded border border-gray-700">B Bold</button>
                      <button type="button" onClick={() => insertFormatTagToActiveBlock('i')} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-white italic rounded border border-gray-700">I Italic</button>
                      <button type="button" onClick={() => insertFormatTagToActiveBlock('u')} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-white underline rounded border border-gray-700">U Underline</button>
                      <button type="button" onClick={() => insertFormatTagToActiveBlock('s')} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-white line-through rounded border border-gray-700">S Strikethrough</button>
                      <button type="button" onClick={() => insertFormatTagToActiveBlock('mark')} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-yellow-400 rounded border border-gray-700">🎨 Highlight</button>
                      <span className="text-[11px] text-gray-500 ml-auto hidden sm:inline">Applies to active block</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {blocks.length === 0 ? (
                      <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                        Start building your post by adding a block above.
                      </div>
                    ) : blocks.map((block, index) => (
                      <div 
                        key={block.id} 
                        onClick={() => setActiveBlockId(block.id)}
                        className={`relative group rounded-xl p-4 transition-all border ${
                          activeBlockId === block.id ? 'bg-gray-900 border-primary/50 shadow-lg shadow-primary/5' : 'bg-gray-950 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-gray-900 rounded border border-gray-800 z-10">
                          <button type="button" onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30">↑</button>
                          <button type="button" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30">↓</button>
                          <div className="w-px bg-gray-800 mx-1"></div>
                          <button type="button" onClick={() => removeBlock(block.id)} className="p-1.5 text-red-400 hover:text-red-300">✕</button>
                        </div>

                        {/* Render input based on block type */}
                        <div className="pr-12">
                          {(block.type === 'h2' || block.type === 'h3') && (
                            <input 
                              type="text" 
                              value={block.content} 
                              onChange={e => updateBlock(block.id, { content: e.target.value })}
                              placeholder={block.type === 'h2' ? 'Heading 2' : 'Heading 3'}
                              className={`w-full bg-transparent text-white focus:outline-none border-b border-transparent focus:border-gray-800 pb-1 ${block.type === 'h2' ? 'text-2xl font-bold' : 'text-xl font-bold'}`}
                            />
                          )}
                          
                          {block.type === 'p' && (
                            <AutoResizingTextarea 
                              value={block.content} 
                              onChange={e => updateBlock(block.id, { content: e.target.value })}
                              placeholder="Paragraph text... (HTML supported)"
                              className="w-full bg-transparent text-gray-300 focus:outline-none border border-transparent focus:border-gray-800 rounded p-2"
                            />
                          )}
                          
                          {block.type === 'quote' && (
                            <div className="border-l-4 border-primary pl-4 py-1">
                              <AutoResizingTextarea 
                                value={block.content} 
                                onChange={e => updateBlock(block.id, { content: e.target.value })}
                                placeholder="Quote text..."
                                className="w-full bg-transparent text-gray-300 italic focus:outline-none border border-transparent focus:border-gray-800 rounded p-2"
                              />
                            </div>
                          )}

                          {block.type === 'code' && (
                            <div className="space-y-2">
                              <input 
                                type="text" 
                                value={block.language || ''} 
                                onChange={e => updateBlock(block.id, { language: e.target.value })}
                                placeholder="Language (e.g. javascript, bash)"
                                className="w-48 bg-gray-900 text-xs text-gray-400 focus:outline-none border border-gray-800 focus:border-gray-700 rounded px-2 py-1"
                              />
                              <AutoResizingTextarea 
                                value={block.content} 
                                onChange={e => updateBlock(block.id, { content: e.target.value })}
                                placeholder="Code goes here..."
                                className="w-full bg-gray-900 text-gray-300 font-mono text-sm focus:outline-none border border-gray-800 focus:border-gray-700 rounded p-3"
                              />
                            </div>
                          )}

                          {block.type === 'ul' && (
                            <div className="space-y-1">
                              <p className="text-xs text-gray-400">Bullet List (enter each item on a new line):</p>
                              <AutoResizingTextarea
                                value={block.content}
                                onChange={e => updateBlock(block.id, { content: e.target.value })}
                                placeholder="First item&#10;Second item&#10;Third item"
                                className="w-full bg-transparent text-gray-300 focus:outline-none border border-gray-800 rounded p-2"
                              />
                            </div>
                          )}

                          {block.type === 'ol' && (
                            <div className="space-y-1">
                              <p className="text-xs text-gray-400">Numbered List (enter each item on a new line):</p>
                              <AutoResizingTextarea
                                value={block.content}
                                onChange={e => updateBlock(block.id, { content: e.target.value })}
                                placeholder="Step 1&#10;Step 2&#10;Step 3"
                                className="w-full bg-transparent text-gray-300 focus:outline-none border border-gray-800 rounded p-2"
                              />
                            </div>
                          )}

                          {block.type === 'callout' && (
                            <div className="bg-primary/10 border-l-4 border-primary p-3 rounded-r-lg">
                              <p className="text-xs text-primary font-bold mb-1">💡 Callout / Highlight Box</p>
                              <AutoResizingTextarea
                                value={block.content}
                                onChange={e => updateBlock(block.id, { content: e.target.value })}
                                placeholder="Highlight an important note or callout..."
                                className="w-full bg-transparent text-gray-200 focus:outline-none"
                              />
                            </div>
                          )}

                          {block.type === 'hr' && (
                            <div className="py-2 text-center">
                              <div className="h-px bg-gray-800 w-full my-2"></div>
                              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Horizontal Divider Line</span>
                            </div>
                          )}

                          {block.type === 'img' && (
                            <div className="space-y-3">
                              <input 
                                type="text" 
                                value={block.url || ''} 
                                onChange={e => updateBlock(block.id, { url: e.target.value })}
                                placeholder="Image URL (paste absolute URL here)"
                                className="w-full bg-gray-900 text-sm text-gray-300 focus:outline-none border border-gray-800 focus:border-gray-700 rounded px-3 py-2"
                              />
                              {block.url && (
                                <div className="h-32 w-48 relative rounded-lg border border-gray-800 overflow-hidden">
                                  <img src={block.url} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <input 
                                type="text" 
                                value={block.caption || ''} 
                                onChange={e => updateBlock(block.id, { caption: e.target.value })}
                                placeholder="Caption (optional)"
                                className="w-full bg-transparent text-xs text-gray-500 text-center focus:outline-none border-b border-transparent focus:border-gray-800 pb-1"
                              />
                            </div>
                          )}
                        </div>
                        
                        <select 
                          value={block.type} 
                          onChange={e => updateBlock(block.id, { type: e.target.value as any })}
                          className="absolute left-2 top-2 text-[10px] uppercase font-bold text-primary bg-gray-900 px-2 py-0.5 rounded border border-gray-700 focus:outline-none cursor-pointer hover:border-primary transition-colors z-10"
                        >
                          <option value="p">Paragraph (P)</option>
                          <option value="quote">Quote</option>
                          <option value="h2">Heading 2 (H2)</option>
                          <option value="h3">Heading 3 (H3)</option>
                          <option value="ul">Bullet List</option>
                          <option value="ol">Numbered List</option>
                          <option value="callout">Callout Box</option>
                          <option value="code">Code</option>
                          <option value="img">Image</option>
                          <option value="hr">Divider Line</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">SEO Title</label>
                    <input type="text" value={formData.seo_title} onChange={e => setFormData({...formData, seo_title: e.target.value})} placeholder="Fallback to post title" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">SEO Description</label>
                    <textarea value={formData.seo_description} onChange={e => setFormData({...formData, seo_description: e.target.value})} placeholder="Fallback to post sub title" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary h-24" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">SEO Keywords</label>
                    <input type="text" value={formData.seo_keywords} onChange={e => setFormData({...formData, seo_keywords: e.target.value})} placeholder="Comma separated keywords" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-800 bg-gray-900/50 mt-auto">
              <button type="submit" className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary-dark transition-all transform hover:scale-[1.01] shadow-lg shadow-primary/20">
                {isEditing ? 'Save Changes' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>

        <div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col max-h-[600px]">
            <div className="p-4 border-b border-gray-800 bg-gray-800/30">
              <h2 className="font-semibold text-white">All Posts</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="p-4 text-center text-gray-500 text-sm">No posts found.</p>
                ) : items.map((item) => (
                  <div key={item.id} className={`p-4 rounded-lg border transition-colors group cursor-pointer ${editId === item.id ? 'bg-gray-800 border-primary/50' : 'bg-gray-900 border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'}`} onClick={() => handleEdit(item)}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <span className={`px-2 py-0.5 rounded-full ${
                            item.status === 'published' ? 'bg-green-900/30 text-green-400' : 
                            item.status === 'draft' ? 'bg-gray-800 text-gray-300' : 
                            'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {item.status}
                          </span>
                          {item.featured && <span className="text-yellow-400">★ Featured</span>}
                          {item.category && <span>{categories.find(c => c.slug === item.category)?.name || item.category}</span>}
                        </div>
                      </div>
                    </div>
                    {editId === item.id && (
                      <div className="mt-4 flex gap-2 pt-3 border-t border-gray-800">
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10 rounded-md transition-colors w-full">
                          Delete Post
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
