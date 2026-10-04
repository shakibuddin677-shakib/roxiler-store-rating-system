import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';

// A <th> that toggles ascending / descending when clicked.
export default function SortHeader({ label, field, sort, onSort }) {
  const active = sort.sortBy === field;
  const Icon = !active ? ChevronsUpDown : sort.order === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th
      className={`sortable ${active ? 'active' : ''}`}
      onClick={() => onSort(field)}
      aria-sort={active ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="th-in">
        {label}
        <Icon size={13} />
      </span>
    </th>
  );
}

// Shared toggle logic: same column flips direction, a new column starts ascending.
export const nextSort = (sort, field) =>
  sort.sortBy === field
    ? { sortBy: field, order: sort.order === 'asc' ? 'desc' : 'asc' }
    : { sortBy: field, order: 'asc' };
