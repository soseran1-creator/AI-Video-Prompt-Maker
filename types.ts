
export interface OptionItem {
  value: string;
  label: string;
}

export type CategoryKey = 
  | 'shotType'
  | 'cameraMovement'
  | 'framing'
  | 'action' // Kept for generic lookups, though used per-char now
  | 'charAge'
  | 'charNation'
  | 'charGender'
  | 'charOutfit'
  | 'environment'
  | 'lighting'
  | 'colorPalette'
  | 'style'
  | 'negatives';

export interface FormState {
  [key: string]: string;
}

export interface Character {
  id: string;
  age: string;
  nation: string;
  gender: string;
  outfit: string;
  action: string;
  // Storage for custom text inputs per field
  customAge?: string;
  customNation?: string;
  customGender?: string;
  customOutfit?: string;
  customAction?: string;
}

export type ModelType = 'common' | 'sora' | 'runway' | 'kling' | 'veo' | 'pika';

export interface ModelConfig {
  id: ModelType;
  name: string;
  description: string;
  badge?: string;
}
