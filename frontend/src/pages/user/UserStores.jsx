import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Search, MapPin, Star, ArrowUpDown, ArrowUp, ArrowDown, Store as StoreIcon } from 'lucide-react';
import AppShell from '../../components/AppShell';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { StarsStatic, StarPicker } from '../../components/Stars';
import useDebounce from '../../hooks/useDebounce';
import { listStores, rateStore } from '../../api/stores';
import { apiError, formatRating, initials, avatarTone } from '../../utils/format';

const SORTS = [
  { value: 'name', label: 'Name' },
  { value: 'address', label: 'Address' },
  { value: 'rating', label: 'Overall rating' }
];

function StoreCard({ store, index, saving, onRate }) {
  const tone = avatarTone(store.name).replace('av-', '');
  return (
    <motion.article
      className="store-card glass"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.05 }}
    >
      <div className={`store-banner banner-${tone}`}>
        <span className="score numeral"><Star size={13} fill="#fbbf24" strokeWidth={0} />{formatRating(store.overall_rating)}</span>
        <span className={`avatar lg av-${tone}`}>{initials(store.name)}</span>
      </div>
      <div className="store-body">
        <div>
          <h3>{store.name}</h3>
          <p className="store-addr" style={{ marginTop: 8 }}><MapPin size={15} />{store.address || 'Address not provided'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StarsStatic value={store.overall_rating || 0} size={16} />
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{store.overall_rating ? 'overall rating' : 'Not rated yet'}</span>
        </div>
        <div className="store-rate">
          <div className="lbl">
            <span>{store.my_rating ? 'Your rating · tap to change' : 'Rate this store'}</span>
            {store.my_rating && <span className="mine">{store.my_rating}/5</span>}
          </div>
          <StarPicker value={store.my_rating || 0} disabled={saving} onPick={(n) => onRate(store, n)} />
        </div>
      </div>
    </motion.article>
  );
}

export default function UserStores() {
  const [stores, setStores] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const debounced = useDebounce(search);

  const load = useCallback(() => {
    const params = { ...sort };
    if (debounced) params.search = debounced;
    return listStores(params)
      .then((rows) => { setStores(rows); setError(''); })
      .catch((e) => setError(apiError(e, 'Could not load stores.')));
  }, [debounced, sort]);

  useEffect(() => { load(); }, [load]);

  const handleRate = async (store, rating) => {
    setSavingId(store.id);
    try {
      await rateStore(store.id, rating);
      toast.success(store.my_rating ? `Updated to ${rating}★ for ${store.name}` : `Rated ${store.name} ${rating}★`);
      await load(); // refresh so the overall average reflects the new rating
    } catch (e) {
      toast.error(apiError(e, 'Could not save your rating.'));
    } finally {
      setSavingId(null);
    }
  };

  const OrderIcon = sort.order === 'asc' ? ArrowUp : ArrowDown;

  return (
    <AppShell title="Discover stores" subtitle="Search by name or address, then rate any store from 1 to 5 — you can change it anytime.">
      <div className="toolbar">
        <div className="input-box grow">
          <Search size={17} />
          <input placeholder="Search stores by name or address…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="input-box" style={{ minWidth: 190 }}>
          <ArrowUpDown size={16} />
          <select value={sort.sortBy} onChange={(e) => setSort((s) => ({ ...s, sortBy: e.target.value }))}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>Sort: {s.label}</option>)}
          </select>
        </div>
        <button className="btn" onClick={() => setSort((s) => ({ ...s, order: s.order === 'asc' ? 'desc' : 'asc' }))} style={{ height: 46 }}>
          <OrderIcon size={16} /> {sort.order === 'asc' ? 'Ascending' : 'Descending'}
        </button>
      </div>

      {error && <div className="banner-error" style={{ marginBottom: 14 }}>{error}</div>}

      {stores === null && (
        <div className="store-grid">
          {[1, 2, 3].map((i) => <Skeleton key={i} height={290} radius={20} />)}
        </div>
      )}

      {stores && stores.length > 0 && (
        <div className="store-grid">
          {stores.map((s, i) => (
            <StoreCard key={s.id} store={s} index={i} saving={savingId === s.id} onRate={handleRate} />
          ))}
        </div>
      )}

      {stores && stores.length === 0 && (
        <div className="glass">
          <EmptyState title="No stores match your search" note="Try a different name or address." icon={StoreIcon} />
        </div>
      )}
    </AppShell>
  );
}
