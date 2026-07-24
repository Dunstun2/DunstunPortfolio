'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';

export default function AdminContact() {
  const refreshKey = useRealtimeRefresh('contact');
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [senderName, setSenderName] = useState('Dunstun Wambutsi');
  const [replying, setReplying] = useState(false);
  const [replyResult, setReplyResult] = useState<{ emailSent?: boolean; whatsappLink?: string | null; error?: string } | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const loadData = () => {
    fetchApi('/contact').then(res => setMessages(res.data)).catch(console.error);
  };

  useEffect(() => { loadData(); }, [refreshKey]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetchApi(`/contact/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    setReplying(true);
    setReplyResult(null);
    try {
      const res = await fetchApi(`/contact/${selectedMessage.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ replyBody: replyText, senderName: senderName || undefined }),
      });
      if (res.success) {
        setReplyResult({ emailSent: res.emailSent, whatsappLink: res.whatsappLink });
        // Refresh message list to see updated status
        loadData();
        // Update selected message status locally
        setSelectedMessage({ ...selectedMessage, status: 'replied' });
      } else {
        setReplyResult({ error: res.message || 'Failed to send reply' });
      }
    } catch (err: any) {
      setReplyResult({ error: err.message || 'Network error' });
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await fetchApi(`/contact/${id}`, { method: 'DELETE' });
      setSelectedMessage(null);
      setShowReplyForm(false);
      setReplyResult(null);
      loadData();
    } catch (err) { console.error(err); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-blue-500/20 text-blue-400';
      case 'read': return 'bg-yellow-500/20 text-yellow-400';
      case 'replied': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-600/50 text-gray-400';
    }
  };

  const selectMessage = (msg: any) => {
    setSelectedMessage(msg);
    setShowReplyForm(false);
    setReplyText('');
    setReplyResult(null);
    if (msg.status === 'unread') handleStatusChange(msg.id, 'read');
  };

  return (
    <div>
      <h1 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 whitespace-nowrap">Contact Messages</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-xs sm:text-sm text-gray-300">
                <th className="p-3 sm:p-4 w-4/12">From</th>
                <th className="p-3 sm:p-4 w-5/12">Subject</th>
                <th className="p-3 sm:p-4 w-3/12">Status</th>
                <th className="p-3 sm:p-4 hidden md:table-cell w-2/12">Date</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(msg => (
                <tr 
                  key={msg.id} 
                  onClick={() => selectMessage(msg)}
                  className={`border-b border-gray-700 cursor-pointer transition-colors ${selectedMessage?.id === msg.id ? 'bg-gray-700' : 'hover:bg-gray-750'} ${msg.status === 'unread' ? 'font-bold text-white' : 'text-gray-300'}`}
                >
                  <td className="p-3 sm:p-4 text-xs sm:text-sm truncate">{msg.name}</td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm truncate">{msg.subject || 'No Subject'}</td>
                  <td className="p-3 sm:p-4">
                    <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded ${getStatusColor(msg.status)}`}>
                      {msg.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-400 whitespace-nowrap hidden md:table-cell">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500 text-sm">No messages yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Message Detail & Reply */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          {selectedMessage ? (
            <div className="space-y-5">
              {/* Message Header */}
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{selectedMessage.subject || 'No Subject'}</h3>
                <p className="text-primary text-sm mb-0.5">From: {selectedMessage.name}</p>
                <p className="text-gray-400 text-sm">{selectedMessage.email}</p>
                {selectedMessage.phone && (
                  <p className="text-green-400 text-sm mt-1 flex items-center gap-1.5">
                    📱 {selectedMessage.phone}
                    <span className="text-gray-600 text-xs">(WhatsApp)</span>
                  </p>
                )}
                <p className="text-gray-400 text-xs mt-2 border-t border-gray-700/50 pt-2">
                  📅 Sent on: <span className="text-gray-300 font-medium">{new Date(selectedMessage.created_at).toLocaleString()}</span>
                </p>
              </div>
              
              {/* Original Message */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-text-light/80 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {selectedMessage.status !== 'replied' && (
                  <button 
                    onClick={() => setShowReplyForm(!showReplyForm)} 
                    className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-bold hover:bg-primary/30 transition-colors flex items-center gap-1.5"
                  >
                    ✉️ Reply
                  </button>
                )}
                {selectedMessage.status === 'replied' && !showReplyForm && (
                  <button 
                    onClick={() => setShowReplyForm(true)} 
                    className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-bold hover:bg-primary/30 transition-colors flex items-center gap-1.5"
                  >
                    ✉️ Reply Again
                  </button>
                )}
                {selectedMessage.status !== 'replied' && (
                  <button onClick={() => handleStatusChange(selectedMessage.id, 'replied')} className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold hover:bg-green-500/30 transition-colors">
                    Mark as Replied
                  </button>
                )}
                <button onClick={() => handleDelete(selectedMessage.id)} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/30 transition-colors">
                  Delete
                </button>
              </div>

              {/* Reply Form */}
              {showReplyForm && (
                <div className="border-t border-gray-700 pt-5 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    📤 Compose Reply
                    <span className="text-gray-500 font-normal">→ {selectedMessage.email}</span>
                  </h4>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Your Name (optional)</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      placeholder="e.g. Dunstun Wambutsi"
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Reply Message *</label>
                    <textarea
                      rows={5}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleReply}
                      disabled={replying || !replyText.trim()}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/85 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      {replying ? '⏳ Sending...' : '📧 Send Email Reply'}
                    </button>

                    {selectedMessage.phone && (
                      <a
                        href={`https://wa.me/${(() => {
                          let cleaned = selectedMessage.phone.replace(/[^0-9]/g, '');
                          if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
                          return cleaned;
                        })()}?text=${encodeURIComponent(`Hi *${selectedMessage.name}*,\n\n${replyText}\n\n---\n*Reply from:* Dunstun Wambutsi's Portfolio\n*Date:* ${new Date().toLocaleDateString()}\n\nOn *${new Date(selectedMessage.created_at).toLocaleDateString()}*, you wrote regarding _"${selectedMessage.subject || 'Your inquiry'}"_:\n"${selectedMessage.message}"`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-500 transition-colors flex items-center gap-1.5"
                      >
                        💬 Reply via WhatsApp
                      </a>
                    )}

                    <button
                      onClick={() => { setShowReplyForm(false); setReplyResult(null); }}
                      className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Reply Result Feedback */}
                  {replyResult && (
                    <div className="space-y-2">
                      {replyResult.emailSent && (
                        <div className="p-3 bg-green-500/15 border border-green-500/30 text-green-400 rounded-lg text-sm flex items-center gap-2">
                          ✅ Email sent successfully to {selectedMessage.email}
                        </div>
                      )}
                      {replyResult.emailSent === false && !replyResult.error && (
                        <div className="p-3 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 rounded-lg text-sm">
                          ⚠️ Email could not be sent. Check your SMTP settings in the backend .env file.
                        </div>
                      )}
                      {replyResult.error && (
                        <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg text-sm">
                          ❌ {replyResult.error}
                        </div>
                      )}
                      {replyResult.whatsappLink && (
                        <a
                          href={replyResult.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-green-600/15 border border-green-600/30 text-green-400 rounded-lg text-sm hover:bg-green-600/25 transition-colors"
                        >
                          💬 Open WhatsApp to also notify {selectedMessage.name} via WhatsApp →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
