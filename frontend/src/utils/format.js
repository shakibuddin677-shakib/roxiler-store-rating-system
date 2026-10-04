export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '?';

export const avatarTone = (seed = '') => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 5;
  return `av-${h}`;
};

export const formatRating = (v) => (v === null || v === undefined ? '—' : Number(v).toFixed(1));

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// Turns an axios error into one readable sentence (handles express-validator payloads).
export const apiError = (err, fallback = 'Something went wrong. Please try again.') => {
  const data = err?.response?.data;
  if (data?.errors?.length) return data.errors[0].message;
  return data?.message || fallback;
};
