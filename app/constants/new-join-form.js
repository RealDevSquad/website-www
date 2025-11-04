export const NEW_FORM_STEPS = {
  headings: [
    'Upload Professional Headshot and Complete Personal Details',
    'Additional Personal Information',
    'Your hobbies, interests, fun fact',
    'Connect your social profiles',
  ],
  subheadings: [
    'Please provide accurate information for verification purposes.',
    'Introduce and help us get to know you better',
    'Show us your funny and interesting side',
    'Share your social media and professional profiles',
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
    skills: { min: 5, max: 20 },
    company: { min: 1 },
    introduction: { min: 100, max: 500 },
  },
  stepThree: {
    hobbies: { min: 100, max: 500 },
    funFact: { min: 100, max: 500 },
  },
  stepFour: {
    phoneNumber: { min: 1 },
    twitter: { min: 1 },
    github: { min: 1 },
    linkedin: { min: 1 },
    instagram: {},
    peerlist: { min: 1 },
    behance: { min: 1 },
    dribble: { min: 1 },
  },
};

export const STEP_DATA_STORAGE_KEY = {
  stepOne: 'newStepOneData',
  stepTwo: 'newStepTwoData',
  stepThree: 'newStepThreeData',
};
