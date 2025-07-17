export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const extractNameFromEmail = (email: string): string => {
  const [localPart] = email.split('@');
  return localPart
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}; 