export const JOIN_DEBOUNCE_TIME = 1000;
export const STEP_ONE_LIMITS = {
  city: 1,
  state: 1,
  country: 1,
};
export const STEP_TWO_LIMITS = {
  introduction: 100,
  skills: 5,
  college: 1,
  forFun: 100,
  funFact: 100,
};
export const STEP_THREE_LIMITS = {
  word: {
    whyRds: 100,
    foundFrom: 1,
  },
  hour: {
    numberOfHours: { min: 1, max: 100 },
  },
};

export const APPLICATION_STATUS_TYPES = {
  accepted: 'accepted',
  rejected: 'rejected',
  pending: 'pending',
  changes_requested: 'changes_requested',
};
