import { FormState, ModelType } from './types';

// Helper to safely get value, fallback to empty string if not present
const getVal = (values: FormState, key: string) => values[key] || '';

// Helper to join multiple values if they exist
const join = (separator: string, ...args: string[]) => args.filter(Boolean).join(separator);

export const buildPrompt = (mode: ModelType, values: FormState): string => {
  const v = (key: string) => getVal(values, key);

  // Combine Lighting & Color for some templates
  const lightingColor = join(', ', v('lighting'), v('colorPalette'));
  
  // Combine Character & Action for Scene description if needed
  const sceneDesc = join(' ', v('characters'), v('action'));

  switch (mode) {
    case 'sora':
      // Sora: Narrative, Sentence flow
      return `A ${v('duration') || '5'}-second cinematic video showing ${sceneDesc || 'a scene'}.
Camera uses a ${v('shotType') || 'shot'} with ${v('cameraMovement') || 'movement'}.
The main action: ${v('action') || 'the character acts'}.
The environment includes ${v('environment') || 'background'}, expressed with ${lightingColor}.
The tone is ${v('mood') || 'neutral'}, and the style follows ${v('style')}.
Avoid ${v('negatives')}.`;

    case 'runway':
      // Runway: Structured Headers
      return `[Scene]
${v('customScene') || sceneDesc}

[Camera]
- shot: ${v('shotType')}
- movement: ${v('cameraMovement')}

[Action]
${v('action')}

[Background]
${v('environment')}

[Style]
${v('style')}

[Lighting]
${v('lighting')}

[Avoid]
${v('negatives')}`;

    case 'kling':
      // Kling: List based, specific constraints
      return `Video: ${v('duration') || '5'} seconds.

Main Scene:
${v('customScene') || sceneDesc}

Camera:
${join(', ', v('shotType'), v('framing'), v('cameraMovement'))}

Characters:
${join(', ', v('characters'), v('action'))}

Environment:
${v('environment')}

Style:
${v('style')}

Constraints:
${v('negatives')}`;

    case 'veo':
      // Veo: Cinematic focus
      return `A ${v('duration') || '5'}-second cinematic shot of ${sceneDesc}.
Camera: ${v('shotType')} with ${v('cameraMovement')}.
Lighting: ${v('lighting')}
Color tone: ${v('colorPalette')}
Action: ${v('action')}
Environment: ${v('environment')}
Style: ${v('style')}
Avoid: ${v('negatives')}`;

    case 'pika':
      // Pika: Short & Technical
      return `Scene: ${sceneDesc}
Camera: ${join(', ', v('shotType'), v('cameraMovement'))}
Action: ${v('action')}
Lighting: ${v('lighting')}
Style: ${v('style')}
Avoid: ${v('negatives')}`;

    case 'common':
    default:
      // Common / Universal Template
      return `Camera:
Shot type: ${v('shotType')}
Movement: ${v('cameraMovement')}
Framing: ${v('framing')}

Action:
${v('action')}
${v('characters') ? `(Characters: ${v('characters')})` : ''}

Background / Environment:
${v('environment')}

Mood & Atmosphere:
${v('mood')}

Style & Visual Tone:
${v('style')}

Lighting & Color:
${lightingColor}

Technical Preferences:
fps: ${v('fps') || '24'}
aspect ratio: ${v('ratio') || '16:9'}

Avoid:
${v('negatives')}`;
  }
};