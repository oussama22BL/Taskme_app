import React from 'react';
import ChatWindow from '../../components/common/ChatWindow';

const ChatPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-140px)]">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">Espace Communication</h1>
        <p className="text-slate-500">Échangez avec vos collègues auditeurs en temps réel.</p>
      </div>
      <div className="h-full max-w-5xl mx-auto">
        <ChatWindow taskId="general" title="Salon Général des Auditeurs" />
      </div>
    </div>
  );
};

export default ChatPage;