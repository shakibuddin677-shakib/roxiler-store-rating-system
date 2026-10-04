import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, Store as StoreIcon } from 'lucide-react';
import AppShell from '../../components/AppShell';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import Avatar from '../../components/Avatar';
import SortHeader, { nextSort } from '../../components/SortHeader';
import MobileSort from '../../components/MobileSort';
import { StarsStatic } from '../../components/Stars';
import { getOwnerDashboard } from '../../api/owner';
import { apiError, formatRating, formatDate } from '../../utils/format';

function distribution(raters) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  raters.forEach((r) => { counts[r.rating] += 1; });
  return [5, 4, 3, 2, 1].map((star) => ({ star, count: counts[star] }));
}

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [sort, setSort] = useState({ sortBy: 'date', order: 'desc' });
  const [storeId, setStoreId] = useState(null); // only used when the owner has several stores

  const load = useCallback(() => {
    getOwnerDashboard(storeId ? { ...sort, storeId } : sort)
      .then((d) => { setData(d); setError(''); })
      .catch((e) => setError(apiError(e, 'Could not load your store dashboard.')))
      .finally(() => setLoaded(true));
  }, [sort, storeId]);

  useEffect(() => { load(); }, [load]);

  const onSort = (f) => setSort(nextSort(sort, f));
  const dist = data ? distribution(data.raters) : [];
  const total = data ? data.raters.length : 0;

  return (
    <AppShell title="Your store" subtitle="Your average rating and everyone who has rated your store.">
      {!loaded && <Skeleton height={150} radius={20} />}

      {loaded && error && (
        <div className="glass"><EmptyState title="No store assigned yet" note={error} icon={StoreIcon} /></div>
      )}

      {loaded && data && (
        <>
          <motion.div className="owner-hero glass" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ position: 'relative' }}>
              <span className="badge badge-OWNER" style={{ marginBottom: 12 }}><StoreIcon size={12} /> Your store</span>
              {data.stores?.length > 1 ? (
                <div className="input-box" style={{ marginBottom: 10, maxWidth: 340 }}>
                  <StoreIcon size={16} />
                  <select value={data.store.id} onChange={(e) => setStoreId(Number(e.target.value))} aria-label="Select store">
                    {data.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              ) : (
                <h2>{data.store.name}</h2>
              )}
              <p className="addr"><MapPin size={15} />{data.store.address || 'Address not provided'}</p>
            </div>
            <div className="owner-score">
              <span className="big numeral gradient-text">{formatRating(data.store.average_rating)}</span>
              <StarsStatic value={data.store.average_rating || 0} size={20} />
              <small>{total} {total === 1 ? 'rating' : 'ratings'} received</small>
            </div>
          </motion.div>

          <div className="two-col owner-two-col" style={{ gridTemplateColumns: "1fr 1.6fr", alignItems: "start" }}>
            <motion.div className="panel glass" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="panel-title">Rating breakdown</h3>
              <p className="panel-sub">How your {total} ratings are spread.</p>
              {dist.map((d) => (
                <div className="dist-row" key={d.star}>
                  <span className="rating-pill">{d.star}<Star size={13} fill="currentColor" strokeWidth={0} /></span>
                  <div className="dist-track">
                    <motion.div className="dist-fill" initial={{ width: 0 }} animate={{ width: total ? `${(d.count / total) * 100}%` : 0 }} transition={{ duration: 0.7, delay: 0.2 }} />
                  </div>
                  <span className="numeral" style={{ textAlign: 'right' }}>{d.count}</span>
                </div>
              ))}
            </motion.div>

            <motion.div className="table-card glass" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
              <div className="table-head">
                <h3 className="panel-title"><Users size={16} style={{ verticalAlign: -2, marginRight: 8 }} />Who rated your store</h3>
              </div>
              <MobileSort
                options={[{ value: 'name', label: 'User' }, { value: 'email', label: 'Email' }, { value: 'rating', label: 'Rating' }, { value: 'date', label: 'Date' }]}
                sort={sort}
                onChange={setSort}
              />
              <div className="table-scroll">
                <table className="table responsive" style={{ minWidth: 520 }}>
                  <thead>
                    <tr>
                      <SortHeader label="User" field="name" sort={sort} onSort={onSort} />
                      <SortHeader label="Email" field="email" sort={sort} onSort={onSort} />
                      <SortHeader label="Rating" field="rating" sort={sort} onSort={onSort} />
                      <SortHeader label="Date" field="date" sort={sort} onSort={onSort} />
                    </tr>
                  </thead>
                  <tbody>
                    {data.raters.map((r) => (
                      <tr key={r.id}>
                        <td className="td-main"><div className="cell-user"><Avatar name={r.name} size="sm" /><span className="nm">{r.name}</span></div></td>
                        <td className="cell-muted" data-label="Email">{r.email}</td>
                        <td data-label="Rating"><span className="rating-pill">{r.rating}<Star size={13} fill="currentColor" strokeWidth={0} /></span></td>
                        <td className="cell-muted" data-label="Date">{formatDate(r.updated_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.raters.length === 0 && <EmptyState title="No ratings yet" note="Once members rate your store, they'll show up here." icon={Star} />}
            </motion.div>
          </div>
        </>
      )}
    </AppShell>
  );
}
