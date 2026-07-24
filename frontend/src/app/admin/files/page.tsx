'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchApi } from '@/utils/api';

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  size_bytes: number;
  folder: string;
  created_at: string;
}

export default function FileManagerPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<string[]>(['/']);
  const [currentFolder, setCurrentFolder] = useState<string>('/');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderCreationTarget, setFolderCreationTarget] = useState<string>('/');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveAction, setMoveAction] = useState<'move' | 'copy'>('move');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [targetFolder, setTargetFolder] = useState<string>('/');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async (folder: string) => {
    setLoading(true);
    try {
      const res = await fetchApi(`/media?folder=${encodeURIComponent(folder)}`);
      setFiles(res.data || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await fetchApi('/media/folders');
      setFolders(res.data || ['/']);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchFiles(currentFolder);
  }, [currentFolder]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('folder', currentFolder);

    try {
      // Remove Content-Type so the browser sets it automatically with the boundary for FormData
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/media', {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to upload file');
      }

      fetchFiles(currentFolder);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      alert(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = () => {
    setNewFolderName('');
    setFolderCreationTarget('/');
    setShowNewFolderDialog(true);
  };

  const handleDoubleClickFolder = (e: React.MouseEvent, folder: string) => {
    e.stopPropagation();
    setCurrentFolder(folder);
    setNewFolderName('');
    setFolderCreationTarget(folder);
    setShowNewFolderDialog(true);
  };

  const handleConfirmCreateFolder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newFolderName.trim()) return;
    
    // Allow alphanumeric, underscores, hyphens, and slashes
    let sanitizedName = newFolderName.trim().replace(/[^a-zA-Z0-9_\-\/]/g, '');
    
    // Clean up extra slashes
    sanitizedName = sanitizedName.replace(/\/+/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
    
    if (!sanitizedName) return;

    const newPath = folderCreationTarget === '/' ? `/${sanitizedName}` : `${folderCreationTarget}/${sanitizedName}`;
    if (!folders.includes(newPath)) {
      setFolders([...folders, newPath].sort());
      setCurrentFolder(newPath);
      // Automatically expand the parent
      const next = new Set(expandedFolders);
      next.add(folderCreationTarget);
      setExpandedFolders(next);
    }
    setShowNewFolderDialog(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await fetchApi(`/media/${id}`, { method: 'DELETE' });
      fetchFiles(currentFolder);
    } catch (error) {
      alert('Failed to delete file');
    }
  };

  const openMoveDialog = (file: MediaFile) => {
    setSelectedFile(file);
    setMoveAction('move');
    setTargetFolder('/');
    setShowMoveDialog(true);
  };

  const openCopyDialog = (file: MediaFile) => {
    setSelectedFile(file);
    setMoveAction('copy');
    setTargetFolder('/');
    setShowMoveDialog(true);
  };

  const handleMoveCopy = async () => {
    if (!selectedFile) return;
    try {
      if (moveAction === 'move') {
        await fetchApi(`/media/${selectedFile.id}/move`, {
          method: 'PUT',
          body: JSON.stringify({ folder: targetFolder }),
        });
      } else {
        await fetchApi(`/media/${selectedFile.id}/copy`, {
          method: 'POST',
          body: JSON.stringify({ folder: targetFolder }),
        });
      }
      setShowMoveDialog(false);
      setSelectedFile(null);
      fetchFiles(currentFolder);
      fetchFolders();
    } catch (error) {
      alert(`Failed to ${moveAction} file`);
    }
  };

  const handleDeleteFolder = async (folder: string) => {
    if (folder === '/') return alert('Cannot delete root folder');
    if (!confirm(`Are you sure you want to delete folder "${folder}" and ALL its contents?`)) return;
    try {
      await fetchApi('/media/folders', { 
        method: 'DELETE',
        body: JSON.stringify({ folder })
      });
      setCurrentFolder('/');
      fetchFolders();
    } catch (error) {
      alert('Failed to delete folder');
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
    // Expand if it has children and isn't expanded, OR toggle if already selected
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

  // Build folder tree for sidebar
  const renderFolderTree = () => {
    return folders.filter(isVisible).map(f => {
      const depth = f === '/' ? 0 : f.split('/').length - 1;
      const name = f === '/' ? 'Root' : f.split('/').pop();
      const isExpanded = expandedFolders.has(f);
      const childrenExist = hasChildren(f);
      
      return (
        <div 
          key={f}
          onClick={() => handleFolderClick(f)}
          onDoubleClick={(e) => handleDoubleClickFolder(e, f)}
          className={`py-2 pr-3 cursor-pointer rounded flex justify-between group select-none ${currentFolder === f ? 'bg-primary text-white font-medium' : 'text-gray-400 hover:bg-gray-800'}`}
          style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
        >
          <div className="flex items-center space-x-1.5">
            {childrenExist ? (
              <button 
                onClick={(e) => toggleFolder(e, f)}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-700/50 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </button>
            ) : (
              <div className="w-5 h-5" /> // spacer
            )}
            <span className="text-lg">📁</span>
            <span className="truncate">{name}</span>
          </div>
          {f !== '/' && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f); }}
              className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-300 text-xs shrink-0 ml-2"
            >
              Delete
            </button>
          )}
        </div>
      );
    });
  };

  return (
    <div className="animate-fade-in flex h-[calc(100vh-6rem)] -m-8 border border-gray-700 bg-gray-900 overflow-hidden rounded-lg">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
          <h2 className="font-semibold text-white">Folders</h2>
          <button onClick={handleCreateFolder} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-gray-300 transition-colors">
            + New
          </button>
        </div>
        <div className="p-2 space-y-1 overflow-y-auto flex-1">
          {renderFolderTree()}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-900">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>{currentFolder === '/' ? 'Root' : currentFolder}</span>
          </h2>
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 text-sm rounded shadow transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-gray-500 flex justify-center py-12">Loading files...</div>
          ) : (() => {
            // Get direct child folders of currentFolder
            const childFolders = folders.filter(f => {
              if (f === currentFolder) return false;
              const prefix = currentFolder === '/' ? '/' : currentFolder + '/';
              if (!f.startsWith(prefix)) return false;
              // Only direct children (no further nesting)
              const remainder = f.substring(prefix.length);
              return !remainder.includes('/');
            });

            const hasContent = childFolders.length > 0 || files.length > 0;

            if (!hasContent) {
              return (
                <div className="text-center text-gray-500 py-12 border-2 border-dashed border-gray-700 rounded-xl m-4">
                  <p className="mb-2 text-2xl">📂</p>
                  <p>This folder is empty.</p>
                  <button onClick={() => fileInputRef.current?.click()} className="mt-4 text-primary hover:underline">Upload a file</button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {/* Child Folders */}
                {childFolders.map(f => {
                  const name = f.split('/').pop();
                  return (
                    <div
                      key={f}
                      onClick={() => {
                        setCurrentFolder(f);
                        const next = new Set(expandedFolders);
                        next.add(currentFolder);
                        next.add(f);
                        setExpandedFolders(next);
                      }}
                      onDoubleClick={(e) => handleDoubleClickFolder(e, f)}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-primary/50 hover:bg-gray-750 transition-all group"
                    >
                      <div className="flex flex-col items-center justify-center py-4">
                        <span className="text-5xl mb-3">📁</span>
                        <span className="text-sm text-gray-200 font-medium truncate w-full text-center">{name}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Files */}
                {files.map(file => (
                <div key={file.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 group relative hover:border-primary/50 transition-all">
                  <div className="aspect-square mb-3 bg-gray-900 rounded-md flex items-center justify-center overflow-hidden">
                    {file.mime_type.startsWith('image/') ? (
                      <img src={`http://localhost:5000${file.file_path}`} alt={file.file_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-4xl text-gray-600">
                        {file.file_name.endsWith('.pdf') ? '📄' : file.file_name.endsWith('.doc') || file.file_name.endsWith('.docx') ? '📝' : '📁'}
                      </div>
                    )}
                  </div>
                  <div className="truncate text-sm text-gray-200 font-medium" title={file.file_name}>
                    {file.file_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(file.size_bytes / 1024 / 1024).toFixed(2)} MB
                  </div>
                  
                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-1">
                    <button 
                      onClick={() => window.open(`http://localhost:5000${file.file_path}`, '_blank')}
                      className="bg-gray-900/80 text-white p-1.5 rounded-md hover:bg-primary transition-colors"
                      title="View/Download"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button 
                      onClick={() => openMoveDialog(file)}
                      className="bg-gray-900/80 text-blue-400 p-1.5 rounded-md hover:bg-blue-500 hover:text-white transition-colors"
                      title="Move to folder"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    </button>
                    <button 
                      onClick={() => openCopyDialog(file)}
                      className="bg-gray-900/80 text-green-400 p-1.5 rounded-md hover:bg-green-500 hover:text-white transition-colors"
                      title="Copy to folder"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(file.id)}
                      className="bg-gray-900/80 text-red-400 p-1.5 rounded-md hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-gray-950">
              <h3 className="text-lg font-semibold text-white">Create New Folder</h3>
            </div>
            <form onSubmit={handleConfirmCreateFolder} className="p-4">
              <label className="block text-sm text-gray-400 mb-2">Folder Name</label>
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. documents"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewFolderDialog(false)}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 text-sm rounded shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move/Copy Dialog */}
      {showMoveDialog && selectedFile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-gray-950">
              <h3 className="text-lg font-semibold text-white">
                {moveAction === 'move' ? 'Move' : 'Copy'} File
              </h3>
              <p className="text-sm text-gray-400 mt-1 truncate">{selectedFile.file_name}</p>
            </div>
            <div className="p-4">
              <label className="block text-sm text-gray-400 mb-3">Select destination folder</label>
              <div className="max-h-60 overflow-y-auto bg-gray-800 rounded-lg border border-gray-700 p-2 space-y-1">
                {folders.map(f => {
                  const depth = f === '/' ? 0 : f.split('/').length - 1;
                  const name = f === '/' ? 'Root' : f.split('/').pop();
                  const isCurrentFolder = f === currentFolder;
                  
                  return (
                    <div
                      key={f}
                      onClick={() => setTargetFolder(f)}
                      className={`py-2 pr-3 cursor-pointer rounded flex items-center space-x-1.5 text-sm transition-colors ${
                        targetFolder === f
                          ? 'bg-primary text-white font-medium'
                          : isCurrentFolder
                          ? 'text-gray-600 cursor-not-allowed'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                      style={{ paddingLeft: `${depth * 1.25 + 0.75}rem` }}
                    >
                      <span>📁</span>
                      <span className="truncate">{name}</span>
                      {isCurrentFolder && <span className="text-xs text-gray-500 ml-auto">(current)</span>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowMoveDialog(false); setSelectedFile(null); }}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMoveCopy}
                  disabled={targetFolder === currentFolder}
                  className={`px-4 py-2 text-sm rounded shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                    moveAction === 'move'
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : 'bg-green-600 hover:bg-green-500'
                  }`}
                >
                  {moveAction === 'move' ? 'Move Here' : 'Copy Here'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
