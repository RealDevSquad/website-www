export const mapApplicationStatus = {
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CHANGES_REQUESTED: 'Changes Requested',
  PENDING: 'pending',
};

export const mapSocialIcons = {
  github: 'mdi:github',
  linkedin: 'mdi:linkedin',
  twitter: 'mdi:twitter',
  instagram: 'mdi:instagram',
  peerlist: 'mdi:account-circle',
};

export const mapSocialUrls = {
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  twitter: 'https://twitter.com',
  instagram: 'https://instagram.com',
  peerlist: 'https://peerlist.io',
  dribbble: 'https://dribbble.com',
  behance: 'https://behance.net',
};

export function adminMessage(status) {
  switch (status) {
    case 'pending':
      return 'Admins are reviewing your applications, please hold up and keep on nudging.';
    case 'accepted':
      return 'Your application is approved, go back to join page to get join discord invite.';
    case 'rejected':
      return 'Your application has been rejected. Look at the feedback for more information.';
    case 'changes_requested':
      return 'Admin has requested changes on your application, please edit and submit again for review.';
    default:
      return 'Unknown status';
  }
}
