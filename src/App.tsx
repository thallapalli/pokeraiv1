// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Lock, Users, BarChart3, ShieldAlert, Mic, Send, LogOut, Info, AlertTriangle } from 'lucide-react';

/**
 * PROJECT: CHILLBOYZ POKER SCORE (ULTIMATE AGENTIC EDITION)
 * ARCHITECT: KT (Senior Software Architect)
 * FEATURES: Admin RBAC, Gemini AI Agent, Zero-Sum Guardrail, Legal Disclaimer
 */

const PLAYERS = ["Anji", "KT", "Purna K", "Purna S", "Srini", "Kishore"];
const ADMIN_ID = "KT";
const ADMIN_PASS = "123"; // మామ, నీకు నచ్చినట్లు మార్చుకో
const PLAYER_DEFAULT_PASS = "1234";

export default function App() {
  const [user, setUser] = useState(null);
  const [loginId, setLoginId] = useState("");
  const [pass, setPass] = useState("");
  const [view, setView] = useState('dashboard');
  const [scores, setScores] = useState(PLAYERS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
  const [rebuys, setRebuys] = useState(PLAYERS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
  const [aiInput, setAiInput] = useState("");
  const [aiStatus, setAiStatus] = useState("ChillBoyz Agent Ready");

  // --- AUTH ---
  const handleLogin = () => {
    if (loginId === ADMIN_ID && pass === ADMIN_PASS) {
      setUser({ id: ADMIN_ID, role: 'admin' });
    } else if (PLAYERS.includes(loginId) && pass === PLAYER_DEFAULT_PASS) {
      setUser({ id: loginId, role: 'player' });
    } else {
      alert("Invalid ID or Password!");
    }
  };

  // --- ACTIONS ---
  const handleRebuy = (player) => {
    setRebuys(prev => ({ ...prev, [player]: prev[player] + 20 }));
    setAiStatus(`Added $20 rebuy for ${player}`);
  };

  const handleScoreChange = (player, val) => {
    setScores(prev => ({ ...prev, [player]: parseInt(val) || 0 }));
  };

  const calculateBalance = () => {
    const totalWin = Object.values(scores).reduce((a, b) => a + b, 0);
    const totalBuyIn = Object.values(rebuys).reduce((a, b) => a + b, 0);
    return totalWin - totalBuyIn;
  };

  // --- AGENTIC AI ENGINE (Gemini Integration) ---
  const callAiAgent = async (command) => {
    if (!command) return;
    setAiStatus("Agent is thinking...");
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    const prompt = `
      You are the ChillBoyz Poker Agent. Players: ${PLAYERS.join(", ")}.
      Current Command: "${command}"
      Rule: If someone "won", "plus", or "is", set their score. If "rebuy", add 20.
      Output ONLY JSON: {"player": "Name", "action": "score"|"rebuy", "value": number}
    `;

    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await resp.json();
      const rawText = data.candidates[0].content.parts[0].text;
      const cleanJson = JSON.parse(rawText.replace(/```json|```/g, ""));

      if (cleanJson.action === 'rebuy') handleRebuy(cleanJson.player);
      if (cleanJson.action === 'score') handleScoreChange(cleanJson.player, cleanJson.value);
      setAiStatus(`Agent updated ${cleanJson.player}!`);
      setAiInput("");
    } catch (err) {
      setAiStatus("Agent confused. Try: 'Anji 40' or 'Srini rebuy'");
    }
  };

  // --- SETTLEMENT ---
  const handleSettle = () => {
    if (calculateBalance() !== 0) {
      alert(`Mismatch! Total is ${calculateBalance()}. Sum must be zero.`);
      return;
    }
    alert("Pushing to Google Sheets... Session Finalized!");
    // Reset after sync
    setScores(PLAYERS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
    setRebuys(PLAYERS.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-blue-900/40 p-8 rounded-3xl shadow-2xl">
          <h1 className="text-3xl font-black text-blue-500 text-center mb-1 italic">CHILLBOYZ</h1>
          <p className="text-center text-slate-500 text-xs font-bold mb-8 uppercase tracking-widest">Poker Score Manager</p>
          
          <div className="space-y-4">
            <input placeholder="User ID (e.g., KT)" className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700" onChange={e=>setLoginId(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700" onChange={e=>setPass(e.target.value)} />
            <button onClick={handleLogin} className="w-full bg-blue-600 p-4 rounded-xl font-black text-white hover:bg-blue-500 transition-all uppercase">Enter Table</button>
          </div>
          
          <div className="mt-8 p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-[10px] text-red-400 text-center leading-tight">
            LEGAL: This app is for point-scoring entertainment only. No real-money gambling facilitated.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-32">
      {/* Top Nav */}
      <div className="flex justify-between items-center p-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20 border-b border-blue-900/20">
        <div>
          <h2 className="text-lg font-black text-blue-500">CHILLBOYZ</h2>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Season 2026 • {user.id}</p>
        </div>
        <div className="flex gap-5 text-slate-400">
          <button onClick={()=>setView('dashboard')} className={view==='dashboard'?'text-blue-400':''}><Users size={22}/></button>
          <button onClick={()=>setView('standings')} className={view==='standings'?'text-blue-400':''}><BarChart3 size={22}/></button>
          {user.role === 'admin' && <button onClick={()=>setView('admin')} className={view==='admin'?'text-blue-400':''}><ShieldAlert size={22}/></button>}
          <button onClick={()=>setUser(null)} className="text-red-500/60"><LogOut size={22}/></button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-lg mx-auto">
        {view === 'dashboard' && (
          <div className="space-y-3">
            <div className="flex justify-between px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
              <span>Player</span>
              <div className="flex gap-14 mr-6"><span>Buy-In</span><span>Result</span></div>
            </div>
            
            {PLAYERS.map(p => (
              <div key={p} className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-sm">
                <span className="font-bold text-slate-300">{p}</span>
                <div className="flex items-center gap-4">
                  <button onClick={()=>handleRebuy(p)} className="bg-red-500/10 text-red-500 px-3 py-1 rounded-lg text-[10px] font-black border border-red-500/20 uppercase">
                    -${rebuys[p]}
                  </button>
                  <input 
                    type="number" 
                    value={scores[p] || ""}
                    onChange={e => handleScoreChange(p, e.target.value)}
                    className="w-20 bg-slate-800 p-2 rounded-xl text-right font-mono text-green-400 border border-slate-700 focus:ring-1 ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}

            <div className={`mt-8 p-6 rounded-3xl border-2 transition-all text-center ${calculateBalance() === 0 ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}>
              <span className="text-[10px] font-black uppercase tracking-widest block mb-1">Session Net Balance</span>
              <span className="text-5xl font-black">{calculateBalance()}</span>
            </div>

            {user.role === 'admin' && (
              <button onClick={handleSettle} className="w-full bg-blue-600 p-5 rounded-2xl font-black text-xl shadow-lg shadow-blue-900/20 mt-4 active:scale-95 transition-all uppercase">
                Final Settle & Sync
              </button>
            )}
          </div>
        )}

        {view === 'standings' && (
          <div className="bg-slate-900 p-6 rounded-3xl text-center">
            <h3 className="font-black text-blue-500 mb-4 uppercase tracking-widest">Season Leaderboard</h3>
            <p className="text-slate-500 text-sm italic">Pulling real-time stats from Google Sheets...</p>
          </div>
        )}

        {view === 'admin' && (
          <div className="space-y-4">
            <div className="bg-slate-900 p-6 rounded-3xl border border-blue-900/20">
              <h3 className="font-black mb-4 text-blue-400 uppercase tracking-widest">KT's Command Center</h3>
              <button className="w-full bg-slate-800 p-4 rounded-xl text-left mb-2 text-sm font-bold">Reset Season Standings</button>
              <button className="w-full bg-slate-800 p-4 rounded-xl text-left text-sm font-bold">WhatsApp Plain-Text Export</button>
            </div>
          </div>
        )}
      </div>

      {/* Agentic AI Bar */}
      <div className="fixed bottom-6 left-4 right-4 z-30">
        <div className="bg-slate-900 p-3 rounded-2xl shadow-2xl border border-blue-500/30 flex items-center gap-3">
          <div className="flex-1 px-2">
            <p className="text-[9px] text-blue-400 font-black uppercase tracking-tighter mb-1">{aiStatus}</p>
            <input 
              value={aiInput}
              onChange={e=>setAiInput(e.target.value)}
              onKeyDown={e=> e.key === 'Enter' && callAiAgent(aiInput)}
              placeholder="Ex: 'Anji won 50' or 'Kishore rebuy'" 
              className="w-full bg-transparent outline-none text-sm placeholder:text-slate-600"
            />
          </div>
          <button onClick={()=>callAiAgent(aiInput)} className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-90 transition-all">
            <Mic size={20} className="text-white"/>
          </button>
        </div>
      </div>
    </div>
  );
}
