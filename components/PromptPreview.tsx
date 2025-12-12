import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface PromptPreviewProps {
  prompt: string;
  modeName: string;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({ prompt, modeName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sticky top-6 flex flex-col gap-4">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full">
        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-100">
            <Terminal size={18} />
            <span className="font-semibold text-sm tracking-wide">GENERATED PROMPT ({modeName})</span>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              copied 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            {copied ? (
              <>
                <Check size={14} /> Copied!
              </>
            ) : (
              <>
                <Copy size={14} /> Copy Prompt
              </>
            )}
          </button>
        </div>
        
        <div className="p-0 flex-grow relative bg-slate-50">
          <textarea
            readOnly
            value={prompt}
            className="w-full h-96 p-4 bg-slate-50 text-slate-700 font-mono text-sm resize-none focus:outline-none leading-relaxed"
            spellCheck={false}
          />
        </div>
        
        <div className="bg-slate-100 px-4 py-2 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>{prompt.length} characters</span>
          <span>Ready for AI generation</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">💡 Tip for {modeName}:</p>
        <p className="opacity-90">
          {modeName === 'Sora' && 'Ensure the sentence flows naturally. Sora loves detail.'}
          {modeName === 'Runway Gen-3' && 'Keep sections clear. Runway follows structure best.'}
          {modeName === 'Kling AI' && 'Kling is strict with object placement. Be specific.'}
          {modeName === 'Veo' && 'Focus on cinematic terms and lighting details.'}
          {modeName === 'Pika' && 'Keep it short and punchy. Less is more.'}
          {modeName.includes('Common') && 'This structure works reasonably well across all models.'}
        </p>
      </div>
    </div>
  );
};