import { FormState, ModelType } from './types';

// Helper to safely get value, fallback to empty string if not present
const getVal = (values: FormState, key: string) => values[key] || '';

// Helper to join multiple values if they exist
const join = (separator: string, ...args: string[]) => args.filter(Boolean).join(separator);

// Helper to build the character string based on specific logic
const buildCharacterDescription = (values: FormState): string => {
  const age = getVal(values, 'charAge');
  const nation = getVal(values, 'charNation');
  const gender = getVal(values, 'charGender');
  const outfit = getVal(values, 'charOutfit');

  // Basic structure: "a [age] [nationality] [gender] wearing [outfit]"
  // Example: "a lower grade elementary school student Korean female wearing a school uniform"
  
  // Start with age (which usually includes "a" or "an")
  let parts = [];
  
  if (age) parts.push(age);
  if (nation) parts.push(nation);
  if (gender) parts.push(gender);
  
  let baseDesc = parts.join(' ');
  
  // Append outfit if exists
  if (outfit) {
    // If baseDesc is empty (unlikely if user selects something), just say "Someone wearing..."
    // But assuming age is key. If age missing, handle gracefully.
    if (!baseDesc) baseDesc = "A person";
    baseDesc += ` wearing ${outfit}`;
  }

  return baseDesc;
};

export const buildPrompt = (mode: ModelType, values: FormState): string => {
  const v = (key: string) => getVal(values, key);

  // Combine Lighting & Color for some templates
  const lightingColor = join(', ', v('lighting'), v('colorPalette'));
  
  // Build Character Description
  const characterDesc = buildCharacterDescription(values);

  // Combine Character & Action for Scene description if needed
  const sceneDesc = join(', ', characterDesc, v('action'));
  const fullScene = join(' ', characterDesc, v('action')); // more natural spacing

  switch (mode) {
    case 'sora':
      // Sora: Narrative, Sentence flow
      return `A ${v('duration') || '5'}-second cinematic video showing ${fullScene || 'a scene'}.
Camera uses a ${v('shotType') || 'shot'} with ${v('cameraMovement') || 'movement'}.
The main action: ${v('action') || 'the character acts'}.
The environment includes ${v('environment') || 'background'}, expressed with ${lightingColor}.
The tone is ${v('mood') || 'neutral'}, and the style follows ${v('style')}.
Avoid ${v('negatives')}.`;

    case 'runway':
      // Runway: Structured Headers
      return `[Scene]
${v('customScene') || fullScene}

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
${v('customScene') || fullScene}

Camera:
${join(', ', v('shotType'), v('framing'), v('cameraMovement'))}

Characters:
${characterDesc}
(Action: ${v('action')})

Environment:
${v('environment')}

Style:
${v('style')}

Constraints:
${v('negatives')}`;

    case 'veo':
      // Veo: Cinematic focus
      return `A ${v('duration') || '5'}-second cinematic shot of ${fullScene}.
Camera: ${v('shotType')} with ${v('cameraMovement')}.
Lighting: ${v('lighting')}
Color tone: ${v('colorPalette')}
Action: ${v('action')}
Environment: ${v('environment')}
Style: ${v('style')}
Avoid: ${v('negatives')}`;

    case 'pika':
      // Pika: Short & Technical
      return `Scene: ${fullScene}
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
Character: ${characterDesc}

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
