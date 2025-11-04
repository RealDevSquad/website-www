export const NEW_FORM_STEPS = {
  headings: [
    'Upload Professional HeadShot and fill up personal details',
    'More personal details please',
    'Your hobbies, interests, fun fact',
  ],
  subheadings: [
    'Please provide accurate information for verification purposes.',
    'Introduce and help us get to know you better',
    'Show us your funny and interesting side',
  ],
};

export const ROLE_OPTIONS = [
  'Developer',
  'Designer',
  'Product Manager',
  'Project Manager',
  'QA',
];

export const NEW_STEP_LIMITS = {
  stepOne: {
    country: { min: 1 },
    state: { min: 1 },
    city: { min: 1 },
    role: { min: 1 },
  },
  stepTwo: {
    skills: { min: 5, max: 20 },
    company: { min: 1 },
    introduction: { min: 100, max: 500 },
  },
  stepThree: {
    hobbies: { min: 100, max: 500 },
    funFact: { min: 100, max: 500 },
  },
};
