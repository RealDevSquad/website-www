export const NEW_FORM_STEPS = {
  headings: [
    'Upload Professional Headshot and Complete Personal Details',
    'Additional Personal Information',
    'Your hobbies, interests, fun fact',
    'Connect your social profiles',
    'Why Real Dev Squad?',
    'Review and Submit',
  ],
  subheadings: [
    'Please provide accurate information for verification purposes.',
    'Introduce and help us get to know you better',
    'Show us your funny and interesting side',
    'Share your social media and professional profiles',
    'Tell us why you want to join our community',
    'Review your answers before submitting.',
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

export const USER_ROLE_MAP = {
  Developer: 'developer',
  Designer: 'designer',
  'Product Manager': 'product_manager',
  'Project Manager': 'project_manager',
  QA: 'qa',
  'Social Media': 'social_media',
};

export const NEW_STEP_LIMITS = {
  stepOne: {
    country: { min: 1, type: 'dropdown' },
    state: { min: 1 },
    city: { min: 1 },
    role: { min: 1, type: 'select' },
  },
  stepTwo: {
    skills: { min: 5, max: 20 },
    college: { min: 1 },
    introduction: { min: 100, max: 500 },
  },
  stepThree: {
    forFun: { min: 100, max: 500 },
    funFact: { min: 100, max: 500 },
  },
  stepFour: {
    phoneNo: { min: 1 },
    twitter: { min: 1 },
    github: { min: 1 },
    linkedin: { min: 1 },
    instagram: { min: 0 },
    peerlist: { min: 1 },
    behance: { min: 1 },
    dribble: { min: 1 },
  },
  stepFive: {
    whyRds: { min: 100 },
    foundFrom: { min: 1 },
  },
};

export const STEP_DATA_STORAGE_KEY = {
  stepOne: 'newStepOneData',
  stepTwo: 'newStepTwoData',
  stepThree: 'newStepThreeData',
  stepFour: 'newStepFourData',
  stepFive: 'newStepFiveData',
};
