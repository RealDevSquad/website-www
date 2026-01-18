import ENV from 'website-www/config/environment';

const SCHEME = 'https://';
const DOMAIN = 'realdevsquad.com';

const APP_URLS = {
  production: {
    HOME: `${SCHEME}${DOMAIN}`,
    WELCOME: `${SCHEME}welcome.${DOMAIN}`,
    GOTO: `${SCHEME}${DOMAIN}/goto`,
    EVENTS: `${SCHEME}${DOMAIN}/events`,
    MEMBERS: `${SCHEME}members.${DOMAIN}`,
    STATUS: `${SCHEME}status.${DOMAIN}`,
    PROFILE: `${SCHEME}${DOMAIN}/profile`,
    TASKS: `${SCHEME}status.${DOMAIN}/tasks`,
    IDENTITY: `${SCHEME}${DOMAIN}/identity`,
    MY_STATUS: `${SCHEME}${DOMAIN}/status`,
    API_BACKEND: `${SCHEME}api.${DOMAIN}`,
    DASHBOARD: `${SCHEME}dashboard.${DOMAIN}`,
    SIGN_UP: `${SCHEME}${DOMAIN}/new-signup`,
  },
  staging: {
    HOME: `${SCHEME}staging-www.${DOMAIN}`,
    WELCOME: `${SCHEME}staging-welcome.${DOMAIN}`,
    GOTO: `${SCHEME}staging-www.${DOMAIN}/goto`,
    EVENTS: `${SCHEME}staging-www.${DOMAIN}/events`,
    MEMBERS: `${SCHEME}staging-members.${DOMAIN}`,
    STATUS: `${SCHEME}staging-status.${DOMAIN}`,
    PROFILE: `${SCHEME}staging-www.${DOMAIN}/profile`,
    TASKS: `${SCHEME}staging-status.${DOMAIN}/tasks`,
    IDENTITY: `${SCHEME}staging-www.${DOMAIN}/identity`,
    MY_STATUS: `${SCHEME}staging-www.${DOMAIN}/status`,
    API_BACKEND: `${SCHEME}staging-api.${DOMAIN}`,
    DASHBOARD: `${SCHEME}staging-dashboard.${DOMAIN}`,
    SIGN_UP: `${SCHEME}staging-www.${DOMAIN}/new-signup`,
  },
  development: {
    HOME: `${SCHEME}dev.${DOMAIN}`,
    WELCOME: `${SCHEME}staging-welcome.${DOMAIN}`,
    GOTO: '/goto',
    EVENTS: '/events',
    MEMBERS: `${SCHEME}staging-members.${DOMAIN}`,
    STATUS: `${SCHEME}staging-status.${DOMAIN}`,
    PROFILE: '/profile',
    TASKS: `${SCHEME}staging-status.${DOMAIN}/tasks`,
    IDENTITY: '/identity',
    MY_STATUS: '/status',
    DASHBOARD: `${SCHEME}staging-dashboard.${DOMAIN}`,
    API_BACKEND: `${SCHEME}staging-api.${DOMAIN}`,
    SIGN_UP: `${SCHEME}dev.${DOMAIN}/new-signup`,
  },
  test: {
    HOME: `${SCHEME}${DOMAIN}`,
    WELCOME: `${SCHEME}welcome.${DOMAIN}`,
    GOTO: `${SCHEME}${DOMAIN}/goto`,
    EVENTS: `${SCHEME}${DOMAIN}/events`,
    MEMBERS: `${SCHEME}members.${DOMAIN}`,
    STATUS: `${SCHEME}status.${DOMAIN}`,
    PROFILE: `${SCHEME}${DOMAIN}/profile`,
    TASKS: `${SCHEME}status.${DOMAIN}/tasks`,
    IDENTITY: `${SCHEME}${DOMAIN}/identity`,
    MY_STATUS: `${SCHEME}${DOMAIN}/status`,
    API_BACKEND: `${SCHEME}staging-api.${DOMAIN}`,
    DASHBOARD: `${SCHEME}staging-dashboard.${DOMAIN}`,
    SIGN_UP: '/new-signup',
  },
};

export const APPS = { ...APP_URLS[ENV.environment], LIVE: 'live' };

export const ABOUT = {
  FAQ: `${APPS.WELCOME}/faq.html`,
  REPOSITORY: 'https://github.com/Real-Dev-Squad/website-www',
  VIDEO: 'https://www.youtube.com/embed/8UPjK1wLnTk?controls=0',
};

export const AUTH = {
  GITHUB_SIGN_IN: `${APPS.API_BACKEND}/auth/github/login`,
  GOOGLE_SIGN_IN: `${APPS.API_BACKEND}/auth/google/login?dev=true`,
  SIGN_UP: APPS.SIGN_UP,
};

export const SOCIALS = {
  LINKEDIN: {
    URL: 'https://www.linkedin.com/company/real-dev-squad',
    TITLE: 'LinkedIn',
    ICON: 'assets/icons/linkedin-logo.png',
    WHITE_ICON: 'assets/icons/linkedin-white.png',
  },
  TWITTER: {
    URL: 'https://twitter.com/realdevsquad?lang=en',
    TITLE: 'Twitter',
    ICON: 'assets/icons/twitter-logo.png',
    WHITE_ICON: 'assets/icons/twitter-white.png',
  },
  FACEBOOK: {
    URL: 'https://www.facebook.com/Real-Dev-Squad-108713777585062/',
    TITLE: 'Facebook',
    ICON: 'assets/icons/facebook-logo.png',
    WHITE_ICON: 'assets/icons/facebook-white.png',
  },
  INSTAGRAM: {
    URL: 'https://www.instagram.com/realdevsquad/?hl=en',
    TITLE: 'Instagram',
    ICON: 'assets/icons/instagram-logo.png',
    WHITE_ICON: 'assets/icons/instagram-white.png',
  },
};

export const ANKUSH_TWITTER = 'https://twitter.com/ankushdharkar';
export const RDS_TWITTER = 'https://x.com/realdevsquad';
