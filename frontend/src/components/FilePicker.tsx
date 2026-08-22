import React, { useState, useEffect, useRef } from 'react';
import { fetchApi } from '@/utils/api';
import { API_BASE_URL, getFileUrl } from '@/utils/urls';

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  size_bytes: number;
  folder: string;
}

interface FilePickerProps {
  onSelect: (url: string) => void;
  onCancel?: () => void;
  onClose?: () => void;
  accept?: 'image' | 'video' | 'all' | string;
}

export default function FilePicker({ onSelect, onCancel, onClose, accept = 'all' }: FilePickerProps) {
  const handleClose = onCancel || onClose || (() => {});
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<string[]>(['/']);
  const [currentFolder, setCurrentFolder] = useState<string>('/');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>(accept || 'all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchFiles(currentFolder);
  }, [currentFolder]);

  useEffect(() => {
    if (accept) {
      setActiveFilter(accept);
    }
  }, [accept]);

  const fetchFolders = async () => {
    try {
      const res = await fetchApi('/media/folders');
      setFolders(res.data || ['/']);
    } catch (error) {
      console.error('Failed to fetch folders', error);
    }
  };

  const fetchFiles = async (folder: string) => {
    setLoading(true);
    try {
      const res = await fetchApi(`/media?folder=${encodeURIComponent(folder)}`);
      setFiles(res.data || []);
    } catch (error) {
      console.error('Failed to fetch files', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);

    const fileToUpload = e.target.files[0];
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('folder', currentFolder);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/media`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to upload file');
      }

      const uploadResult = await res.json();
      const uploadedFilePath = uploadResult.data?.file_path;
      await fetchFiles(currentFolder);

      if (uploadedFilePath) {
        onSelect(getFileUrl(uploadedFilePath));
      }
    } catch (error: any) {
      alert(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isVideo = (file: MediaFile) => {
    return file.mime_type?.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(file.file_name);
  };

  const isImage = (file: MediaFile) => {
    return file.mime_type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.file_name);
  };

  const filteredFiles = files.filter(file => {
    if (activeFilter === 'video') return isVideo(file);
    if (activeFilter === 'image') return isImage(file);
    return true;
  });

  const hasChildren = (folderPath: string) => {
    const prefix = folderPath === '/' ? '/' : folderPath + '/';
    return folders.some(f => f !== folderPath && f.startsWith(prefix));
  };

  const isVisible = (folderPath: string) => {
    if (folderPath === '/') return true;
    if (!expandedFolders.has('/')) return false;
    
    const parts = folderPath.split('/').filter(Boolean);
    let current = '';
    for (let i = 0; i < parts.length - 1; i++) {
      current += '/' + parts[i];
      if (!expandedFolders.has(current)) return false;
    }
    return true;
  };

  const handleFolderClick = (f: string) => {
    setCurrentFolder(f);
    if (hasChildren(f)) {
      const next = new Set(expandedFolders);
      if (currentFolder === f) {
        if (next.has(f)) next.delete(f);
        else next.add(f);
      } else {
        next.add(f);
      }
      setExpandedFolders(next);
    }
  };

  const toggleFolder = (e: React.MouseEvent, f: string) => {
    e.stopPropagation();
    const next = new Set(expandedFolders);
    if (next.has(f)) next.delete(f);
    else next.add(f);
    setExpandedFolders(next);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Hidden File Input for Direct Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept={activeFilter === 'video' ? 'video/*' : activeFilter === 'image' ? 'image/*' : '*'}
        />

        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-white">Select a File</h2>
            <div className="flex bg-gray-800 p-0.5 rounded-lg border border-gray-700">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${activeFilter === 'all' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('image')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${activeFilter === 'image' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                🖼️ Images
              </button>
              <button
                onClick={() => setActiveFilter('video')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${activeFilter === 'video' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                🎬 Videos
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow"
            >
              {uploading ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>Upload New File</span>
                </>
              )}
            </button>
            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden min-h-[400px]">
          {/* Sidebar */}
          <div className="w-48 sm:w-56 bg-gray-800/50 border-r border-gray-800 p-2 overflow-y-auto shrink-0">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2 mt-2">Folders</div>
            {folders.filter(isVisible).map(f => {
              const depth = f === '/' ? 0 : f.split('/').length - 1;
              const name = f === '/' ? 'Root' : f.split('/').pop();
              const isExpanded = expandedFolders.has(f);
              const childrenExist = hasChildren(f);
              
              return (
                <div 
                  key={f}
                  onClick={() => handleFolderClick(f)}
                  className={`py-2 pr-3 text-sm cursor-pointer rounded flex items-center space-x-1.5 ${currentFolder === f ? 'bg-primary text-white font-medium' : 'text-gray-300 hover:bg-gray-700'}`}
                  style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
                >
                  {childrenExist ? (
                    <button 
                      onClick={(e) => toggleFolder(e, f)}
                      className="w-4 h-4 flex items-center justify-center rounded hover:bg-gray-600 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                  <span>📁</span>
                  <span className="truncate">{name}</span>
                </div>
              );
            })}
          </div>

          {/* Files Grid */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
            {loading ? (
              <div className="flex justify-center py-12 text-gray-500">Loading files...</div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-3">No {activeFilter !== 'all' ? activeFilter + ' ' : ''}files in this folder.</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-primary/20 text-primary border border-primary/40 rounded-lg text-sm font-semibold hover:bg-primary/30 transition-colors"
                >
                  📤 Upload a file here
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredFiles.map(file => {
                  const fileIsVid = isVideo(file);
                  const fileIsImg = isImage(file);
                  const fileUrl = getFileUrl(file.file_path);

                  return (
                    <div 
                      key={file.id} 
                      onClick={() => onSelect(fileUrl)}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-pointer hover:border-primary group transition-all relative flex flex-col justify-between"
                    >
                      <div className="aspect-square mb-2 bg-gray-950 rounded flex items-center justify-center overflow-hidden relative">
                        {fileIsImg ? (
                          <img src={fileUrl} alt={file.file_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : fileIsVid ? (
                          <div className="w-full h-full relative flex items-center justify-center bg-black">
                            <video src={fileUrl} className="w-full h-full object-cover opacity-80" muted preload="metadata" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                              <span className="text-2xl drop-shadow">🎬</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-3xl text-gray-600">
                            {file.file_name.endsWith('.pdf') ? '📄' : '📝'}
                          </div>
                        )}
                      </div>
                      <div className="truncate text-xs font-medium text-gray-200" title={file.file_name}>
                        {file.file_name}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 bg-gray-950 flex justify-between items-center">
          <span className="text-xs text-gray-500">Folder: <span className="text-gray-300 font-mono">{currentFolder}</span></span>
          <button onClick={handleClose} className="px-4 py-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
