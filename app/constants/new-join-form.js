export const NEW_FORM_STEPS = {
  headings: [
    'Upload Professional HeadShot and fill up personal details',
    'More personal details please',
  ],
  subheadings: [
    'Please provide accurate information for verification purposes.',
    'Introduce and help us get to know you better',
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
    skills: 5,
    company: 1,
    introduction: { min: 100, max: 500 },
  },
};
