import DOMPurify from 'dompurify';

export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input.trim());
  }
  return input;
};

export const sanitizeFormData = (formData) => {
  const sanitized = {};
  Object.keys(formData).forEach(key => {
    sanitized[key] = sanitizeInput(formData[key]);
  });
  return sanitized;
};