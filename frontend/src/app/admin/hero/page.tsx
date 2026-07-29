'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { API_BASE_URL, getFileUrl } from '@/utils/urls';
import FilePicker from '@/components/FilePicker';

const emptyForm = {
  internal_name: 'Homepage Hero',
  is_active: true,
  status: 'published',

  greeting: '',
  title_prefix: '',
  headline: '',
  professional_title: '',
  subheadline: '',
  highlighted_text: '',

  image_url: '',
  photo_alt_text: '',
  photo_position: 'right',
  photo_shape: 'circle',
  photo_display_style: 'normal',
  content_bg_type: 'none',

  cta_buttons: [],

  show_social_links: true,

  show_availability: false,
  availability_text: '',
  availability_type: 'available',
  availability_link: '',

  bg_type: 'image',
  bg_color: '',
  bg_gradient: '',
  bg_image_url: '',
  bg_video_url: '',
  bg_overlay_color: '',
  bg_overlay_opacity: 0.5,

  layout_template: 'split',

  full_height: true,
  content_alignment: 'start',
  text_alignment: 'left',
  animation_type: 'slide-up',
  animation_speed: 'normal',
  show_scroll_indicator: true,

  mobile_layout: {},

  seo_title: '',
  seo_description: '',
  heading_level: 'h1',
  accessibility_label: '',
};

