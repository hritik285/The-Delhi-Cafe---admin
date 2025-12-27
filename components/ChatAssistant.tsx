import React, { useState, useRef, useEffect } from 'react';
import { MenuItem } from '../types';
import { askMenuAssistant } from '../services/geminiService';
import { MessageCircle, Send, Loader2, Minimize2, Sparkles } from 'lucide-react';

interface ChatAssistantProps {
  menu: MenuItem[];
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ menu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Hello! I'm your AI Menu Assistant. Ask me anything about our food!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const history = messages.map(m => m.text);
    const answer = await askMenuAssistant(menu, userMsg, history);

    setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all z-40 flex items-center gap-2"
      >
        <Sparkles size={24} />
        <span className="font-semibold hidden md:inline">Ask AI</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 md:right-24 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-indigo-100 z-40 overflow-hidden flex flex-col max-h-[500px]">
      <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Sparkles size={18} />
          <h3 className="font-bold">Menu Assistant</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-500 p-1 rounded">
          <Minimize2 size={18} />
        </button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white border border-indigo-100 text-slate-700 rounded-bl-none shadow-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-indigo-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-indigo-600" />
              <span className="text-xs text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about ingredients, allergies..."
          className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
