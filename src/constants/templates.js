export const TEMPLATES = [
  {
    id: 'drake',
    name: 'Drake Approves',
    layout: 'split-vertical',
    photoPlacement: 'background',
    textZones: [
      { id: 'top', label: 'Rejection', defaultText: 'Nah...' },
      { id: 'bottom', label: 'Approval', defaultText: 'Now we\'re talking' },
    ],
    overlayStyle: 'classic',
  },
  {
    id: 'distracted-boyfriend',
    name: 'Distracted Boyfriend',
    layout: 'single',
    photoPlacement: 'background',
    textZones: [
      { id: 'top', label: 'Distraction', defaultText: 'New shiny thing' },
      { id: 'bottom', label: 'Reality', defaultText: 'What I should be doing' },
    ],
    overlayStyle: 'classic',
  },
  {
    id: 'this-is-fine',
    name: 'This Is Fine',
    layout: 'single',
    photoPlacement: 'background',
    textZones: [
      { id: 'top', label: 'Situation', defaultText: 'Everything is on fire' },
      { id: 'bottom', label: 'Reaction', defaultText: 'This is fine.' },
    ],
    overlayStyle: 'minimal',
  },
  {
    id: 'woman-yelling-at-cat',
    name: 'Woman Yelling at Cat',
    layout: 'split-horizontal',
    photoPlacement: 'zone',
    textZones: [
      { id: 'top', label: 'Accusation', defaultText: 'You said you\'d...' },
      { id: 'bottom', label: 'Defense', defaultText: 'I literally did not' },
    ],
    overlayStyle: 'classic',
  },
  {
    id: 'two-buttons',
    name: 'Two Buttons',
    layout: 'single',
    photoPlacement: 'background',
    textZones: [
      { id: 'top', label: 'Option A', defaultText: 'Do the thing' },
      { id: 'bottom', label: 'Option B', defaultText: 'Also do the thing' },
    ],
    overlayStyle: 'editorial',
  },
  {
    id: 'expanding-brain',
    name: 'Expanding Brain',
    layout: 'stacked',
    photoPlacement: 'background',
    textZones: [
      { id: 'top', label: 'Small brain', defaultText: 'Normal approach' },
      { id: 'bottom', label: 'Galaxy brain', defaultText: 'Ascended take' },
    ],
    overlayStyle: 'editorial',
  },
]

export function getTemplateById(id) {
  return TEMPLATES.find((t) => t.id === id) || null
}
