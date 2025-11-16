export const formatRoleForDisplay = (role) => {
  if (!role || typeof role !== 'string') {
    return role || '';
  }

  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
