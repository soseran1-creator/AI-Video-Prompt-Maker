import React, { useState, useMemo } from 'react';
import { 
  Video, 
  Settings2, 
  Clapperboard, 
  Palette, 
  Ghost, 
  Camera, 
  Sun,
  Maximize,
  Type,
  User,
  AlertOctagon,
  Sparkles,
  Layout,
  MousePointerClick,
  Shirt,
  Globe,
  Baby
} from 'lucide-react';

import { MODELS, OPTIONS, DEFAULTS } from './constants';
import { FormState, ModelType, CategoryKey } from './types';
import { buildPrompt } from './utils';
import { PromptPreview } from './components/PromptPreview';

type SelectionCategory = 'common' | 'specific';

const App: React.FC = () => {
  const [modelCategory, setModelCategory] = useState<SelectionCategory>('common');
  const [mode, setMode] = useState<ModelType>('common');
  
  // Stores the *English* values (or 'custom')
  const [formValues, setFormValues] = useState<FormState>({
    duration: DEFAULTS.duration,
    fps: DEFAULTS.fps,
    ratio: DEFAULTS.ratio,
  });

  // Stores the raw text typed into "Other" fields
  const [customInputs, setCustomInputs] = useState<FormState>({});

  const handleSelectChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    // If switching away from custom, clear the custom input for cleanliness (optional)
    if (value !== 'custom') {
      setCustomInputs((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleCustomInputChange = (key: string, text: string) => {
    setCustomInputs((prev) => ({ ...prev, [key]: text }));
  };

  const handleCategoryChange = (cat: SelectionCategory) => {
    setModelCategory(cat);
    if (cat === 'common') {
      setMode('common');
    } else {
      // Default to Sora if switching to Specific and currently on Common
      if (mode === 'common') {
        setMode('sora');
      }
    }
  };

  // Combine standard values and custom inputs for the prompt builder
  const finalValues = useMemo(() => {
    const combined: FormState = { ...formValues };
    Object.keys(combined).forEach((key) => {
      if (combined[key] === 'custom') {
        combined[key] = customInputs[key] || '';
      }
    });
    return combined;
  }, [formValues, customInputs]);

  const generatedPrompt = useMemo(() => buildPrompt(mode, finalValues), [mode, finalValues]);

  // UI Helpers for Model Selection
  const specificModels = MODELS.filter(m => m.id !== 'common');
  const currentModelInfo = MODELS.find(m => m.id === mode);

  const renderSelect = (
    label: string, 
    fieldKey: CategoryKey, 
    icon: React.ReactNode, 
    placeholder: string = "선택하세요",
    compact: boolean = false
  ) => {
    const options = OPTIONS[fieldKey];
    const currentValue = formValues[fieldKey] || '';
    const isCustom = currentValue === 'custom';

    return (
      <div className={`bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${compact ? 'p-3' : 'p-4'}`}>
        <label className={`block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2 ${compact ? 'text-xs' : ''}`}>
          <span className="text-indigo-600">{icon}</span>
          {label}
        </label>
        
        <select
          value={currentValue}
          onChange={(e) => handleSelectChange(fieldKey, e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 mb-2"
        >
          <option value="">-- {placeholder} --</option>
          {options?.map((opt, idx) => (
            <option key={idx} value={opt.value}>
              {opt.label}
            </option>
          ))}
          <option value="custom" className="font-semibold text-indigo-700">✨ 직접 입력</option>
        </select>

        {isCustom && (
          <input
            type="text"
            value={customInputs[fieldKey] || ''}
            onChange={(e) => handleCustomInputChange(fieldKey, e.target.value)}
            placeholder="영문으로 입력하세요 (예: a tall person)..."
            className="w-full p-2 text-sm border-2 border-indigo-100 rounded-md focus:border-indigo-500 focus:outline-none bg-indigo-50/30"
            autoFocus
          />
        )}
      </div>
    );
  };

  const renderTextInput = (label: string, fieldKey: string, placeholder: string) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input
        type="text"
        value={formValues[fieldKey] || ''}
        onChange={(e) => handleSelectChange(fieldKey, e.target.value)}
        className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
              <Video size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600">
                AI Video Prompt Builder
              </h1>
              <p className="text-xs text-slate-500">Professional Shot Generation System</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-slate-400 font-medium">
             <span>v1.1.0</span>
             <span>Powered by React</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Model Selection Area */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Settings2 className="text-slate-500" size={20} />
            AI 모델 선택
          </h2>
          
          {/* Main Category Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => handleCategoryChange('common')}
              className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 group ${
                modelCategory === 'common'
                  ? 'bg-white border-indigo-600 shadow-lg ring-1 ring-indigo-600/20'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${modelCategory === 'common' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                <Layout size={24} />
              </div>
              <div className="text-left">
                <div className={`font-bold text-lg ${modelCategory === 'common' ? 'text-indigo-700' : 'text-slate-700'}`}>공통 모드 (Common)</div>
                <div className="text-xs text-slate-500">모든 모델에 안정적인 범용 구조</div>
              </div>
            </button>

            <button
              onClick={() => handleCategoryChange('specific')}
              className={`flex items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 group ${
                modelCategory === 'specific'
                  ? 'bg-white border-indigo-600 shadow-lg ring-1 ring-indigo-600/20'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${modelCategory === 'specific' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                <MousePointerClick size={24} />
              </div>
              <div className="text-left">
                <div className={`font-bold text-lg ${modelCategory === 'specific' ? 'text-indigo-700' : 'text-slate-700'}`}>모델 전용 (Specific)</div>
                <div className="text-xs text-slate-500">Sora, Runway, Kling 등 전용 최적화</div>
              </div>
            </button>
          </div>

          {/* Specific Model Options (Visible only when in Specific category) */}
          {modelCategory === 'specific' && (
            <div className="bg-slate-100/50 p-4 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-wrap gap-2 justify-center mb-3">
                {specificModels.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                      mode === m.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
              <div className="text-center">
                 <p className="text-sm text-slate-600">
                   <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                   {currentModelInfo?.description}
                 </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Camera & Framing */}
            <section>
              <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-3 border-l-4 border-indigo-500 pl-3">Camera & Composition</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect('Shot Type (샷 종류)', 'shotType', <Camera size={16} />)}
                {renderSelect('Movement (카메라 움직임)', 'cameraMovement', <Video size={16} />)}
                {renderSelect('Framing (구도)', 'framing', <Maximize size={16} />)}
              </div>
            </section>

            {/* 2. Character Detail Builder */}
            <section>
              <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-3 border-l-4 border-emerald-500 pl-3">Character Details</h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                   {renderSelect('나이/직업 (Age)', 'charAge', <Baby size={16} />, '선택', true)}
                   {renderSelect('국적/인종 (Nation)', 'charNation', <Globe size={16} />, '선택', true)}
                   {renderSelect('성별 (Gender)', 'charGender', <User size={16} />, '선택', true)}
                   {renderSelect('복장 (Outfit)', 'charOutfit', <Shirt size={16} />, '선택', true)}
                </div>
                <p className="text-xs text-slate-400 text-center">
                   * 자동으로 "a [age] [nation] [gender] wearing [outfit]" 문장이 생성됩니다.
                </p>
              </div>
              
              <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-3 border-l-4 border-emerald-500 pl-3">Action & Context</h3>
              <div className="grid grid-cols-1 gap-4">
                 {renderSelect('Action (행동)', 'action', <Clapperboard size={16} />)}
              </div>
              
              {/* Optional Scene Description for context */}
              <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                 <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Type size={16} className="text-indigo-600"/> Scene Context (Optional)
                 </label>
                 <textarea
                    rows={2}
                    placeholder="전반적인 상황 묘사 (ex: A busy street in Seoul during rain...)"
                    value={formValues['customScene'] || ''}
                    onChange={(e) => handleSelectChange('customScene', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                 />
                 <p className="text-xs text-slate-400 mt-1">Some models use this as the main prompt header.</p>
              </div>
            </section>

            {/* 3. Atmosphere */}
            <section>
              <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-3 border-l-4 border-amber-500 pl-3">Atmosphere & Style</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect('Environment (배경)', 'environment', <Sparkles size={16} />)}
                {renderSelect('Lighting (조명)', 'lighting', <Sun size={16} />)}
                {renderSelect('Color Palette (색감)', 'colorPalette', <Palette size={16} />)}
                {renderSelect('Visual Style (스타일)', 'style', <Ghost size={16} />)}
              </div>
              <div className="mt-4">
                 {renderTextInput('Mood (분위기) - 직접 입력 (옵션)', 'mood', 'e.g. Melancholic, Energetic, Mysterious...')}
              </div>
            </section>

            {/* 4. Technical & Negatives */}
            <section>
              <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-3 border-l-4 border-slate-500 pl-3">Technical & Constraints</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {renderTextInput('Duration (Seconds)', 'duration', '5')}
                  {renderTextInput('FPS', 'fps', '24')}
              </div>
              <div className="grid grid-cols-1">
                {renderSelect('Negatives (금지 항목)', 'negatives', <AlertOctagon size={16} />)}
              </div>
            </section>

          </div>

          {/* Preview Section - Sticky */}
          <div className="lg:col-span-5">
            <PromptPreview 
                prompt={generatedPrompt} 
                modeName={currentModelInfo?.name || 'Unknown'} 
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;