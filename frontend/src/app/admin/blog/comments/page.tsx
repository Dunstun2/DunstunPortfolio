'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';

export default function AdminBlogComments() {
  const refreshKey = useRealtimeRefresh('blogComments');
  const [comments, setComments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [filter, setFilter] = useState<string>('pending');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const loadData = () => {
    fetchApi(`/blog-comments?status=${filter}`).then(res => setComments(res.data)).catch(console.error);
    fetchApi('/blog-comments/stats').then(res => setStats(res.data)).catch(console.error);
  };

  useEffect(() => { loadData(); }, [refreshKey, filter]);

  const changeStatus = async (id: string, newStatus: string) => {
    try {
      await fetchApi(`/blog-comments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const submitReply = async (comment: any) => {
    if (!replyContent.trim()) return;
    try {
      await fetchApi('/blog-comments/reply', {
        method: 'POST',
        body: JSON.stringify({
          post_id: comment.post_id,
          parent_id: comment.id,
          content: replyContent
        })
      });
      setReplyingTo(null);
      setReplyContent('');
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await fetchApi(`/blog-comments/${id}`, { method: 'DELETE' });
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Comment Moderation</h1>
          <p className="text-gray-400 text-sm">Review, approve, and reply to comments on your blog.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div onClick={() => setFilter('pending')} className={`p-4 rounded-xl cursor-pointer border transition-colors ${filter === 'pending' ? 'bg-primary/20 border-primary' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
          <div className="text-gray-400 text-sm mb-1">Pending</div>
          <div className="text-2xl font-bold text-white">{stats.pending || 0}</div>
        </div>
        <div onClick={() => setFilter('approved')} className={`p-4 rounded-xl cursor-pointer border transition-colors ${filter === 'approved' ? 'bg-green-500/20 border-green-500' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
          <div className="text-gray-400 text-sm mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-500">{stats.approved || 0}</div>
        </div>
        <div onClick={() => setFilter('rejected')} className={`p-4 rounded-xl cursor-pointer border transition-colors ${filter === 'rejected' ? 'bg-gray-700 border-gray-500' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
          <div className="text-gray-400 text-sm mb-1">Rejected</div>
          <div className="text-2xl font-bold text-gray-400">{stats.rejected || 0}</div>
        </div>
        <div onClick={() => setFilter('spam')} className={`p-4 rounded-xl cursor-pointer border transition-colors ${filter === 'spam' ? 'bg-red-500/20 border-red-500' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
          <div className="text-gray-400 text-sm mb-1">Spam</div>
          <div className="text-2xl font-bold text-red-500">{stats.spam || 0}</div>
        </div>
        <div onClick={() => setFilter('')} className={`p-4 rounded-xl cursor-pointer border transition-colors ${filter === '' ? 'bg-white/10 border-gray-400' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}>
          <div className="text-gray-400 text-sm mb-1">All</div>
          <div className="text-2xl font-bold text-white">{stats.total || 0}</div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {comments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No {filter} comments found.
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {comments.map(comment => (
              <div key={comment.id} className="p-6 transition-colors hover:bg-gray-800/30">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{comment.author_name}</span>
                          {comment.is_author_reply && <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded border border-primary/30">Author</span>}
                          <span className="text-gray-500 text-sm">&lt;{comment.author_email}&gt;</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          on <span className="text-gray-300 font-medium">"{comment.post?.title || 'Unknown Post'}"</span> • {new Date(comment.created_at).toLocaleString()}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        comment.status === 'pending' ? 'bg-yellow-900/50 text-yellow-500' :
                        comment.status === 'approved' ? 'bg-green-900/50 text-green-500' :
                        comment.status === 'spam' ? 'bg-red-900/50 text-red-500' :
                        'bg-gray-800 text-gray-400'
                      }`}>
                        {comment.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-gray-950 p-4 rounded-lg text-gray-300 whitespace-pre-wrap text-sm border border-gray-800/50">
                      {comment.content}
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-center lg:items-end justify-start gap-2 min-w-[120px]">
                    {comment.status !== 'approved' && (
                      <button onClick={() => changeStatus(comment.id, 'approved')} className="w-full px-3 py-1.5 text-sm bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded border border-green-500/20 transition-colors">
                        Approve
                      </button>
                    )}
                    {comment.status === 'pending' && (
                      <button onClick={() => changeStatus(comment.id, 'rejected')} className="w-full px-3 py-1.5 text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 rounded transition-colors">
                        Reject
                      </button>
                    )}
                    {comment.status !== 'spam' && (
                      <button onClick={() => changeStatus(comment.id, 'spam')} className="w-full px-3 py-1.5 text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded border border-red-500/20 transition-colors">
                        Mark Spam
                      </button>
                    )}
                    {comment.status === 'approved' && !comment.is_author_reply && (
                      <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="w-full px-3 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded border border-primary/20 transition-colors">
                        {replyingTo === comment.id ? 'Cancel Reply' : 'Reply'}
                      </button>
                    )}
                    <button onClick={() => handleDelete(comment.id)} className="w-full px-3 py-1.5 text-sm text-gray-500 hover:text-red-400 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>

                {replyingTo === comment.id && (
                  <div className="mt-4 ml-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700 space-y-3">
                    <label className="block text-sm font-medium text-gray-300">Reply as Author</label>
                    <textarea 
                      value={replyContent} 
                      onChange={e => setReplyContent(e.target.value)} 
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary h-24"
                      placeholder="Write your response..."
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setReplyingTo(null)} className="px-4 py-2 text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                      <button onClick={() => submitReply(comment)} className="px-4 py-2 text-sm bg-primary text-black font-bold rounded-lg hover:bg-primary-dark transition-colors">Submit Reply</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
