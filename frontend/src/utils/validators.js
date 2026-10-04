// Mirrors backend/src/validators/rules.js so users get instant feedback
// instead of waiting for a round-trip to find out a field is invalid.

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value) {
  const v = (value || '').trim();
  if (!v) return 'Name is required';
  if (v.length < 20 || v.length > 60) return 'Name must be 20–60 characters';
  return null;
}

export function validateEmail(value) {
  const v = (value || '').trim();
  if (!v) return 'Email is required';
  if (!EMAIL_REGEX.test(v)) return 'Enter a valid email';
  return null;
}

export function validateAddress(value) {
  const v = (value || '').trim();
  if (v.length > 400) return 'Address can be at most 400 characters';
  return null;
}

export function validatePassword(value) {
  if (!value) return 'Password is required';
  if (!PASSWORD_REGEX.test(value)) {
    return 'Password must be 8–16 characters with at least one uppercase letter and one special character';
  }
  return null;
}
