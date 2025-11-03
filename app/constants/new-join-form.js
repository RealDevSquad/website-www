export const NEW_FORM_STEPS = {
  headings: [
    'Upload Professional Headshot and Complete Personal Details',
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
  'Social Media',
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

export const STEP_DATA_STORAGE_KEY = {
  stepOne: 'newStepOneData',
};
