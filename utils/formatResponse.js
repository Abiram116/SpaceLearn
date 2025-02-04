export const formatDate = (date) => {
  if (!date) return '';
  
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(date).toLocaleDateString(undefined, options);
};

export const formatTime = (date) => {
  if (!date) return '';
  
  const options = { hour: '2-digit', minute: '2-digit' };
  return new Date(date).toLocaleTimeString(undefined, options);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
};

export const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

export const formatScore = (score) => {
  if (typeof score !== 'number') return '0%';
  return `${Math.round(score * 100)}%`;
};

export const formatResponseForDisplay = (response) => {
  if (!response) return '';
  
  // Remove extra whitespace and normalize line breaks
  return response
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n');
};

export const formatSubjectName = (subject) => {
  if (!subject) return '';
  
  // Capitalize first letter of each word
  return subject
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}; 