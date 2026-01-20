const GET_STARTED = 'get-started';
const FIRST_NAME = 'firstName';
const LAST_NAME = 'lastName';
const ROLE = 'role';
const THANK_YOU = 'thank-you';

export const NEW_SIGNUP_STEPS = [
  GET_STARTED,
  FIRST_NAME,
  LAST_NAME,
  ROLE,
  THANK_YOU,
];

export const LABEL_TEXT = {
  firstName: 'What is your first name?',
  lastName: 'And what is your last name?',
  username: 'Now choose your awesome username!',
  role: 'Select your role',
};

export const SIGNUP_ERROR_MESSAGES = {
  invalidInput: 'Invalid input: firstname and lastname must be strings',
  userName: 'Username already taken!',
  others: 'Something went wrong!',
  usernameGeneration: 'Username cannot be generated!',
  loggedIn: 'You have not logged in. Please login first to fill this form.',
  formAlreadyFilled:
    "You already have filled up the form. You'll now be redirected.",
};

export const CHECK_BOX_DATA = [
  {
    label: 'Developer',
    name: 'developer',
  },
  {
    label: 'Designer',
    name: 'designer',
  },
  {
    label: 'Maven',
    name: 'maven',
  },
  {
    label: 'Social Media',
    name: 'social_media',
  },
  {
    label: 'Product Manager',
    name: 'product_manager',
  },
  {
    label: 'QA',
    name: 'qa',
  },
  {
    label: 'Project Manager',
    name: 'project_manager',
  },
];

export const GET_STARTED_MAIN_HEADING = 'Thank you for connecting your GitHub!';
export const GET_STARTED_SUB_HEADING =
  'Please complete the signup in order to:';
export const THANK_YOU_MAIN_HEADING = 'Congratulations!';
export const THANK_YOU_SUB_HEADING = "Let's get you started on your journey";
