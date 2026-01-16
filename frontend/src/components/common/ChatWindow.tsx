import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Send } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

interface ChatWindowProps {
  taskId: string;
  title: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ taskId, title }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Rejoindre le salon spécifique
    socket.emit('join_chat', taskId);

    // Charger l'historique
    const loadHistory = async () => {
        try {
            const res = await axiosInstance.get(`/messages/${taskId}`);
            setMessages(res.data);
        } catch (err) { console.error(err); }
    };
    loadHistory();

    // Écouter les messages en direct
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => { socket.off('receive_message'); };
  }, [taskId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    socket.emit('send_message', {
      senderId: user?._id,
      taskId: taskId,
      content: input
    });
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.sender?._id === user?._id ? 'items-end' : 'items-start'}`}>
            <span className="text-[9px] text-slate-400 mb-1 px-1 font-bold">
                {m.sender?.prenom} {m.sender?.nom}
            </span>
            <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
              m.sender?._id === user?._id 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message..." 
          className="flex-1 px-4 py-2 bg-slate-100 border-none rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
        />
        <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;