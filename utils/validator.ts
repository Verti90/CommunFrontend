// utils/validator.ts
export const sanitize = (text: string) => 
  text.replace(/[^a-zA-Z0-9\s.,\-@']/g, '').trim();

export const isRequired = (value: string) => value && value.trim().length > 0;
export const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
export const isLength = (value: string, min: number, max: number) =>
  value.length >= min && value.length <= max;
// Add others as needed...