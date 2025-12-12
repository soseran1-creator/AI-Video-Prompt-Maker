
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
  Baby,
  Plus,
  Trash2,
  Users
} from 'lucide-react';

import { MODELS, OPTIONS, DEFAULTS } from './constants';
import { FormState, ModelType, CategoryKey, Character } from './types';
import { buildPrompt } from './utils';
import { PromptPreview } from './components/PromptPreview';

type SelectionCategory = 'common' | 'specific';

const App: React.FC = () => {
  const [modelCategory, setModelCategory] = useState<SelectionCategory>('common');
  const [mode, setMode] = useState<ModelType>('common');
  
  // General form values
  const [formValues, setFormValues] = useState<FormState>({
    duration: DEFAULTS.duration,
    fps: DEFAULTS.fps,
    ratio: DEFAULTS.ratio,
  });

  // General custom inputs
  const [customInputs, setCustomInputs] = useState<FormState>({});

  // Multi-character state
  const [characters, setCharacters] = useState<Character[]>([
    { id: '1', age: '', nation: '', gender: '', outfit: '', action: '' }
  ]);

  // --- General Form Handlers ---

  const handleSelectChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
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
      if (mode === 'common') {
        setMode('sora');
      }
    }
  };

  // --- Character Logic ---

  const addCharacter = () => {
    setCharacters(prev => [
      ...prev,
      { 
        id: Date.now().toString(), 
        age: '', 
        nation: '', 
        gender: '', 
        outfit: '', 
        action: '' 
      }
    ]);
  };

  const removeCharacter = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  const updateCharacter = (id: string, field: keyof Character, value: string) => {
    setCharacters(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, [field]: value };
    }));
  };

  // --- Prompt Assembly ---

  const finalValues = useMemo(() => {
    const combined: FormState = { ...formValues };
    Object.keys(combined).forEach((key) => {
      if (combined[key] === 'custom') {
        combined[key] = customInputs[key] || '';
      }
    });
    return combined;
  }, [formValues, customInputs]);

  const generatedPrompt = useMemo(() => buildPrompt(mode, finalValues, characters), [mode, finalValues, characters]);

  // --- UI Render Helpers ---

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
            placeholder="영문 입력 (e.g., cinematic shot)..."
            className="w-full p-2 text-sm border-2 border-indigo-100 rounded-md focus:border-indigo-500 focus:outline-none bg-indigo-50/30"
            autoFocus
          />
        )}
      </div>
    );
  };

  // Helper for rendering inputs inside the Character Card
  const renderCharSelect = (
    charId: string,
    field: keyof Character, 
    optionsKey: CategoryKey, 
    label: string, 
    icon: React.ReactNode,
    placeholder: string = "선택"
  ) => {
    const char = characters.find(c => c.id === charId);
    if (!char) return null;

    const value = char[field] as string;
    const options = OPTIONS[optionsKey];
    const isCustom = value === 'custom';
    
    // Determine which custom field key to use (e.g., customAge, customAction)
    const customFieldKey = `custom${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof Character;
    const customValue = (char[customFieldKey] as string) || '';

    return (
      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
          {icon} {label}
        </label>
        <select
          value={value}
          onChange={(e) => updateCharacter(charId, field, e.target.value)}
          className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-md focus:ring-emerald-500 focus:border-emerald-500 block p-2 mb-1"
        >
          <option value="">- {placeholder} -</option>
          {options?.map((opt, idx) => (
            <option key={idx} value={opt.value}>{opt.label}</option>
          ))}
          <option value="custom" className="font-bold text-emerald-600">✨ 직접 입력</option>
        </select>
        {isCustom && (
          <input
            type="text"
            value={customValue}
            onChange={(e) => updateCharacter(charId, customFieldKey, e.target.value)}
            placeholder="영문 묘사..."
            className="w-full p-1.5 text-xs border border-emerald-200 rounded focus:border-emerald-500 focus:outline-none bg-emerald-50/30"
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
             <span>v1.2.0</span>
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

          {/* Specific Model Options */}
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

            {/* 2. Character Detail Builder (Multi-Character) */}
            <section>
              <div className="flex items-center justify-between mb-3 border-l-4 border-emerald-500 pl-3">
                <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold">Characters & Actions</h3>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                  {characters.length} Person{characters.length !== 1 && 's'}
                </span>
              </div>
              
              <div className="space-y-4">
                {characters.map((char, index) => (
                  <div key={char.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group transition-all hover:border-emerald-300 hover:shadow-sm">
                    {/* Header for card */}
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                       <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                         <User size={12} /> Character #{index + 1}
                       </span>
                       {characters.length > 1 && (
                         <button 
                           onClick={() => removeCharacter(char.id)}
                           className="text-slate-400 hover:text-red-500 transition-colors p-1"
                           title="Remove Character"
                         >
                           <Trash2 size={14} />
                         </button>
                       )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {renderCharSelect(char.id, 'age', 'charAge', '나이/직업', <Baby size={12} />)}
                      {renderCharSelect(char.id, 'nation', 'charNation', '국적/인종', <Globe size={12} />)}
                      {renderCharSelect(char.id, 'gender', 'charGender', '성별', <User size={12} />)}
                      {renderCharSelect(char.id, 'outfit', 'charOutfit', '복장', <Shirt size={12} />)}
                    </div>

                    {/* Action - Moved inside Character Card */}
                    <div className="mt-3 pt-3 border-t border-slate-100">
                       {renderCharSelect(char.id, 'action', 'action', 'Action (행동)', <Clapperboard size={12} />)}
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addCharacter}
                  className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                >
                  <Plus size={16} />
                  캐릭터 추가 (Add Character)
                </button>
              </div>

              {/* Optional Scene Description for context */}
              <div className="mt-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                 <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Type size={16} className="text-indigo-600"/> Scene Context / Interaction (Optional)
                 </label>
                 <textarea
                    rows={2}
                    placeholder="전반적인 상황 묘사 또는 캐릭터 간의 관계 (ex: They are studying together in the library...)"
                    value={formValues['customScene'] || ''}
                    onChange={(e) => handleSelectChange('customScene', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                 />
                 <p className="text-xs text-slate-400 mt-1">If empty, only character descriptions will be used.</p>
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
