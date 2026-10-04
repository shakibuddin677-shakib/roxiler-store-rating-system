import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Store, Star, UserPlus, PlusCircle, Trophy, BadgeCheck } from 'lucide-react';
import AppShell from '../../components/AppShell';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { StarsStatic } from '../../components/Stars';
import Avatar from '../../components/Avatar';
import useCountUp from '../../hooks/useCountUp';
import { getDashboard, listStores } from '../../api/admin';
import { formatRating } from '../../utils/format';

const CARDS = [
  { key: 'total_users', label: 'Total users', icon: Users, tone: 'var(--g-violet)', solid: '#8b5cf6' },
  { key: 'total_owners', label: 'Store owners', icon: BadgeCheck, tone: 'var(--g-emerald)', solid: '#34d399' },
  { key: 'total_stores', label: 'Registered stores', icon: Store, tone: 'var(--g-cyan)', solid: '#22d3ee' },
  { key: 'total_ratings', label: 'Ratings submitted', icon: Star, tone: 'var(--g-amber)', solid: '#fbbf24' }
];

const ROLE_COLORS = { ADMIN: '#8b5cf6', OWNER: '#fbbf24', USER: '#22d3ee' };
const ROLE_LABELS = { ADMIN: 'Admins', OWNER: 'Store owners', USER: 'Members' };

function StatCard({ card, value, index }) {
  const shown = useCountUp(value);
  const Icon = card.icon;
  return (
    <motion.div
      className="stat-card glass"
      style={{ '--tone': card.tone, '--tone-solid': card.solid }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <span className="stat-icon"><Icon size={22} /></span>
      <div>
        {value === undefined ? <Skeleton width={70} height={38} /> : <div className="stat-value numeral">{shown}</div>}
        <div className="stat-label" style={{ marginTop: 8 }}>{card.label}</div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [top, setTop] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard().then(setStats).catch(() => setError('Could not load dashboard totals.'));

    listStores({ sortBy: 'rating', order: 'desc' })
      .then((rows) => setTop(rows.filter((s) => s.rating !== null).slice(0, 5)))
      .catch(() => setTop([]));
  }, []);

  const roles = stats
    ? [
        { role: 'ADMIN', value: stats.total_admins },
        { role: 'OWNER', value: stats.total_owners },
        { role: 'USER', value: stats.total_normal_users }
      ]
    : null;

  return (
    <AppShell
      title="Registry overview"
      subtitle="Live platform totals, top performers and who is on the platform."
      action={
        <div className="quick-actions" style={{ margin: 0 }}>
          <Link to="/admin/users" className="btn"><UserPlus size={16} /> Add user</Link>
          <Link to="/admin/stores" className="btn btn-primary"><PlusCircle size={16} /> Add store</Link>
        </div>
      }
    >
      {error && <div className="banner-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="stat-grid">
        {CARDS.map((card, i) => (
          <StatCard key={card.key} card={card} index={i} value={stats ? stats[card.key] : undefined} />
        ))}
      </div>

      <div className="two-col">
        <motion.div className="panel glass" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h3 className="panel-title"><Trophy size={16} style={{ verticalAlign: -2, marginRight: 8, color: '#fbbf24' }} />Top rated stores</h3>
          <p className="panel-sub">Highest average ratings across the platform.</p>
          {top === null && <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1, 2, 3].map((i) => <Skeleton key={i} height={46} radius={12} />)}</div>}
          {top && top.length === 0 && <EmptyState title="No ratings yet" note="Stores appear here once members start rating." icon={Star} />}
          {top && top.length > 0 && (
            <div className="rank-list">
              {top.map((s, i) => (
                <div className="rank-item" key={s.id}>
                  <span className="rank-no">0{i + 1}</span>
                  <Avatar name={s.name} size="sm" />
                  <div className="rank-main"><strong>{s.name}</strong><span>{s.address || 'No address'}</span></div>
                  <div className="rank-score"><span className="numeral">{formatRating(s.rating)}</span><StarsStatic value={s.rating} size={12} /></div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div className="panel glass" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}>
          <h3 className="panel-title">People on the platform</h3>
          <p className="panel-sub">Distribution of accounts by role.</p>
          {roles === null ? <Skeleton height={180} radius={16} /> : (
            <div className="donut-wrap">
              <div style={{ height: 190 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roles} dataKey="value" nameKey="role" innerRadius={52} outerRadius={80} paddingAngle={4} stroke="none">
                      {roles.map((r) => <Cell key={r.role} fill={ROLE_COLORS[r.role]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#14122f', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#fff' }} formatter={(v, n) => [v, ROLE_LABELS[n]]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="legend">
                {roles.map((r) => (
                  <div className="legend-row" key={r.role}>
                    <i style={{ background: ROLE_COLORS[r.role] }} />{ROLE_LABELS[r.role]}<b>{r.value}</b>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
