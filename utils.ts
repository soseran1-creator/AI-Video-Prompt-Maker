
import { FormState, ModelType, Character } from './types';

// Helper to safely get value, fallback to empty string if not present
const getVal = (values: FormState, key: string) => values[key] || '';

// Helper to join multiple values if they exist
const join = (separator: string, ...args: string[]) => args.filter(Boolean).join(separator);

// Resolve the actual text value (handling 'custom' selection)
const resolveCharValue = (selection: string, customText?: string) => {
  return selection === 'custom' ? (customText || '') : selection;
};

// Build a single sentence for one character
// Format: "a [age] [nationality] [gender] wearing [outfit], [action]"
const buildSingleCharacterString = (c: Character): string => {
  const age = resolveCharValue(c.age, c.customAge);
  const nation = resolveCharValue(c.nation, c.customNation);
  const gender = resolveCharValue(c.gender, c.customGender);
  const outfit = resolveCharValue(c.outfit, c.customOutfit);
  const action = resolveCharValue(c.action, c.customAction);

  let parts = [];
  
  // "a [age] [nation] [gender]"
  if (age) parts.push(age);
  if (nation) parts.push(nation);
  if (gender) parts.push(gender);
  
  let baseDesc = parts.join(' ');
  
  if (!baseDesc) baseDesc = "A person";

  // "wearing [outfit]"
  if (outfit) {
    baseDesc += ` wearing ${outfit}`;
  }

  // ", [action]"
  if (action) {
    baseDesc += `, ${action}`;
  }

  return baseDesc;
};

// Helper to build the full character section string based on array length
const buildCharacterSection = (characters: Character[]): string => {
  if (!characters || characters.length === 0) return '';

  const charStrings = characters.map(buildSingleCharacterString);

  // Case 1: Single Character
  if (characters.length === 1) {
    return charStrings[0];
  }

  // Case 2: Two Characters
  if (characters.length === 2) {
    return `${charStrings[0]} and ${charStrings[1]}`;
  }

  // Case 3: Three or more Characters (List format)
  // "There are N characters: \n - A ... \n - A ..."
  const list = charStrings.map(s => `- ${s}`).join('\n');
  return `There are ${characters.length} characters in this scene:\n${list}`;
};

export const buildPrompt = (mode: ModelType, values: FormState, characters: Character[]): string => {
  const v = (key: string) => getVal(values, key);

  // Combine Lighting & Color for some templates
  const lightingColor = join(', ', v('lighting'), v('colorPalette'));
  
  // Build Character Description (The new multi-char logic)
  const characterDesc = buildCharacterSection(characters);

  // Scene Context (User typed context + Characters)
  // If user provided a custom scene context, we prioritize that but still mention characters if implied
  const userSceneContext = v('customScene');
  
  // Helper to merge Context + Characters
  const fullScene = join('\n', characterDesc, userSceneContext); 
  const briefScene = join(' ', characterDesc, userSceneContext);

  switch (mode) {
    case 'sora':
      // Sora: Narrative, Sentence flow
      return `A ${v('duration') || '5'}-second cinematic video showing the following:\n${fullScene}.
Camera uses a ${v('shotType') || 'shot'} with ${v('cameraMovement') || 'movement'}.
The environment includes ${v('environment') || 'background'}, expressed with ${lightingColor}.
The tone is ${v('mood') || 'neutral'}, and the style follows ${v('style')}.
Avoid ${v('negatives')}.`;

    case 'runway':
      // Runway: Structured Headers
      return `[Scene]
${briefScene}

[Camera]
- shot: ${v('shotType')}
- movement: ${v('cameraMovement')}

[Action]
(See character details above)

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
${userSceneContext || 'A cinematic scene.'}

Camera:
${join(', ', v('shotType'), v('framing'), v('cameraMovement'))}

Characters:
${characterDesc}

Environment:
${v('environment')}

Style:
${v('style')}

Constraints:
${v('negatives')}`;

    case 'veo':
      // Veo: Cinematic focus
      return `A ${v('duration') || '5'}-second cinematic shot.
${fullScene}
Camera: ${v('shotType')} with ${v('cameraMovement')}.
Lighting: ${v('lighting')}
Color tone: ${v('colorPalette')}
Environment: ${v('environment')}
Style: ${v('style')}
Avoid: ${v('negatives')}`;

    case 'pika':
      // Pika: Short & Technical
      return `Scene: ${briefScene}
Camera: ${join(', ', v('shotType'), v('cameraMovement'))}
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

Characters & Action:
${characterDesc}

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
