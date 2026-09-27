import React from 'react';
import { Info, X, Bot, Activity, BrainCircuit } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wider">ABOUT OMNIFORGE</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 text-slate-300 font-sans">
          <section className="space-y-2">
            <p className="text-sm leading-relaxed">
              <strong className="text-white">OmniForge</strong> is an Autonomous Multi-Agent Playtesting Swarm. It is designed to automatically test and evaluate game levels by simulating different player personas. 
              Instead of human QA testers playing a game repeatedly, OmniForge sends AI agents into the game engine to play, explore, and report back on their experience.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Bot className="w-4 h-4 text-cyan-500" />
              THE AI PERSONAS
            </h3>
            <div className="grid gap-3 text-sm">
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 border-l-4 border-l-cyan-500">
                <strong className="text-cyan-400">Casual Player:</strong> Plays cautiously, heals often, avoids risky combat. Gets easily frustrated if stuck.
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 border-l-4 border-l-purple-500">
                <strong className="text-purple-400">Speedrunner:</strong> Ignores lore and side-rooms. Rushes straight to the exit. Takes high risks to minimize time.
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 border-l-4 border-l-emerald-500">
                <strong className="text-emerald-400">Explorer:</strong> High patience, interacts with everything, wants to see every corner of the map.
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Activity className="w-4 h-4 text-amber-500" />
              KEY METRICS
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong className="text-amber-400">Frustration:</strong> A real-time metric (0-100%) tracking how annoyed an agent is. Increases on damage or failed actions; decreases on healing or progress.</li>
              <li><strong className="text-amber-400">Game Health Score:</strong> An overall score of the game level based on agent frustration, anomalies, and failures. Higher is better.</li>
              <li><strong className="text-amber-400">Anomalies:</strong> Unexpected behaviors or edge cases encountered by the AI (e.g., getting stuck, loop behaviors).</li>
            </ul>
          </section>
          
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <BrainCircuit className="w-4 h-4 text-pink-500" />
              THE DIRECTOR
            </h3>
            <p className="text-sm leading-relaxed">
              After all three agents finish playing, the <strong>Director AI</strong> analyzes their telemetry and generates an executive report and a <em>Balance Patch</em> with recommendations to improve the game's design.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
