'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface JsonTreeProps {
  data: any;
  title?: string;
  defaultOpen?: boolean;
}

export const JsonTree: React.FC<JsonTreeProps> = ({ data, title = 'JSON', defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const renderValue = (val: any, depth = 0): React.ReactNode => {
    if (val === null) return <span className="text-slate-500">null</span>;
    if (typeof val === 'boolean') return <span className="text-purple-400">{val ? 'true' : 'false'}</span>;
    if (typeof val === 'number') return <span className="text-amber-400">{val}</span>;
    if (typeof val === 'string') return <span className="text-emerald-300">"{val}"</span>;

    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-slate-500">[]</span>;
      return (
        <div className="pl-4 border-l border-slate-800 space-y-1">
          {val.map((item, idx) => (
            <div key={idx} className="flex items-start gap-1">
              <span className="text-slate-600 select-none">-</span>
              {renderValue(item, depth + 1)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof val === 'object') {
      const keys = Object.keys(val);
      if (keys.length === 0) return <span className="text-slate-500">{'{}'}</span>;
      return (
        <div className="pl-4 border-l border-slate-800 space-y-1">
          {keys.map((k) => (
            <div key={k} className="flex flex-col">
              <span className="text-cyan-400 font-semibold">{k}:</span>
              <div className="pl-2">{renderValue(val[k], depth + 1)}</div>
            </div>
          ))}
        </div>
      );
    }

    return <span>{String(val)}</span>;
  };

  return (
    <div className="font-mono text-xs rounded-lg border border-slate-800 bg-slate-950 p-3">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-cyan-400 mb-2 font-bold uppercase tracking-wider"
      >
        {isOpen ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        <span>{title}</span>
      </div>
      {isOpen && <div className="mt-1 overflow-x-auto">{renderValue(data)}</div>}
    </div>
  );
};
