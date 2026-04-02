// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, LogOut, MessageSquare, List, Sparkles, Bot, User, Trophy, Share2, Wallet, Zap } from 'lucide-react';

// 1. Core Config
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
  const [messages, setMessages] = useState([{ role: 'ai', text: "Namaste KT Mama! SSC AI is in the house. UI overlapping fixed! Cheppu, evadi debba ki evadu bali ayyadu eeroju? 😎" }]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const getNet = (p) => scores[p] - rebuys[p];
  const getTotalInPlay = () => Object.values(rebuys).reduce((a, b) => a + b, 0);

  // --- SSC AI: SARCASTIC ANALYSIS REPORT ---
  const shareToWhatsApp = async () => {
    setIsThinking(true);
    const stats = PLAYERS.map(p => ({ name: p, net: getNet(p), rebuys: rebuys[p]/20 }));
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Act as 'SSC AI', a brutally sarcastic poker admin. Session stats: ${JSON.stringify(stats)}. 
    Generate a WhatsApp report in Telugu-English mix. 
    1. Funny Session Title. 
    2. Analyze each player with a funny title and a roast based on their net score. 
    3. Moral of the session. 
    Keep it respectful but hilarious. Use emojis. No tables.`;

    try {
      const result = await model.generateContent(prompt);
      window.open(`https://wa.me/?text=${encodeURIComponent(result.response.text())}`, '_blank');
    } catch (e) {
      alert("AI failed to roast, but you are still losing! Try again.");
    } finally {
      setIsThinking(false);
    }
  };

  const callSSCAI = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput("");
    setIsThinking(true);

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `You are 'SSC AI'. Admin for KT's poker group. Players: ${PLAYERS.join(", ")}. Default Buy-in: $20. 
        Always respond with sarcasm and a joke about the player mentioned. 
        Output JSON ONLY: {"player": "Name", "action": "score|rebuy|start", "value": number, "reply": "Sarcastic response"}`
      });

      const result = await model.generateContent(text);
      const data = JSON.parse(result.response.text().match(/\{.*\}/s)[0]);
      
      const matched = PLAYERS.find(p => p.toLowerCase() === data.player.toLowerCase());
      if (matched) {
        if (data.action === 'score') setScores(prev => ({ ...prev, [matched]: data.value }));
        else setRebuys(prev => ({ ...prev, [matched]: prev[matched] + (data.value || 20) }));
      }
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Malli cheppu Mama, logic miss ayindi!" }]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-12 text-center animate-in fade-in zoom-in duration-500">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20"></div>
            <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-700 w-24 h-24 rounded-[2.5rem] mx-auto flex items-center justify-center rotate-12 shadow-2xl">
              <Trophy size={48} className="text-black" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black italic tracking-tighter uppercase">SSC AI</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px]">Premium Poker Admin</p>
          </div>
          <div className="bg-[#111] p-8 rounded-[3rem] border border-white/5 space-y-4 shadow-2xl">
            <input type="password" placeholder="Pass Code" className="w-full bg-black p-5 rounded-2xl border border-white/10 outline-none focus:border-yellow-600 transition-all text-center font-bold tracking-widest" onChange={e => setPass(e.target.value)} />
            <button onClick={() => pass === GLOBAL_PASS && setUser({id: 'KT'})} className="w-full bg-yellow-600 p-5 rounded-2xl font-black text-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-yellow-900/40">Enter Den</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050505] text-zinc-100 flex flex-col max-w-lg mx-auto overflow-hidden font-sans">
      {/* Header Section */}
      <header className="p-6 pt-10 flex flex-col gap-6 bg-gradient-to-b from-black to-transparent border-b border-white/5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-600/20"><Zap size={20} className="text-black fill-current"/></div>
            <div>
              <h2 className="text-xl font-black italic text-white uppercase leading-none">SSC Standings</h2>
              <p className="text-[8px] font-black text-yellow-600 tracking-widest mt-1 uppercase">Live Game Insight</p>
            </div>
          </div>
          <button onClick={() => setUser(null)} className="p-3 bg-white/5 rounded-2xl border border-white/5 text-red-500 active:scale-90 transition-all"><LogOut size={20}/></button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111] p-4 rounded-[2rem] border border-white/5 flex flex-col items-center">
            <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Total Stakes</p>
            <p className="text-2xl font-black text-yellow-500 tracking-tighter">₹{getTotalInPlay()}</p>
          </div>
          <button onClick={shareToWhatsApp} className="bg-green-600/10 border border-green-500/20 rounded-[2rem] flex flex-col items-center justify-center text-green-500 hover:bg-green-600/20 active:scale-95 transition-all">
            <Share2 size={24}/>
            <p className="text-[9px] font-black uppercase mt-1">Roast Report</p>
          </button>
        </div>
      </header>

      {/* Main Content: Scrollable & Responsive */}
      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide pb-40">
        {view === 'chat' ? (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] p-5 rounded-[2.5rem] text-sm font-semibold shadow-xl ${m.role === 'user' ? 'bg-yellow-600 text-black rounded-tr-none' : 'bg-[#111] border border-white/5 rounded-tl-none text-zinc-200'}`}>
                {m.text}
              </div>
            </div>
          ))
        ) : (
          PLAYERS.map((p, i) => (
            <div key={p} className="bg-[#111] p-6 rounded-[2.5rem] flex justify-between items-center border border-white/5 group hover:border-yellow-600/50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-black border-2 ${getNet(p) > 0 ? 'border-green-500 bg-green-500/5 text-green-500' : 'border-zinc-800 text-zinc-600'}`}>{i+1}</div>
                <div>
                  <h3 className="font-bold text-zinc-100 text-lg">{p}</h3>
                  <div className="flex gap-2 items-center opacity-40">
                     <Wallet size={10}/><p className="text-[10px] font-black uppercase tracking-widest">{rebuys[p]} In</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-black tracking-tighter ${getNet(p) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {getNet(p) > 0 ? '+' : ''}{getNet(p)}
                </div>
                <p className="text-[8px] font-black uppercase opacity-20 tracking-tighter">Net Result</p>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
        {isThinking && <div className="text-[10px] text-yellow-500 animate-pulse font-black uppercase text-center py-4">SSC AI is analyzing the carnage...</div>}
      </main>

      {/* Fixed Navigation & Command Bar */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent">
        <div className="flex items-center bg-[#181818] p-2 rounded-full border border-white/10 shadow-2xl backdrop-blur-md">
          <div className="flex bg-black rounded-full p-1 border border-white/5">
            <button onClick={() => setView('table')} className={`p-3 rounded-full transition-all duration-300 ${view==='table'?'bg-yellow-600 text-black shadow-lg shadow-yellow-600/40':'text-zinc-600 hover:text-zinc-400'}`}><List size={22}/></button>
            <button onClick={() => setView('chat')} className={`p-3 rounded-full transition-all duration-300 ${view==='chat'?'bg-yellow-600 text-black shadow-lg shadow-yellow-600/40':'text-zinc-600 hover:text-zinc-400'}`}><Bot size={22}/></button>
          </div>
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && callSSCAI(input)}
            placeholder="E.g., Anji won 200..." 
            className="flex-1 bg-transparent px-4 outline-none text-[13px] font-bold text-zinc-100 placeholder:text-zinc-700" 
          />
          <button onClick={() => callSSCAI(input)} className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-yellow-500 border border-white/10 active:scale-90 transition-all shadow-xl hover:bg-zinc-700">
            <Send size={20}/>
          </button>
        </div>
      </footer>
    </div>
  );
}
