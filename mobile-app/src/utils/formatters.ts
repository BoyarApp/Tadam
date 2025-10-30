import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { isTamil } from '@i18n';

// Format date based on current language
export const formatDate = (dateString: string): string => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  const tamil = isTamil();

  return format(date, tamil ? 'dd MMM yyyy' : 'MMM dd, yyyy');
};

// Format time ago (e.g., "2 hours ago")
export const formatTimeAgo = (dateString: string): string => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  // Less than 1 hour
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    if (diffInMinutes < 1) {
      return isTamil() ? 'இப்போதுதான்' : 'Just now';
    }
    return isTamil()
      ? `${diffInMinutes} நிமிடத்திற்கு முன்`
      : `${diffInMinutes}m ago`;
  }

  // Less than 24 hours
  if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return isTamil()
      ? `${hours} மணி நேரத்திற்கு முன்`
      : `${hours}h ago`;
  }

  // More than 24 hours
  return formatDate(dateString);
};

// Format number with commas
export const formatNumber = (num: number): string => {
  return num.toLocaleString(isTamil() ? 'ta-IN' : 'en-IN');
};

// Format currency (INR)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(isTamil() ? 'ta-IN' : 'en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Extract domain from URL
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Capitalize first letter
export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Convert slug to title
export const slugToTitle = (slug: string): string => {
  return slug
    .split('-')
    .map((word) => capitalizeFirst(word))
    .join(' ');
};

// Convert title to slug
export const titleToSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
