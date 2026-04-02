// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, LogOut, MessageSquare, List, Sparkles, Bot, User, Trophy, Share2, Wallet, Zap } from 'lucide-react';

const PLAYERS = ["Anji", "KT", "Purna K", "Purna S", "Srini", "Kishore"];
const DEFAULT_BUY_IN = 20;
const GLOBAL_PASS = "1234";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function App() {
  const [user, setUser] = useState(null);
  const [pass, setPass] = useState("");
  const [view, setView] = useState<'chat' | 'table'>('chat');
  const [scores, setScores] = useState<Record<string, number>>(PLAYERS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
  const [rebuys, setRebuys] = useState<Record<string, number>>(PLAYERS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
  const [messages, setMessages] = useState([{ role: 'ai', text: "SSC AI is live! JSON errors are fixed. Cheppu Mama, evarni eeroju roast cheddam? 😎" }]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const getNet = (p) => scores[p] - rebuys[p];
  const getTotalInPlay = () => Object.values(rebuys).reduce((a, b) => a + b, 0);

  // --- SAFE JSON PARSING LOGIC ---
  const extractJSON = (text) => {
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        return JSON.parse(text.substring(start, end + 1));
      }
    } catch (e) {
      console.error("JSON Parse Error", e);
    }
    return null;
  };

  const shareToWhatsApp = async () => {
    setIsThinking(true);
    const stats = PLAYERS.map(p => ({ name: p, net: getNet(p), rebuys: rebuys[p]/20 }));
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Act as 'SSC AI', a witty poker admin. Stats: ${JSON.stringify(stats)}. Generate a sarcastic WhatsApp report in Telugu-English mix. Emojis and bullet points only. No tables. Include player analysis and a roast.`;

    try {
      const result = await model.generateContent(prompt);
      window.open(`https://wa.me/?text=${encodeURIComponent(result.response.text())}`, '_blank');
    } catch (e) { alert("AI Roast failed!"); }
    finally { setIsThinking(false); }
  };

  const callSSCAI = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput("");
    setIsThinking(true);

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `You are 'SSC AI', poker admin. Players: ${PLAYERS.join(", ")}. Default buy-in: 20. Output ONLY JSON: {"player": "Name", "action": "score|rebuy|start", "value": number, "reply": "Sarcastic Telugu response"}`
      });

      const result = await model.generateContent(text);
      const data = extractJSON(result.response.text());
      
      if (data && data.player) {
        const matched = PLAYERS.find(p => p.toLowerCase() === data.player.toLowerCase());
        if (matched) {
          if (data.action === 'score') setScores(prev => ({ ...prev, [matched]: data.value }));
          else setRebuys(prev => ({ ...prev, [matched]: prev[matched] + (data.value || 20) }));
        }
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: result.response.text() }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Malli try cheyyi Mama, technical glitch!" }]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-sans text-center">
        <div className="w-full max-w-sm space-y-10 animate-in fade-in zoom-in">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-800 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center rotate-12 shadow-2xl">
            <Trophy size={40} className="text-black" />
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter">SSC AI</h1>
          <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 space-y-4 shadow-xl">
            <input type="password" placeholder="Pass (1234)" className="w-full bg-black p-5 rounded-2xl border border-white/10 text-center font-bold outline-none focus:border-yellow-600" onChange={e => setPass(e.target.value)} />
            <button onClick={() => pass === GLOBAL_PASS && setUser({id: 'KT'})} className="w-full bg-yellow-600 p-5 rounded-2xl font-black text-black uppercase tracking-widest active:scale-95 transition-all">Start Session</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050505] text-zinc-100 flex flex-col max-w-lg mx-auto overflow-hidden relative">
      {/* Premium Header */}
      <header className="p-6 pt-10 flex flex-col gap-6 bg-gradient-to-b from-black to-transparent border-b border-white/5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-600 rounded-2xl flex items-center justify-center"><Zap size={20} className="text-black fill-current"/></div>
            <div className="text-left">
              <h2 className="text-xl font-black italic uppercase leading-none">SSC Standings</h2>
              <p className="text-[8px] font-black text-yellow-600 tracking-widest uppercase">Live Intelligence</p>
            </div>
          </div>
          <button onClick={() => setUser(null)} className="p-3 bg-zinc-900 rounded-2xl text-red-500 border border-white/5"><LogOut size={20}/></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#111] p-4 rounded-[2rem] border border-white/5 text-center">
            <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Total Stakes</p>
            <p className="text-2xl font-black text-yellow-500">₹{getTotalInPlay()}</p>
          </div>
          <button onClick={shareToWhatsApp} className="bg-green-600/10 border border-green-500/20 rounded-[2rem] flex flex-col items-center justify-center text-green-500 active:scale-95 transition-all">
            <Share2 size={24}/>
            <p className="text-[10px] font-black uppercase mt-1">Roast Report</p>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-40">
        {view === 'chat' ? (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] p-5 rounded-[2.5rem] text-sm font-semibold shadow-xl ${m.role === 'user' ? 'bg-yellow-600 text-black rounded-tr-none' : 'bg-[#111] border border-white/5 rounded-tl-none'}`}>
                {m.text}
              </div>
            </div>
          ))
        ) : (
          PLAYERS.map((p, i) => (
            <div key={p} className="bg-[#111] p-6 rounded-[2.5rem] flex justify-between items-center border border-white/5">
              <div className="flex items-center gap-4 text-left">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2 ${getNet(p) > 0 ? 'border-green-500 text-green-500' : 'border-zinc-800 text-zinc-600'}`}>{i+1}</div>
                <div>
                   <h3 className="font-bold text-lg">{p}</h3>
                   <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{rebuys[p]} In</p>
                </div>
              </div>
              <div className={`text-2xl font-black ${getNet(p) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getNet(p) > 0 ? '+' : ''}{getNet(p)}
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
        {isThinking && <p className="text-[10px] text-yellow-500 animate-pulse font-black uppercase text-center">AI is analyzing...</p>}
      </main>

      {/* Input Section */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent max-w-lg mx-auto">
        <div className="flex items-center bg-[#1a1a1a] p-2 rounded-full border border-white/10 shadow-2xl">
          <div className="flex bg-black rounded-full p-1 mr-2 border border-white/5">
            <button onClick={() => setView('table')} className={`p-3 rounded-full ${view==='table'?'bg-yellow-600 text-black':'text-zinc-600'}`}><List size={22}/></button>
            <button onClick={() => setView('chat')} className={`p-3 rounded-full ${view==='chat'?'bg-yellow-600 text-black':'text-zinc-600'}`}><Bot size={22}/></button>
          </div>
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && callSSCAI(input)}
            placeholder="E.g., Anji won 200..." 
            className="flex-1 bg-transparent px-2 outline-none text-sm font-bold text-white placeholder:text-zinc-700" 
          />
          <button onClick={() => callSSCAI(input)} className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-yellow-500 border border-white/10 active:scale-90 transition-all">
            <Send size={20}/>
          </button>
        </div>
      </footer>
    </div>
  );
}
