import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Users, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import ChatWindow from './ChatWindow'; 

const ChatHub: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<{ id: string; title: string } | null>(null);
  const [myMissions, setMyMissions] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      // On utilise la route que nous avons stabilisée
      axiosInstance.get('/assignments/my').then((res) => {
        const accepted = res.data.filter((a: any) => a.statut === 'acceptée');
        setMyMissions(accepted);
      }).catch(err => console.log("Erreur missions chat:", err));
    }
  }, [isOpen, user]);



  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeRoom && (
                <button onClick={() => setActiveRoom(null)} className="p-1 hover:bg-slate-800 rounded">
                  <ChevronLeft size={20} />
                </button>
              )}
              <span className="font-bold text-sm">
                {activeRoom ? activeRoom.title : 'Communications'}
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-800 rounded">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {!activeRoom ? (
              <div className="p-4 space-y-2 overflow-y-auto h-full bg-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Salons</p>
                
                <button 
                  onClick={() => setActiveRoom({ id: 'general', title: 'Chat Général' })}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-500 transition-all group"
                >
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Users size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-slate-800">Général</p>
                    <p className="text-[10px] text-slate-400 italic">Discussion interne</p>
                  </div>
                </button>

                {myMissions.length > 0 && (
                   <>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 mb-4">Par Mission</p>
                     {myMissions.map((m) => (
                        <button 
                          key={m._id}
                          onClick={() => setActiveRoom({ id: m.taskId._id, title: m.taskId.titre })}
                          className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-purple-500 transition-all group"
                        >
                          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <MessageSquare size={20} />
                          </div>
                          <div className="text-left overflow-hidden">
                            <p className="font-bold text-sm text-slate-800 truncate">{m.taskId.titre}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{m.taskId.direction}</p>
                          </div>
                        </button>
                      ))}
                   </>
                )}
              </div>
            ) : (
              <ChatWindow taskId={activeRoom.id} title={activeRoom.title} />
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center gap-2 ${
          isOpen ? 'bg-rose-500 rotate-90' : 'bg-indigo-600'
        } text-white`}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-4 border-slate-50 rounded-full animate-pulse"></span>
        )}
      </button>
    </div>
  );
};

export default ChatHub;