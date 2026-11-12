export const ROLES = {
  host: 'host',
  maven: 'maven',
  moderator: 'moderator',
  guest: 'guest',
};
export const BUTTONS_TYPE = {
  SCREEN_SHARE: 'screen-share',
  COPY_LINK: 'copy-link',
  LEAVE_ROOM: 'leave-room',
};

export const API_METHOD = { POST: 'POST', GET: 'GET', PATCH: 'PATCH' };

export const PATCH_API_CONFIGS = {
  method: API_METHOD.PATCH,
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
};

export const POST_API_CONFIGS = {
  method: API_METHOD.POST,
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
};

export const GET_API_CONFIGS = {
  method: API_METHOD.GET,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const EVENTS_LOGS_POLL_TIME = 40000;
export const PARTICIPANTS_COUNT_POLL_TIME = 10000;
export const PARTICIPANTS_REFRESH_BUFFER_MS = 500;
export const EVENTS_LOGS_TYPE = {
  EVENTS_REMOVE_PEER: 'EVENTS_REMOVE_PEER',
};

export const QUESTION_DEBOUNCE_TIME = 200;
export const QUESTION_MIN_LENGTH = 2;
export const ANSWER_MIN_LENGTH = 2;
export const ANSWER_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};
