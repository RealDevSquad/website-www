import { APPS } from 'website-www/constants/urls';

export const JOIN_URL = `${APPS.API_BACKEND}/users/self/intro`;

export const APPLICATION_URL = (userId) => {
  return `${APPS.API_BACKEND}/users/${userId}/intro`;
};

export const USER_JOINED_LINK = (userId) => {
  return `${APPS.HOME}/intro?id=${userId}`;
};

export const USER_APPLICATION_LINK = (userId) => {
  return `${APPS.DASHBOARD}/applications?id=${userId}`;
};

export const APPLICATION_ID_LINK = (id) => {
  return `${APPS.DASHBOARD}/applications/?id=${id}`;
};

export const GENERATE_USERNAME_URL = (
  sanitizedFirstname,
  sanitizedLastname,
) => {
  return `${APPS.API_BACKEND}/users/username?dev=true&firstname=${sanitizedFirstname}&lastname=${sanitizedLastname}`;
};

export const CHECK_USERNAME_AVAILABILITY = (userName) => {
  return `${APPS.API_BACKEND}/users/isUsernameAvailable/${userName}`;
};

export const SELF_USERS_URL = `${APPS.API_BACKEND}/users/self`;

export const SELF_USER_STATUS_URL = `${APPS.API_BACKEND}/users/status/self`;

export const UPDATE_USER_STATUS = `${APPS.API_BACKEND}/users/status/self?userStatusFlag=true`;

export const CREATE_OOO_REQUEST_URL = `${APPS.API_BACKEND}/requests?dev=true`;

export const SELF_USER_PROFILE_URL = `${APPS.API_BACKEND}/users?profile=true`;

export const QR_AUTHORIZATION_STATUS_URL = `${APPS.API_BACKEND}/auth/qr-code-auth/authorization_status`;

export const USER_AUTHENTICATED_DEVICES_URL = `${APPS.API_BACKEND}/auth/device`;

export const APPLICATIONS_LIST_URL = (size = 10, page = 1) => {
  return `${APPS.API_BACKEND}/applications?size=${size}&page=${page}`;
};

export const APPLICATION_DETAIL_URL = (id) => {
  return `${APPS.API_BACKEND}/applications/${id}`;
};

export const APPLICATION_ACTION_URL = (id, action) => {
  return `${APPS.API_BACKEND}/applications/${id}/${action}`;
};
