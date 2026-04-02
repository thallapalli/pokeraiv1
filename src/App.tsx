import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, MessageSquare, List, Sparkles, Share2, Bot, User, TrendingUp, TrendingDown, Trophy, Users, Zap } from 'lucide-react';

const PLAYERS = ["Anji", "KT", "Purna K", "Purna S", "Srini", "Kishore"];
const GLOBAL_PASS = "1234";

export default function App() {
  const [user, setUser] = useState<{id: string, role: string} | null>(null);
  const [loginId, setLoginId] = useState("");
  const [pass, setPass] = useState("");
  const [view, setView] = useState<'chat' | 'table'>('chat');
  const [scores, setScores] = useState<Record<string, number>>(PLAYERS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
  const [rebuys, setRebuys] = useState<Record<string, number>>(PLAYERS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    {role: 'ai', text: "Ready to manage the high stakes, KT Mama! Start the session or tell me who's crushing it."}
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const handleAction = (player: string, action: string, value?: number) => {
    const matched = PLAYERS.find(p => p.toLowerCase() === player.toLowerCase());
    if (!matched) return;
    if (action === 'rebuy' || action === 'buyin') setRebuys(prev => ({ ...prev, [matched]: prev[matched] + (value || 20) }));
    else if (action === 'score') setScores(prev => ({ ...prev, [matched]: value || 0 }));
  };

  const getNet = (p: string) => scores[p] - rebuys[p];
  const getTotalInPlay = () => Object.values(rebuys).reduce((a, b) => a + b, 0);
  const getLeader = () => PLAYERS.reduce((prev, curr) => getNet(prev) > getNet(curr) ? prev : curr);

  const shareToWhatsApp = () => {
    let report = `*♠️ CHILLBOYZ POKER SESSION ♠️*\n\n`;
    PLAYERS.forEach(p => {
      const net = getNet(p);
      report += `${p}: ${net > 0 ? "🟢 +" : "🔴 "}${net}\n`;
    });
    report += `\n*Pot:* ₹${getTotalInPlay()} | *Leader:* ${getLeader()}\n`;
    window.open(`https://wa.me/?text=${encodeURIComponent(report)}`, '_blank');
  };

  const callAgent = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, {role: 'user', text}]);
    setInput("");
    setIsThinking(true);

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const prompt = `You are a Poker Manager. Players: ${PLAYERS.join(", ")}. Input: "${text}". 
    Return JSON ONLY: {"player": "Name", "action": "score"|"rebuy"|"start", "value": number, "reply": "A pro response in Telugu-English mix"}`;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      const cleanJson = JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json|```/g, ""));
      handleAction(cleanJson.player, cleanJson.action === 'start' ? 'rebuy' : cleanJson.action, cleanJson.value);
      setMessages(prev => [...prev, {role: 'ai', text: cleanJson.reply}]);
    } catch (e) {
      setMessages(prev => [...prev, {role: 'ai', text: "Error logic, check keys Mama!"}]);
    } finally { setIsThinking(false); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center rotate-12 shadow-2xl shadow-yellow-500/20">
            <Trophy size={40} className="text-black" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter">CHILLBOYZ POKER</h1>
          <div className="bg-[#141414] p-8 rounded-[2.5rem] border border-white/5 space-y-4">
            <input placeholder="ID" className="w-full bg-[#0a0a0a] p-5 rounded-2xl outline-none focus:ring-1 ring-yellow-500/50" onChange={e=>setLoginId(e.target.value)} />
            <input type="password" placeholder="Pass" className="w-full bg-[#0a0a0a] p-5 rounded-2xl outline-none focus:ring-1 ring-yellow-500/50" onChange={e=>setPass(e.target.value)} />
            <button onClick={() => pass === GLOBAL_PASS && setUser({id: loginId, role: 'admin'})} className="w-full bg-yellow-600 p-5 rounded-2xl font-black text-black tracking-widest uppercase hover:bg-yellow-500 transition-colors">Start Season</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col max-w-lg mx-auto border-x border-white/5">
      {/* Header with Stats Dashboard */}
      <header className="p-6 space-y-6 bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black italic text-yellow-500 tracking-tighter uppercase">Season Standings</h2>
            <p className="text-[10px] font-bold text-zinc-600 tracking-[0.3em]">CHILLBOYZ POKER CLUB</p>
          </div>
          <button onClick={()=>setUser(null)} className="p-3 bg-zinc-900 rounded-2xl text-red-500"><LogOut size={20}/></button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#141414] p-4 rounded-3xl border border-white/5 text-center">
            <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Players</p>
            <p className="text-xl font-black text-zinc-100">6</p>
          </div>
          <div className="bg-[#141414] p-4 rounded-3xl border border-white/5 text-center">
            <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Games</p>
            <p className="text-xl font-black text-zinc-100">1</p>
          </div>
          <div className="bg-[#141414] p-4 rounded-3xl border border-white/5 text-center ring-1 ring-yellow-500/30">
            <p className="text-[9px] font-bold text-yellow-600 uppercase mb-1">In Play</p>
            <p className="text-xl font-black text-yellow-500">₹{getTotalInPlay()}</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {view === 'chat' ? (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-2 rounded-xl ${m.role === 'user' ? 'bg-yellow-600 text-black' : 'bg-zinc-800'}`}>
                  {m.role === 'user' ? <User size={16}/> : <Bot size={16}/>}
                </div>
                <div className={`max-w-[85%] p-4 rounded-[2rem] text-[13px] font-semibold ${m.role === 'user' ? 'bg-yellow-600 text-black rounded-tr-none' : 'bg-[#141414] border border-white/5 rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isThinking && <div className="text-[10px] text-yellow-500 animate-pulse font-black px-10">AI ANALYZING DATA...</div>}
            <div ref={chatEndRef} />
          </div>
        ) : (
          <div className="space-y-3">
            {PLAYERS.map((p, i) => (
              <div key={p} className="bg-[#141414] p-5 rounded-[2.2rem] flex justify-between items-center border border-white/5 hover:border-yellow-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2 ${i === 0 ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-zinc-800 text-zinc-600'}`}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-200">{p}</h3>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">1 game</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-black tracking-tighter ${getNet(p) >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                    {getNet(p) > 0 ? '+' : ''}{getNet(p).toFixed(2)}
                  </div>
                  <p className="text-[8px] font-bold uppercase opacity-30 tracking-widest">{getNet(p) >= 0 ? 'Profit' : 'Loss'}</p>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3 mt-6">
               <div className="bg-[#0f1411] p-4 rounded-3xl border border-green-500/10">
                  <p className="text-[8px] font-black text-green-500 uppercase mb-1">Hot Streak</p>
                  <p className="text-sm font-bold">{getLeader()}</p>
                  <p className="text-xs font-black text-green-500 mt-1">+{getNet(getLeader()).toFixed(2)}</p>
               </div>
               <div className="bg-[#181111] p-4 rounded-3xl border border-red-500/10">
                  <p className="text-[8px] font-black text-red-500 uppercase mb-1">In the hole</p>
                  <p className="text-sm font-bold">{PLAYERS.reduce((p, c) => getNet(p) < getNet(c) ? p : c)}</p>
                  <p className="text-xs font-black text-red-500 mt-1">{getNet(PLAYERS.reduce((p, c) => getNet(p) < getNet(c) ? p : c)).toFixed(2)}</p>
               </div>
            </div>
            
            <button onClick={shareToWhatsApp} className="w-full mt-6 bg-[#141414] p-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 border border-green-500/20 text-green-500 hover:bg-green-500/5 transition-all">
              <Share2 size={18}/> Share WhatsApp Report
            </button>
          </div>
        )}
      </div>

      {/* Modern Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="flex gap-2 items-center bg-[#1c1c1c] p-2 rounded-[3rem] border border-white/5 shadow-2xl">
          <button onClick={()=>setView('table')} className={`flex-1 p-3 rounded-full flex flex-col items-center gap-1 transition-all ${view==='table'?'bg-yellow-600 text-black shadow-lg shadow-yellow-600/20':'text-zinc-600'}`}>
            <List size={18}/> <span className="text-[8px] font-black uppercase">Standings</span>
          </button>
          <button onClick={()=>setView('chat')} className={`flex-1 p-3 rounded-full flex flex-col items-center gap-1 transition-all ${view==='chat'?'bg-yellow-600 text-black shadow-lg shadow-yellow-600/20':'text-zinc-600'}`}>
            <Bot size={18}/> <span className="text-[8px] font-black uppercase">AI Game</span>
          </button>
          <div className="w-[1px] h-8 bg-white/5 mx-2" />
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && callAgent(input)} placeholder="Command AI..." className="flex-[2] bg-transparent outline-none text-[13px] px-2 font-medium" />
          <button onClick={()=>callAgent(input)} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-yellow-500 active:scale-90 transition-all"><Send size={16}/></button>
        </div>
      </div>
    </div>
  );
}