export default function AdminHero() {
  const refreshKey = useRealtimeRefresh('hero', false);
  const [formData, setFormData] = useState<any>({ ...emptyForm });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeTab, setActiveTab] = useState('general');
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [discoveredBackgrounds, setDiscoveredBackgrounds] = useState<any[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [filePickerTargetIndex, setFilePickerTargetIndex] = useState<number | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const loadData = () => {
    fetchApi('/hero').then(res => {
      const hero = res.data.length > 0 ? res.data[0] : null;
      if (hero) {
        setFormData({ ...emptyForm, ...hero });
        setIsEditing(true);
        setEditId(hero.id);
      } else {
        setIsEditing(false);
        setEditId('');
      }
    }).catch(console.error);

    fetchApi('/media').then(res => {
      if (res.success) {
        // Filter only images for backgrounds
        setMediaFiles(res.data.filter((m: any) => m.mime_type?.startsWith('image/')));
      }
    }).catch(console.error);
  };

  const refreshBackgrounds = async () => {
    setIsDiscovering(true);
    try {
      const res = await fetchApi('/media/discover');
      if (res.success) {
        setDiscoveredBackgrounds(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDiscovering(false);
    }
  };

  useEffect(() => {
    loadData();
    refreshBackgrounds();
  }, [refreshKey]);

  const autoSave = useCallback(async (data: any) => {
    setSaveStatus('saving');
    try {
      if (isEditing && editId) {
        await fetchApi(`/hero/${editId}`, { method: 'PUT', body: JSON.stringify(data) });
      } else {
        const res = await fetchApi('/hero', { method: 'POST', body: JSON.stringify({ ...data, is_active: true, status: 'published' }) });
        if (res.data?.id) {
          setEditId(res.data.id);
          setIsEditing(true);
        }
      }
      setSaveStatus('saved');
    } catch {
      setSaveStatus('idle');
    }
  }, [isEditing, editId]);

  const handleFieldChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setSaveStatus('idle');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => autoSave(updated), 800);
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'content', label: 'Content' },
    { id: 'image', label: 'Image' },
    { id: 'cta', label: 'CTA Buttons' },
    { id: 'layout', label: 'Layout & Display' },
    { id: 'background', label: 'Background' },
    { id: 'availability', label: 'Availability' },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 whitespace-nowrap">Hero Section Settings</h1>

      <div className="bg-gray-800 rounded-lg mb-12 border border-gray-700 overflow-hidden shadow-xl">
        {/* Editor Header */}
        <div className="p-4 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Homepage Hero Configuration
          </h2>
          <div className="flex items-center gap-4">
            {saveStatus === 'saving' && <span className="text-sm text-yellow-400 animate-pulse">Saving changes...</span>}
            {saveStatus === 'saved' && <span className="text-sm text-green-400">✓ All changes saved live</span>}
          </div>
        </div>

        <div className="flex flex-col min-h-[500px]">
          {/* Tabs Navigation Bar */}
          <div className="w-full bg-gray-800 border-b border-gray-700 p-2 flex overflow-x-auto gap-2 scrollbar-thin scrollbar-thumb-gray-600">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 text-white">General Information</h3>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Internal Name</label>
                  <input type="text" value={formData.internal_name} onChange={e => handleFieldChange('internal_name', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" placeholder="e.g. Main Homepage Hero" />
                  <p className="text-xs text-gray-500 mt-1">For your eyes only, to help identify this hero.</p>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 text-white">Hero Content</h3>
                <p className="text-xs text-gray-500 -mt-2">Keep it brief — this is just a quick introduction. Save the details for your About section.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Greeting Option</label>
                    <select
                      value={['Hello', 'Hi', 'Hey', 'Greetings', 'Welcome'].includes(formData.greeting) ? formData.greeting : (formData.greeting ? 'Custom' : 'Hello')}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'Custom') {
                          handleFieldChange('greeting', '');
                        } else {
                          handleFieldChange('greeting', val);
                        }
                      }}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary text-sm"
                    >
                      <option value="Hello">Hello</option>
                      <option value="Hi">Hi</option>
                      <option value="Hey">Hey</option>
                      <option value="Greetings">Greetings</option>
                      <option value="Welcome">Welcome</option>
                      <option value="Custom">Custom (Other)...</option>
                    </select>
                  </div>

                  {!['Hello', 'Hi', 'Hey', 'Greetings', 'Welcome'].includes(formData.greeting) && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm text-gray-400">Custom Greeting</label>
                        <span className={`text-xs ${(formData.greeting || '').length > 15 ? 'text-red-400' : 'text-gray-500'}`}>{(formData.greeting || '').length}/15</span>
                      </div>
                      <input
                        type="text"
                        maxLength={15}
                        value={formData.greeting || ''}
                        onChange={e => handleFieldChange('greeting', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary text-sm"
                        placeholder="e.g. Yo, Welcome"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Connector (Fixed)</label>
                    <input
                      type="text"
                      disabled
                      value="I am"
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-gray-400 cursor-not-allowed text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm text-gray-400">Title Prefix (e.g. Eng., Dr.)</label>
                      <span className={`text-xs ${(formData.title_prefix || '').length > 10 ? 'text-red-400' : 'text-gray-500'}`}>{(formData.title_prefix || '').length}/10</span>
                    </div>
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.title_prefix || ''}
                      onChange={e => handleFieldChange('title_prefix', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary text-sm"
                      placeholder="e.g. Eng. or Dr."
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm text-gray-400">Name / Main Heading *</label>
                    <span className={`text-xs ${(formData.headline || '').length > 40 ? 'text-red-400' : 'text-gray-500'}`}>{(formData.headline || '').length}/40</span>
                  </div>
                  <input type="text" maxLength={40} value={formData.headline || ''} onChange={e => handleFieldChange('headline', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" placeholder="e.g. Dunstun Wambutsi" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Professional Titles (max 3, separated by |)</label>
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map(i => {
                      const titles = (formData.professional_title || '').split('|').map((t: string) => t.trim());
                      return (
                        <div key={i} className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            maxLength={25}
                            value={titles[i] || ''}
                            onChange={e => {
                              const newTitles = [...titles];
                              newTitles[i] = e.target.value;
                              const joined = newTitles.filter(t => t).join(' | ');
                              handleFieldChange('professional_title', joined);
                            }}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:outline-none focus:border-primary"
                            placeholder={i === 0 ? 'e.g. Engineer' : i === 1 ? 'e.g. Developer' : 'e.g. Designer'}
                          />
                          {i < 2 && <span className="text-gray-500 font-bold">|</span>}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Each title max 25 characters</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm text-gray-400">Short Introduction</label>
                    <span className={`text-xs ${(formData.subheadline || '').length > 200 ? 'text-red-400' : 'text-gray-500'}`}>{(formData.subheadline || '').length}/200</span>
                  </div>
                  <textarea rows={2} maxLength={200} value={formData.subheadline || ''} onChange={e => handleFieldChange('subheadline', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" placeholder="I combine engineering, technology, and creativity to build practical solutions..."></textarea>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm text-gray-400">Highlighted Text (Optional)</label>
                    <span className={`text-xs ${(formData.highlighted_text || '').length > 70 ? 'text-red-400' : 'text-gray-500'}`}>{(formData.highlighted_text || '').length}/70</span>
                  </div>
                  <input type="text" maxLength={70} value={formData.highlighted_text || ''} onChange={e => handleFieldChange('highlighted_text', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" placeholder="e.g. Building technology that makes a difference" />
                </div>
              </div>
            )}

            {activeTab === 'image' && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 text-white">Profile Image</h3>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    {formData.image_url && (
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-600 flex-shrink-0">
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          if (!e.target.files || e.target.files.length === 0) return;
                          try {
                            const token = localStorage.getItem('token');
                            let lastUrl = '';

                            // Upload all selected files concurrently
                            const uploadPromises = Array.from(e.target.files).map(async (file) => {
                              const fd = new FormData();
                              fd.append('file', file);
                              const res = await fetch(`${API_BASE_URL}/media`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` },
                                body: fd
                              });
                              const data = await res.json();
                              if (data.success) {
                                return getFileUrl(data.data.file_path);
                              } else {
                                alert(data.message || 'Upload failed');
                              }
                              return null;
                            });

                            const results = await Promise.all(uploadPromises);

                            // Set the image url to the last successfully uploaded image
                            const successfulUrls = results.filter(url => url !== null);
                            if (successfulUrls.length > 0) {
                              handleFieldChange('image_url', successfulUrls[successfulUrls.length - 1]);
                            }
                          } catch (err) {
                            console.error('Upload failed', err);
                          }
                        }}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-white focus:outline-none focus:border-primary text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">Upload a high-quality image (JPG, PNG). Max 10MB.</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-400">Position</label>
                    <select value={formData.photo_position || 'right'} onChange={e => handleFieldChange('photo_position', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary">
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-400">Shape</label>
                    <select value={formData.photo_shape || 'circle'} onChange={e => handleFieldChange('photo_shape', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary">
                      <option value="circle">Circle</option>
                      <option value="rounded">Rounded Rectangle</option>
                      <option value="squircle">Squircle</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Display Style</label>
                  <select value={formData.photo_display_style || 'normal'} onChange={e => handleFieldChange('photo_display_style', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary">
                    <optgroup label="Basic">
                      <option value="normal">Normal (Square/Circle crop)</option>
                      <option value="portrait">Portrait (Full body, tall image)</option>
                      <option value="cutout">Cutout (No background, transparent)</option>
                    </optgroup>
                    <optgroup label="Framed">
                      <option value="circular-frame">Circular Frame (Glow ring)</option>
                      <option value="bordered-frame">Bordered Frame (Offset border)</option>
                      <option value="glass-card">Glassmorphism Card</option>
                    </optgroup>
                    <optgroup label="Fun">
                      <option value="polaroid">Polaroid Style</option>
                      <option value="floating-card">Floating Card (Float animation)</option>
                      <option value="hexagon">Hexagon Shape</option>
                    </optgroup>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.photo_display_style === 'portrait' && '📐 Shows a tall portrait — great for full body or half-body photos.'}
                    {formData.photo_display_style === 'hexagon' && '⬡ Clips the image into a hexagon shape with a glow accent.'}
                    {formData.photo_display_style === 'glass-card' && '🪟 Wraps image in a frosted glass card — works great on image/gradient backgrounds.'}
                    {formData.photo_display_style === 'bordered-frame' && '🖼️ Decorative offset border using your primary color.'}
                    {formData.photo_display_style === 'floating-card' && '🌊 Gently bobs up and down on the screen.'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-400">Content Background</label>
                  <p className="text-xs text-gray-500 mb-3">Adds a background behind the text content — useful when using a photo or image background type.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'none', label: 'None', desc: 'No background' },
                      { value: 'glass', label: 'Glass Card', desc: 'Frosted glass effect' },
                      { value: 'dark', label: 'Dark Card', desc: 'Semi-transparent dark' },
                      { value: 'gradient-left', label: 'Gradient Fade', desc: 'Dark to transparent' },
                    ].map(opt => (
                      <div
                        key={opt.value}
                        onClick={() => handleFieldChange('content_bg_type', opt.value)}
                        className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${formData.content_bg_type === opt.value
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                          }`}
                      >
                        <div className="font-medium text-sm text-white">{opt.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Alt Text (Accessibility & SEO)</label>
                  <input type="text" value={formData.photo_alt_text || ''} onChange={e => handleFieldChange('photo_alt_text', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" placeholder="Professional portrait of Dunstun Wambutsi" />
                </div>
              </div>
            )}

            {activeTab === 'cta' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Call to Action Buttons</h3>
                  <button
                    onClick={() => {
                      if ((formData.cta_buttons || []).length >= 3) return;
                      const newButtons = [...(formData.cta_buttons || []), { label: 'New Button', style: 'primary', link_type: 'internal', target: '', is_hidden: true }];
                      handleFieldChange('cta_buttons', newButtons);
                    }}
                    disabled={(formData.cta_buttons || []).length >= 3}
                    className="px-3 py-1 bg-gray-700 text-sm text-white rounded hover:bg-gray-600 transition"
                  >
                    + Add Button
                  </button>
                </div>

                {!formData.cta_buttons || formData.cta_buttons.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-gray-700 rounded-lg text-center text-gray-500">
                    No CTA buttons configured. Click "+ Add Button" to create one.
                  </div>
                ) : (
                  formData.cta_buttons.map((btn: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-900 border border-gray-700 rounded-lg relative">
                      <div className="absolute top-4 right-4 flex items-center space-x-6">
                        <label className="flex items-center space-x-2 text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                          <input
                            type="checkbox"
                            checked={btn.is_hidden || false}
                            onChange={(e) => {
                              const newButtons = [...formData.cta_buttons];
                              newButtons[index].is_hidden = e.target.checked;
                              handleFieldChange('cta_buttons', newButtons);
                            }}
                            className="rounded border-gray-700 text-primary bg-gray-800 focus:ring-primary focus:ring-offset-gray-900 cursor-pointer"
                          />
                          <span>Hide</span>
                        </label>
                        <button
                          onClick={() => {
                            const newButtons = [...formData.cta_buttons];
                            newButtons.splice(index, 1);
                            handleFieldChange('cta_buttons', newButtons);
                          }}
                          className="text-red-500 hover:text-red-400 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mr-32">
                        <div>
                          <label className="block text-xs mb-1 text-gray-400">Label</label>
                          <input type="text" value={btn.label || ''} onChange={e => {
                            const newButtons = [...formData.cta_buttons];
                            newButtons[index].label = e.target.value;
                            handleFieldChange('cta_buttons', newButtons);
                          }} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-primary" placeholder="View My Work" />
                        </div>
                        <div>
                          <label className="block text-xs mb-1 text-gray-400">Style</label>
                          <select value={btn.style || 'primary'} onChange={e => {
                            const newButtons = [...formData.cta_buttons];
                            newButtons[index].style = e.target.value;
                            handleFieldChange('cta_buttons', newButtons);
                          }} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-primary">
                            <option value="primary">Primary (Solid)</option>
                            <option value="secondary">Secondary</option>
                            <option value="outline">Outline</option>
                            <option value="ghost">Ghost (Text only)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs mb-1 text-gray-400">Link Type</label>
                          <select value={btn.link_type || 'internal'} onChange={e => {
                            const newButtons = [...formData.cta_buttons];
                            newButtons[index].link_type = e.target.value;
                            handleFieldChange('cta_buttons', newButtons);
                          }} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-primary">
                            <option value="internal">Homepage Section (e.g. #projects)</option>
                            <option value="external">External URL</option>
                            <option value="file">File Download</option>
                            <option value="view">View File (in new tab)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs mb-1 text-gray-400">
                            {(btn.link_type === 'file' || btn.link_type === 'view') ? 'Selected File' : 'Target URL / ID'}
                          </label>
                          {(btn.link_type === 'file' || btn.link_type === 'view') ? (
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={btn.target || ''}
                                readOnly
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-primary opacity-70"
                                placeholder="Select a file..."
                              />
                              <button
                                onClick={() => {
                                  setFilePickerTargetIndex(index);
                                  setShowFilePicker(true);
                                }}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
                              >
                                Browse
                              </button>
                            </div>
                          ) : (
                            <input type="text" value={btn.target || ''} onChange={e => {
                              const newButtons = [...formData.cta_buttons];
                              newButtons[index].target = e.target.value;
                              handleFieldChange('cta_buttons', newButtons);
                            }} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white text-sm focus:border-primary" placeholder="#projects" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 text-white">Layout & Display Settings</h3>

                <div>
                  <label className="block text-sm mb-3 text-gray-400">Layout Template</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['split', 'centered', 'photo-background'].map(layout => (
                      <div
                        key={layout}
                        onClick={() => handleFieldChange('layout_template', layout)}
                        className={`cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${formData.layout_template === layout ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-900 hover:border-gray-500'}`}
                      >
                        <div className="h-24 mb-2 flex flex-col items-center justify-center opacity-70">
                          {layout === 'split' && <div className="flex w-full gap-2 px-2"><div className="w-2/3 space-y-1"><div className="h-2 bg-gray-400 rounded w-1/2"></div><div className="h-4 bg-gray-200 rounded w-full"></div><div className="h-2 bg-gray-400 rounded w-3/4"></div></div><div className="w-1/3 aspect-square bg-gray-500 rounded-full"></div></div>}
                          {layout === 'centered' && <div className="flex flex-col items-center w-full gap-2"><div className="w-8 aspect-square bg-gray-500 rounded-full"></div><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-2 bg-gray-400 rounded w-1/2"></div></div>}
                          {layout === 'photo-background' && <div className="relative w-full h-full bg-gray-700 rounded overflow-hidden flex flex-col items-center justify-center"><div className="h-4 bg-white rounded w-3/4 mb-1 z-10"></div><div className="h-2 bg-gray-300 rounded w-1/2 z-10"></div></div>}
                        </div>
                        <span className="text-sm font-medium text-white capitalize">{layout.replace('-', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-900 border border-gray-700 rounded-lg">
                    <span className="text-sm text-gray-300">Show Scroll Indicator</span>
                    <input type="checkbox" checked={formData.show_scroll_indicator || false} onChange={e => handleFieldChange('show_scroll_indicator', e.target.checked)} className="w-4 h-4 accent-primary" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-900 border border-gray-700 rounded-lg">
                    <span className="text-sm text-gray-300">Show Social Links</span>
                    <input type="checkbox" checked={formData.show_social_links || false} onChange={e => handleFieldChange('show_social_links', e.target.checked)} className="w-4 h-4 accent-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-400">Animation Type</label>
                    <select value={formData.animation_type || 'slide-up'} onChange={e => handleFieldChange('animation_type', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary">
                      <option value="none">None</option>
                      <option value="fade">Fade In</option>
                      <option value="slide-up">Slide Up</option>
                      <option value="slide-in">Slide In (Side)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-400">Text Alignment</label>
                    <select value={formData.text_alignment || 'left'} onChange={e => handleFieldChange('text_alignment', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary">
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'background' && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 text-white">Background Settings</h3>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Background Type</label>
                  <select value={formData.bg_type || 'image'} onChange={e => handleFieldChange('bg_type', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary">
                    <option value="image">Image</option>
                    <option value="solid">Solid Color</option>
                  </select>
                </div>

                {formData.bg_type === 'solid' && (
                  <div>
                    <label className="block text-sm mb-1 text-gray-400">Background Color</label>
                    <input type="text" value={formData.bg_color || ''} onChange={e => handleFieldChange('bg_color', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" placeholder="#111827 or rgba(17,24,39,1)" />
                  </div>
                )}

                {formData.bg_type === 'image' && (
                  <div className="space-y-5 border p-4 border-gray-700 rounded-lg bg-gray-900">

                    {/* Discover Backgrounds Gallery */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm text-gray-400 font-medium">Discover Backgrounds</label>
                        <button
                          onClick={refreshBackgrounds}
                          disabled={isDiscovering}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 transition-colors disabled:opacity-50"
                        >
                          {isDiscovering ? 'Refreshing...' : 'Refresh'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">Click an image to download and set it as your background.</p>

                      {isDiscovering && discoveredBackgrounds.length === 0 ? (
                        <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg">
                          <span className="text-sm text-gray-500">Fetching images...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-5 gap-2">
                          {discoveredBackgrounds.map(img => {
                            const isDownloading = downloadingId === img.id;
                            return (
                              <div
                                key={img.id}
                                onClick={async () => {
                                  if (isDownloading) return;
                                  setDownloadingId(img.id);
                                  try {
                                    const token = localStorage.getItem('token');
                                    const res = await fetchApi('/media/download', {
                                      method: 'POST',
                                      body: JSON.stringify({ url: img.url })
                                    });
                                    if (res.success) {
                                      const fullUrl = getFileUrl(res.data.file_path);
                                      handleFieldChange('bg_image_url', fullUrl);
                                      // Refresh media list to show the newly downloaded image in the uploads gallery
                                      fetchApi('/media').then(mediaRes => {
                                        if (mediaRes.success) setMediaFiles(mediaRes.data.filter((m: any) => m.mime_type?.startsWith('image/')));
                                      });
                                    }
                                  } catch (err) {
                                    console.error('Download failed', err);
                                  } finally {
                                    setDownloadingId(null);
                                  }
                                }}
                                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all group ${isDownloading ? 'border-primary opacity-75' : 'border-gray-700 hover:border-gray-400'}`}
                              >
                                <img src={img.thumbnail} alt={img.author} className="w-full h-16 object-cover" />
                                {isDownloading && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                )}
                                {!isDownloading && (
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-white drop-shadow">Use</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Uploaded Custom Backgrounds */}
                    {mediaFiles.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <label className="block text-sm mb-2 text-gray-400 font-medium">Your Uploaded Backgrounds</label>
                        <p className="text-xs text-gray-500 mb-3">Images you have previously uploaded.</p>
                        <div className="grid grid-cols-4 gap-3">
                          {mediaFiles.map((img: any) => {
                            const fullUrl = getFileUrl(img.file_path);
                            const isSelected = formData.bg_image_url === fullUrl;
                            return (
                              <div
                                key={img.id}
                                onClick={() => handleFieldChange('bg_image_url', fullUrl)}
                                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all group ${isSelected ? 'border-primary shadow-[0_0_12px_rgba(59,130,246,0.4)]' : 'border-gray-700 hover:border-gray-400'}`}
                              >
                                <img src={fullUrl} alt={img.file_name} className="w-full h-16 object-cover" />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Upload New Background */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <label className="block text-sm mb-2 text-gray-400 font-medium">Upload New Background</label>
                      <div className="flex items-center gap-3">
                        {formData.bg_image_url && !formData.bg_image_url.startsWith('/system-images') && !mediaFiles.some(m => getFileUrl(m.file_path) === formData.bg_image_url) && (
                          <div className="w-16 h-10 rounded overflow-hidden border border-gray-600 flex-shrink-0">
                            <img src={formData.bg_image_url} alt="Current BG" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={async (e) => {
                            if (!e.target.files || e.target.files.length === 0) return;
                            try {
                              const token = localStorage.getItem('token');

                              const uploadPromises = Array.from(e.target.files).map(async (file) => {
                                const fd = new FormData();
                                fd.append('file', file);
                                const res = await fetch(`${API_BASE_URL}/media`, {
                                  method: 'POST',
                                  headers: { 'Authorization': `Bearer ${token}` },
                                  body: fd
                                });
                                const data = await res.json();
                                if (data.success) {
                                  return getFileUrl(data.data.file_path);
                                } else {
                                  alert(data.message || 'Upload failed');
                                }
                                return null;
                              });

                              const results = await Promise.all(uploadPromises);
                              const successfulUrls = results.filter(url => url !== null);

                              if (successfulUrls.length > 0) {
                                // Refresh media list so all new uploads appear in the gallery above
                                fetchApi('/media').then(mediaRes => {
                                  if (mediaRes.success) setMediaFiles(mediaRes.data.filter((m: any) => m.mime_type?.startsWith('image/')));
                                });
                              }
                            } catch (err) {
                              console.error('Upload failed', err);
                            }
                          }}
                          className="flex-1 bg-gray-800 border border-gray-700 rounded p-1.5 text-white text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-600"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Best size: 1920×1080px or larger. JPG or PNG.</p>
                    </div>

                    {/* Overlay Controls */}
                    <div className="pt-2 border-t border-gray-700">
                      <div>
                        <label className="block text-sm mb-1 text-gray-400">Overlay Opacity</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0" max="1" step="0.05"
                            value={formData.bg_overlay_opacity !== undefined ? formData.bg_overlay_opacity : 0.5}
                            onChange={e => handleFieldChange('bg_overlay_opacity', parseFloat(e.target.value))}
                            className="flex-1 accent-primary"
                          />
                          <span className="text-white text-sm w-8 text-right">{((formData.bg_overlay_opacity ?? 0.5) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Preview */}
                    {formData.bg_image_url && (
                      <div className="relative rounded-lg overflow-hidden h-24 border border-gray-700">
                        <img src={formData.bg_image_url} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0" style={{ backgroundColor: formData.bg_overlay_color || '#000', opacity: formData.bg_overlay_opacity ?? 0.5 }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold opacity-70">Background Preview</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {activeTab === 'availability' && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 text-white">Availability Status</h3>

                <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-white">Enable Availability Badge</h4>
                    <p className="text-sm text-gray-400">Show visitors your current work status.</p>
                  </div>
                  <button onClick={() => handleFieldChange('show_availability', !formData.show_availability)} className={`w-12 h-6 rounded-full relative transition-colors ${formData.show_availability ? 'bg-primary' : 'bg-gray-600'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.show_availability ? 'translate-x-6' : ''}`} />
                  </button>
                </div>

                {formData.show_availability && (
                  <div className="space-y-4 p-4 border border-gray-700 rounded-lg bg-gray-900">
                    <div>
                      <label className="block text-sm mb-1 text-gray-400">Status Type (Controls Icon Color)</label>
                      <select value={formData.availability_type || 'available'} onChange={e => handleFieldChange('availability_type', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary">
                        <option value="available">Available (Green)</option>
                        <option value="busy">Busy (Yellow)</option>
                        <option value="away">Away (Red)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-400">Status Text</label>
                      <input type="text" value={formData.availability_text || ''} onChange={e => handleFieldChange('availability_text', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" placeholder="e.g. Open to freelance projects" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-400">Status Link URL (Optional)</label>
                      <input type="text" value={formData.availability_link || ''} onChange={e => handleFieldChange('availability_link', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" placeholder="e.g. /contact or https://linkedin.com/..." />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="text-lg font-semibold mb-4 text-white">SEO & Accessibility</h3>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Main Heading Level</label>
                  <select value={formData.heading_level || 'h1'} onChange={e => handleFieldChange('heading_level', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary">
                    <option value="h1">H1 (Recommended for Homepage)</option>
                    <option value="h2">H2</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">There should only be one H1 per page for SEO.</p>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Accessibility Label (aria-label for Hero section)</label>
                  <input type="text" value={formData.accessibility_label || ''} onChange={e => handleFieldChange('accessibility_label', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" placeholder="Introduction and primary navigation" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Picker Modal */}
      {showFilePicker && (
        <FilePicker
          onSelect={(url) => {
            if (filePickerTargetIndex !== null) {
              const newButtons = [...formData.cta_buttons];
              newButtons[filePickerTargetIndex].target = url;
              handleFieldChange('cta_buttons', newButtons);
            }
            setShowFilePicker(false);
            setFilePickerTargetIndex(null);
          }}
          onCancel={() => {
            setShowFilePicker(false);
            setFilePickerTargetIndex(null);
          }}
        />
      )}
    </div>
  );
}
