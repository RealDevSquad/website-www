export const NEW_FORM_STEPS = {
  headings: ['Upload Professional Headshot and Complete Personal Details'],
  subheadings: [
    'Please provide accurate information for verification purposes.',
  ],
};

export const ROLE_OPTIONS = [
  'Developer',
  'Designer',
  'Product Manager',
  'Project Manager',
  'QA',
  'Social Media',
];

export const NEW_STEP_LIMITS = {
  stepOne: {
    country: { min: 1 },
    state: { min: 1 },
    city: { min: 1 },
    role: { min: 1 },
  },
};

export const STEP_DATA_STORAGE_KEY = {
  stepOne: 'newStepOneData',
};
