import { useState } from 'react';
import { Star } from 'lucide-react';

// Read-only stars that support fractional values (4.3 fills 86% of the row).
export function StarsStatic({ value = 0, size = 16 }) {
  const pct = Math.max(0, Math.min(100, (Number(value) / 5) * 100));
  const row = () => (
    <span className="row">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
  return (
    <span className="stars-static" aria-label={`${value} out of 5`}>
      <span className="under">{row()}</span>
      <span className="over" style={{ width: `${pct}%` }}>{row()}</span>
    </span>
  );
}

// Interactive picker used to submit / modify a rating.
export function StarPicker({ value = 0, onPick, disabled, size = 24 }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <span className="stars-pick" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          className={n <= shown ? 'on' : ''}
          onMouseEnter={() => setHover(n)}
          onClick={() => onPick(n)}
          aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
        >
          <Star size={size} fill="currentColor" strokeWidth={0} />
        </button>
      ))}
    </span>
  );
}
