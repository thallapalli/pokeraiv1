// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, LogOut, List, Bot, Trophy, Share2, Zap, Wallet } from 'lucide-react';

const PLAYERS = ["Anji", "KT", "Purna K", "Purna S", "Srini", "Kishore"];
const GLOBAL_PASS = "1234";
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function App() {
  const [user, setUser] = useState(null);
  const [pass, setPass] = useState("");
  const [view, setView] = useState<'chat' | 'table'>('chat');
  const [scores, setScores] = useState<Record<string, number>>(PLAYERS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
  const [rebuys, setRebuys] = useState<Record<string, number>>(PLAYERS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
  const [messages, setMessages] = useState([{ role: 'ai', text: "Ready for the high stakes, KT Mama! Start the session or tell me who's crushing it." }]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getNet = (p) => scores[p] - rebuys[p];
  const getTotalInPlay = () => Object.values(rebuys).reduce((a, b) => a + b, 0);

  // --- ROBUST JSON EXTRACTION ---
  const extractJSON = (text) => {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (e) { return null; }
    }
    return null;
  };

  const shareToWhatsApp = async () => {
    setIsThinking(true);
    const stats = PLAYERS.map(p => ({ name: p, net: getNet(p), rebuys: rebuys[p]/20 }));
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`Analyze poker stats: ${JSON.stringify(stats)}. Create a sarcastic WhatsApp report in Telugu-English mix. Focus on roasts and funny titles. No tables.`);
      window.open(`https://wa.me/?text=${encodeURIComponent(result.response.text())}`, '_blank');
    } catch (e) { alert("AI Roast failed!"); }
    finally { setIsThinking(false); }
  };

  const callSSCAI = async (text) => {
    if (!text.trim()) return;
    const newMsg = { role: 'user', text };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `You are 'SSC AI'. Admin for KT's poker group. Players: ${PLAYERS.join(", ")}. 
        Always respond with sarcasm and a joke. 
        Output JSON: {"player": "Name", "action": "score|rebuy", "value": number, "reply": "Sarcastic response"}`
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
      setMessages(prev => [...prev, { role: 'ai', text: "Technical glitch Mama!" }]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!user) return (
    <div className="h-[100dvh] bg-black text-white flex flex-col items-center justify-center p-8 font-sans">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in duration-700">
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-700 w-20 h-20 rounded-[2rem] mx-auto flex items-center justify-center rotate-12 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
          <Trophy size={40} className="text-black" />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter text-center uppercase">Chillboyz Poker</h1>
        <div className="bg-[#111] p-6 rounded-[2.5rem] border border-white/5 space-y-4 shadow-2xl">
          <input type="text" placeholder="KT" className="w-full bg-black p-4 rounded-2xl border border-white/10 outline-none focus:border-yellow-600 text-center font-bold" />
          <input type="password" placeholder="***" className="w-full bg-black p-4 rounded-2xl border border-white/10 outline-none focus:border-yellow-600 text-center font-bold" onChange={e => setPass(e.target.value)} />
          <button onClick={() => pass === GLOBAL_PASS && setUser({id:'KT'})} className="w-full bg-yellow-500 p-4 rounded-2xl font-black text-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-yellow-600/20">Start Season</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[100dvh] bg-[#050505] text-zinc-100 flex flex-col max-w-lg mx-auto overflow-hidden font-sans">
      {/* Dynamic Header */}
      <header className="p-6 pt-8 space-y-6 bg-black/60 backdrop-blur-2xl border-b border-white/5 z-20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-yellow-500 italic uppercase tracking-tighter">Season Standings</h2>
            <p className="text-[8px] font-bold text-zinc-600 tracking-[0.3em] uppercase mt-1">Chillboyz Poker Club</p>
          </div>
          <button onClick={() => setUser(null)} className="p-3 bg-[#111] rounded-2xl text-red-500 border border-white/5 active:scale-90 transition-all"><LogOut size={18}/></button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#111] p-3 rounded-3xl border border-white/5 text-center">
            <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">Players</p>
            <p className="text-xl font-black">6</p>
          </div>
          <div className="bg-[#111] p-3 rounded-3xl border border-white/5 text-center">
            <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">Games</p>
            <p className="text-xl font-black">1</p>
          </div>
          <div className="bg-[#111] p-3 rounded-3xl border border-yellow-500/20 text-center">
            <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">In Play</p>
            <p className="text-xl font-black text-yellow-500">₹{getTotalInPlay()}</p>
          </div>
        </div>
      </header>

      {/* Main Content: Overlapping Fixed */}
      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scroll-smooth">
        {view === 'chat' ? (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              {m.role === 'ai' && <div className="w-8 h-8 bg-zinc-800 rounded-xl flex items-center justify-center mr-2 border border-white/5 self-start"><Bot size={14} className="text-zinc-400"/></div>}
              <div className={`max-w-[80%] p-4 rounded-[1.8rem] text-sm font-semibold leading-relaxed shadow-xl ${m.role === 'user' ? 'bg-yellow-600 text-black rounded-tr-none' : 'bg-[#111] border border-white/10 rounded-tl-none text-zinc-200'}`}>
                {m.text}
              </div>
            </div>
          ))
        ) : (
          PLAYERS.map((p, i) => (
            <div key={p} className="bg-[#111] p-5 rounded-[2rem] flex justify-between items-center border border-white/5 transition-all active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border ${getNet(p) > 0 ? 'border-green-500 text-green-500' : 'border-zinc-800 text-zinc-600'}`}>{i+1}</div>
                <div><h3 className="font-bold text-zinc-100">{p}</h3><p className="text-[9px] opacity-40 font-black tracking-widest">{rebuys[p]} IN</p></div>
              </div>
              <div className={`text-xl font-black ${getNet(p) >= 0 ? 'text-green-500' : 'text-red-500'}`}>{getNet(p) > 0 ? '+' : ''}{getNet(p)}</div>
            </div>
          ))
        )}
        {isThinking && <div className="flex gap-1 p-2"><div className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-bounce [animation-delay:-.3s]"></div><div className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-bounce [animation-delay:-.5s]"></div></div>}
        <div ref={chatEndRef} className="h-2" />
      </main>

      {/* World-Class Command Bar */}
      <footer className="p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-30">
        <div className="flex items-center bg-[#1a1a1a] p-1.5 rounded-[2.5rem] border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex bg-black rounded-full p-1 mr-2 border border-white/5">
            <button onClick={() => setView('table')} className={`p-3 rounded-full transition-all ${view==='table'?'bg-yellow-600 text-black shadow-lg':'text-zinc-600'}`}><List size={20}/></button>
            <button onClick={() => setView('chat')} className={`p-3 rounded-full transition-all ${view==='chat'?'bg-yellow-600 text-black shadow-lg':'text-zinc-600'}`}><Bot size={20}/></button>
          </div>
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && callSSCAI(input)}
            placeholder="Command AI..." 
            className="flex-1 bg-transparent px-2 outline-none text-sm font-bold text-zinc-200 placeholder:text-zinc-700" 
          />
          <button onClick={() => callSSCAI(input)} className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-black active:scale-90 transition-all shadow-lg"><Send size={16}/></button>
          <button onClick={shareToWhatsApp} className="ml-2 w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-green-500 border border-white/5 active:scale-90 transition-all"><Share2 size={16}/></button>
        </div>
      </footer>
    </div>
  );
}
