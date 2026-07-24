import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';

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
  onCancel: () => void;
}

export default function FilePicker({ onSelect, onCancel }: FilePickerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<string[]>(['/']);
  const [currentFolder, setCurrentFolder] = useState<string>('/');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchFiles(currentFolder);
  }, [currentFolder]);

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

  // Helper to determine if a folder has subfolders
  const hasChildren = (folderPath: string) => {
    const prefix = folderPath === '/' ? '/' : folderPath + '/';
    return folders.some(f => f !== folderPath && f.startsWith(prefix));
  };

  // Helper to determine if a folder should be visible in the tree
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
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950 rounded-t-xl">
          <h2 className="text-lg font-semibold text-white">Select a File</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden min-h-[400px]">
          {/* Sidebar */}
          <div className="w-48 sm:w-56 bg-gray-800/50 border-r border-gray-800 p-2 overflow-y-auto">
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
                    <div className="w-4 h-4" /> // spacer
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
              <div className="flex justify-center py-12 text-gray-500">Loading...</div>
            ) : files.length === 0 ? (
              <div className="text-center text-gray-500 py-12">No files in this folder.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {files.map(file => (
                  <div 
                    key={file.id} 
                    onClick={() => onSelect(`http://localhost:5000${file.file_path}`)}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-pointer hover:border-primary group transition-all"
                  >
                    <div className="aspect-square mb-2 bg-gray-900 rounded flex items-center justify-center overflow-hidden">
                      {file.mime_type.startsWith('image/') ? (
                        <img src={`http://localhost:5000${file.file_path}`} alt={file.file_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="text-3xl text-gray-600">
                          {file.file_name.endsWith('.pdf') ? '📄' : '📝'}
                        </div>
                      )}
                    </div>
                    <div className="truncate text-sm text-gray-200" title={file.file_name}>
                      {file.file_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950 rounded-b-xl flex justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-300 hover:text-white mr-2">Cancel</button>
        </div>
      </div>
    </div>
  );
}
