import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Send, 
  UserPlus, 
  Globe
} from 'lucide-react';
import { 
  fetchChatMessages, 
  sendChatMessage, 
  ChatMessage, 
  fetchCommunityFriends, 
  sendFriendRequest, 
  CommunityFriend 
} from '../../lib/api';

interface WorldCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorldCommunityModal: React.FC<WorldCommunityModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'world_chat' | 'friends'>('world_chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [friends, setFriends] = useState<CommunityFriend[]>([]);
  const [addUsername, setAddUsername] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'world_chat') {
        const msgs = await fetchChatMessages('world_chat');
        setMessages(msgs);
      } else {
        const fList = await fetchCommunityFriends();
        setFriends(fList);
      }
    } catch {}
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const user = localStorage.getItem('eduplay_username') || 'Chiến Binh Avengers';
    const text = inputText.trim();
    setInputText('');

    try {
      const res = await sendChatMessage(text, 'world_chat', user, 'iron-man');
      setMessages((prev) => [...prev, res.user_message]);
    } catch {}
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUsername.trim()) return;

    setFeedbackMsg(null);
    try {
      const res = await sendFriendRequest(addUsername.trim());
      setFeedbackMsg(res.message);
      setAddUsername('');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kết bạn';
      setFeedbackMsg(`❌ ${msg}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0e1626] border-2 border-cyan-500/40 rounded-3xl max-w-2xl w-full h-[600px] flex flex-col overflow-hidden shadow-2xl">
        {/* Header with Tabs */}
        <div className="p-4 bg-[#141f33] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('world_chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition ${
                activeTab === 'world_chat'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe className="w-4 h-4" /> Kênh Chat Thế Giới
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition ${
                activeTab === 'friends'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" /> Bạn Bè & Kết Bạn
            </button>
          </div>

          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 1: World Chat */}
        {activeTab === 'world_chat' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {messages.map((m) => (
                <div key={m.id} className="flex items-start gap-3 bg-[#131b2c] p-3 rounded-2xl border border-gray-800/80">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center border border-cyan-500/30 text-xs shrink-0">
                    {m.sender_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-cyan-300">{m.sender_name}</span>
                      <span className="text-[10px] text-gray-500">
                        {m.created_at ? new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                      </span>
                    </div>
                    <p className="text-gray-200 leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#0a101d] border-t border-gray-800 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhắn tin với mọi người trên toàn cầu..."
                className="flex-1 bg-[#161F30] border border-gray-700 focus:border-cyan-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Friends & Community */}
        {activeTab === 'friends' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs">
            {/* Add Friend Form */}
            <form onSubmit={handleAddFriend} className="bg-[#131b2c] p-4 rounded-2xl border border-gray-800 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" /> Kết Bạn Mới
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={addUsername}
                  onChange={(e) => setAddUsername(e.target.value)}
                  placeholder="Nhập username của bạn bè (vd: avenger_hero)..."
                  className="flex-1 bg-[#0b0f19] border border-gray-700 focus:border-purple-400 rounded-xl px-4 py-2 text-xs text-white focus:outline-none transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition cursor-pointer"
                >
                  Gửi Lời Mời
                </button>
              </div>
              {feedbackMsg && (
                <p className="text-xs font-semibold text-cyan-300">{feedbackMsg}</p>
              )}
            </form>

            {/* Friends List */}
            <div>
              <h4 className="font-bold text-gray-300 mb-3 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> Người Học Trong Cộng Đồng
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {friends.map((f) => (
                  <div key={f.id} className="bg-[#131b2c] p-3 rounded-2xl border border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center border border-purple-500/30 text-xs">
                        {f.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{f.full_name || f.username}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                        <span className="text-[10px] text-gray-400">@{f.username}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                      Bạn Bè
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
