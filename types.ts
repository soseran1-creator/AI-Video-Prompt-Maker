export interface OptionItem {
  value: string;
  label: string;
}

export type CategoryKey = 
  | 'shotType'
  | 'cameraMovement'
  | 'framing'
  | 'action'
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

export type ModelType = 'common' | 'sora' | 'runway' | 'kling' | 'veo' | 'pika';

export interface ModelConfig {
  id: ModelType;
  name: string;
  description: string;
  badge?: string;
}
