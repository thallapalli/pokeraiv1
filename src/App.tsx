import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, MessageSquare, List, Sparkles, Share2, Bot, User, Trophy, Users, Zap } from 'lucide-react';

const PLAYERS = ["Anji", "KT", "Purna K", "Purna S", "Srini", "Kishore"];

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loginId, setLoginId] = useState("");
  const [pass, setPass] = useState("");
  const [view, setView] = useState<'chat' | 'table'>('chat');
  const [scores, setScores] = useState<Record<string, number>>(PLAYERS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
  const [rebuys, setRebuys] = useState<Record<string, number>>(PLAYERS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    {role: 'ai', text: "Ready to manage the high stakes, KT Mama!"}
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const getNet = (p: string) => scores[p] - rebuys[p];
  const getTotalInPlay = () => Object.values(rebuys).reduce((a, b) => a + b, 0);

  const handleLogin = () => {
    if (pass === "1234") setUser({ id: loginId || "KT", role: 'admin' });
    else alert("Pass: 1234");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm space-y-10">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-700 w-24 h-24 rounded-[2.5rem] mx-auto flex items-center justify-center rotate-12 shadow-[0_0_50px_rgba(161,98,7,0.3)]">
             <Trophy size={48} className="text-black" />
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-black italic tracking-tighter text-white mb-2">CHILLBOYZ</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px]">Poker Intelligence</p>
          </div>
          <div className="bg-[#111] p-8 rounded-[3rem] border border-white/5 space-y-4 shadow-2xl">
            <input placeholder="Username" className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 outline-none focus:border-yellow-600 transition-all text-sm" onChange={e => setLoginId(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full bg-[#0a0a0a] p-5 rounded-2xl border border-white/5 outline-none focus:border-yellow-600 transition-all text-sm" onChange={e => setPass(e.target.value)} />
            <button onClick={handleLogin} className="w-full bg-yellow-600 p-5 rounded-2xl font-black text-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-yellow-900/20">Start Season</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col max-w-lg mx-auto font-sans relative">
      {/* Dashboard Header */}
      <div className="p-6 pt-10 space-y-8 bg-gradient-to-b from-[#0a0a0a] to-transparent">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black italic text-yellow-500 tracking-tighter uppercase leading-none">Season Standings</h2>
            <p className="text-[9px] font-bold text-zinc-600 tracking-[0.3em] mt-2">CHILLBOYZ POKER CLUB</p>
          </div>
          <button onClick={()=>setUser(null)} className="p-3 bg-white/5 rounded-2xl text-red-500 border border-white/5"><LogOut size={20}/></button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[ {l:'Players', v:6}, {l:'Games', v:1}, {l:'In Play', v:`₹${getTotalInPlay()}`, h:true} ].map((s,i)=>(
            <div key={i} className={`p-5 rounded-[2rem] border ${s.h?'border-yellow-600/30 bg-yellow-600/5':'border-white/5 bg-[#111]'} text-center`}>
              <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${s.h?'text-yellow-600':'text-zinc-600'}`}>{s.l}</p>
              <p className={`text-xl font-black ${s.h?'text-yellow-500':'text-white'}`}>{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-40 space-y-4 overflow-y-auto scrollbar-hide">
        {view === 'chat' ? (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] p-5 rounded-[2.5rem] text-sm font-medium ${m.role === 'user' ? 'bg-yellow-600 text-black rounded-tr-none' : 'bg-[#111] border border-white/5 rounded-tl-none text-zinc-300'}`}>
                {m.text}
              </div>
            </div>
          ))
        ) : (
          PLAYERS.map((p, i) => (
            <div key={p} className="bg-[#111] p-6 rounded-[2.5rem] flex justify-between items-center border border-white/5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-black border-2 ${i === 0 ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-zinc-800 text-zinc-600'}`}>{i+1}</div>
                <div>
                  <h3 className="font-bold text-zinc-100 text-base">{p}</h3>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">1 game</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-black tracking-tighter ${getNet(p) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {getNet(p) > 0 ? '+' : ''}{getNet(p)}
                </div>
                <p className="text-[8px] font-black uppercase opacity-20 tracking-tighter">{getNet(p) >= 0 ? 'Profit' : 'Loss'}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fixed Bottom Navigation & Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="flex items-center bg-[#1a1a1a] p-2 rounded-full border border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex bg-[#111] rounded-full p-1 border border-white/5">
            <button onClick={()=>setView('table')} className={`p-3 rounded-full transition-all ${view==='table'?'bg-yellow-600 text-black shadow-lg':'text-zinc-600'}`}><List size={20}/></button>
            <button onClick={()=>setView('chat')} className={`p-3 rounded-full transition-all ${view==='chat'?'bg-yellow-600 text-black shadow-lg':'text-zinc-600'}`}><Bot size={20}/></button>
          </div>
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            onKeyDown={e=>e.key==='Enter' && setMessages([...messages, {role:'user', text:input}])} 
            placeholder="Command AI..." 
            className="flex-1 bg-transparent px-4 outline-none text-[13px] font-semibold text-zinc-200" 
          />
          <button className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-yellow-500 active:scale-90 border border-white/5 transition-all">
            <Send size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}
