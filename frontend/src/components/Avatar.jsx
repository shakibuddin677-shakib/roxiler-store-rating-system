import { initials, avatarTone } from '../utils/format';

export default function Avatar({ name, size = '' }) {
  return <span className={`avatar ${size} ${avatarTone(name)}`}>{initials(name)}</span>;
}
