import { SearchX } from 'lucide-react';

export default function EmptyState({ title, note, icon: Icon = SearchX }) {
  return (
    <div className="empty-state">
      <div className="empty-orb"><Icon size={32} /></div>
      <p className="empty-title">{title}</p>
      {note && <p className="empty-note">{note}</p>}
    </div>
  );
}
