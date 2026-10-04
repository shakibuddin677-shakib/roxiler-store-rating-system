import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

// Column headers are hidden on phones (tables become cards), so this bar keeps
// ascending / descending sorting available on small screens.
export default function MobileSort({ options, sort, onChange }) {
  const OrderIcon = sort.order === 'asc' ? ArrowUp : ArrowDown;
  return (
    <div className="mobile-sort">
      <div className="input-box">
        <ArrowUpDown size={16} />
        <select value={sort.sortBy} onChange={(e) => onChange({ ...sort, sortBy: e.target.value })} aria-label="Sort by">
          {options.map((o) => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
        </select>
      </div>
      <button
        type="button"
        className="btn btn-icon"
        onClick={() => onChange({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' })}
        aria-label={sort.order === 'asc' ? 'Ascending' : 'Descending'}
      >
        <OrderIcon size={18} />
      </button>
    </div>
  );
}
