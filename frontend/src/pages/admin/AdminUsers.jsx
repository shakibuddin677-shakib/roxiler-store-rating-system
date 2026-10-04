import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { UserPlus, Eye, Pencil, Trash2, Users as UsersIcon } from 'lucide-react';
import AppShell from '../../components/AppShell';
import Modal from '../../components/Modal';
import IconInput from '../../components/IconInput';
import Avatar from '../../components/Avatar';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import SortHeader, { nextSort } from '../../components/SortHeader';
import MobileSort from '../../components/MobileSort';
import { StarsStatic } from '../../components/Stars';
import useDebounce from '../../hooks/useDebounce';
import ConfirmModal from '../../components/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { listUsers, getUser, createUser, updateUser, deleteUser } from '../../api/admin';
import { validateName, validateEmail, validateAddress, validatePassword } from '../../utils/validators';
import { apiError, formatRating } from '../../utils/format';

const ROLES = [
  { value: '', label: 'All roles' },
  { value: 'ADMIN', label: 'Admins' },
  { value: 'OWNER', label: 'Store owners' },
  { value: 'USER', label: 'Members' }
];
const ROLE_LABEL = { ADMIN: 'Admin', OWNER: 'Store owner', USER: 'Member' };
const EMPTY_FORM = { name: '', email: '', address: '', password: '', role: 'USER' };

function AddUserModal({ open, onClose, onCreated, user = null }) {
  const editing = !!user;
  const [form, setForm] = useState(EMPTY_FORM);
  const { user: me } = useAuth();

  // When opened for editing, pre-fill the form (password stays blank = unchanged).
  useEffect(() => {
    if (open) setForm(user ? { name: user.name, email: user.email, address: user.address || '', password: '', role: user.role } : EMPTY_FORM);
  }, [open, user]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const close = () => { setForm(EMPTY_FORM); setErrors({}); setServerError(''); onClose(); };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: editing && !form.password ? null : validatePassword(form.password)
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      if (editing) {
        await updateUser(user.id, form);
        toast.success('User updated');
      } else {
        await createUser(form);
        toast.success(`${ROLE_LABEL[form.role]} created`);
      }
      close();
      onCreated();
    } catch (err) {
      setServerError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title={editing ? 'Edit user' : 'Add a new user'} subtitle={editing ? 'Update details. Leave the password blank to keep it unchanged.' : 'Create an admin, store owner or member account.'}>
      <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {serverError && <div className="banner-error">{serverError}</div>}
        <IconInput icon="user" label="Full name" value={form.name} onChange={set('name')} placeholder="20–60 characters" error={errors.name} hint={`${form.name.trim().length}/60 characters`} />
        <IconInput icon="mail" label="Email" type="email" value={form.email} onChange={set('email')} placeholder="name@example.com" error={errors.email} />
        <IconInput icon="pin" label="Address" value={form.address} onChange={set('address')} placeholder="Optional, up to 400 characters" error={errors.address} />
        <IconInput icon="lock" label={editing ? 'New password (optional)' : 'Password'} type="password" value={form.password} onChange={set('password')} placeholder="8–16 chars, 1 uppercase, 1 special" error={errors.password} autoComplete="new-password" />
        <IconInput icon="role" label="Role" as="select" value={form.role} onChange={set('role')} disabled={editing && user.id === me?.id} hint={editing && user.id === me?.id ? 'You cannot change your own role.' : undefined}>
          <option value="USER">Member (normal user)</option>
          <option value="OWNER">Store owner</option>
          <option value="ADMIN">Administrator</option>
        </IconInput>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={close}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <span className="spinner" />} {editing ? 'Save changes' : 'Create user'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function UserDetailModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return undefined;
    setUser(null); setError('');
    let alive = true;
    getUser(userId).then((u) => alive && setUser(u)).catch((e) => alive && setError(apiError(e, 'Could not load user.')));
    return () => { alive = false; };
  }, [userId]);

  return (
    <Modal open={!!userId} onClose={onClose} title="User details" subtitle="Full profile as stored in the registry.">
      {error && <div className="banner-error">{error}</div>}
      {!user && !error && <Skeleton height={140} radius={14} />}
      {user && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar name={user.name} size="lg" />
            <div>
              <h3 style={{ fontSize: 18 }}>{user.name}</h3>
              <span className={`badge badge-${user.role}`} style={{ marginTop: 8 }}>{ROLE_LABEL[user.role]}</span>
            </div>
          </div>
          <div>
            <div className="detail-row"><span>Email</span><span>{user.email}</span></div>
            <div className="detail-row"><span>Address</span><span>{user.address || '—'}</span></div>
            <div className="detail-row"><span>Role</span><span>{ROLE_LABEL[user.role]}</span></div>
            {user.role === 'OWNER' && (
              <div className="detail-row">
                <span>Store rating</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <StarsStatic value={user.rating || 0} size={14} />
                  <b className="numeral">{formatRating(user.rating)}</b>
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

export default function AdminUsers() {
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [viewId, setViewId] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [delUser, setDelUser] = useState(null);
  const { user: me } = useAuth();

  const debounced = useDebounce(filters);

  const load = useCallback(() => {
    const params = { ...sort };
    Object.entries(debounced).forEach(([k, v]) => { if (v) params[k] = v; });
    listUsers(params)
      .then((data) => { setRows(data); setError(''); })
      .catch((e) => setError(apiError(e, 'Could not load users.')));
  }, [debounced, sort]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AppShell
      title="Users"
      subtitle="Create accounts, search, filter and inspect everyone on the platform."
      action={<button className="btn btn-primary" onClick={() => setAddOpen(true)}><UserPlus size={17} /> Add user</button>}
    >
      <div className="chips" style={{ marginBottom: 16 }}>
        {ROLES.map((r) => (
          <button key={r.value} className={`chip ${filters.role === r.value ? 'on' : ''}`} onClick={() => setFilters((f) => ({ ...f, role: r.value }))}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="filters-grid">
        <IconInput icon="user" placeholder="Filter by name" value={filters.name} onChange={setFilter('name')} />
        <IconInput icon="mail" placeholder="Filter by email" value={filters.email} onChange={setFilter('email')} />
        <IconInput icon="pin" placeholder="Filter by address" value={filters.address} onChange={setFilter('address')} />
      </div>

      {error && <div className="banner-error" style={{ marginBottom: 14 }}>{error}</div>}
      {rows && <p className="result-count">{rows.length} {rows.length === 1 ? 'user' : 'users'} found</p>}

      <MobileSort
        options={[{ value: 'name', label: 'Name' }, { value: 'email', label: 'Email' }, { value: 'address', label: 'Address' }, { value: 'role', label: 'Role' }]}
        sort={sort}
        onChange={setSort}
      />

      <div className="table-card glass">
        <div className="table-scroll">
          <table className="table responsive">
            <thead>
              <tr>
                <SortHeader label="Name" field="name" sort={sort} onSort={(f) => setSort(nextSort(sort, f))} />
                <SortHeader label="Email" field="email" sort={sort} onSort={(f) => setSort(nextSort(sort, f))} />
                <SortHeader label="Address" field="address" sort={sort} onSort={(f) => setSort(nextSort(sort, f))} />
                <SortHeader label="Role" field="role" sort={sort} onSort={(f) => setSort(nextSort(sort, f))} />
                <th />
              </tr>
            </thead>
            <tbody>
              {rows === null && [1, 2, 3, 4].map((i) => (
                <tr key={i}>
                  <td><Skeleton width="80%" height={20} /></td><td><Skeleton width="70%" /></td>
                  <td><Skeleton width="60%" /></td><td><Skeleton width={70} height={22} radius={99} /></td><td />
                </tr>
              ))}
              {rows && rows.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.025 }}>
                  <td className="td-main"><div className="cell-user"><Avatar name={u.name} /><span className="nm">{u.name}</span></div></td>
                  <td className="cell-muted" data-label="Email">{u.email}</td>
                  <td className="cell-muted" data-label="Address">{u.address || '—'}</td>
                  <td data-label="Role"><span className={`badge badge-${u.role}`}>{ROLE_LABEL[u.role]}</span></td>
                  <td className="td-action">
                    <div className="row-actions">
                      <button className="btn btn-sm" onClick={() => setViewId(u.id)} title="View details"><Eye size={14} /><span className="lbl">View</span></button>
                      <button className="btn btn-sm" onClick={() => setEditUser(u)} title="Edit" aria-label={`Edit ${u.name}`}><Pencil size={14} /><span className="lbl">Edit</span></button>
                      <button className="btn btn-sm btn-danger" onClick={() => setDelUser(u)} disabled={u.id === me?.id} title={u.id === me?.id ? 'You cannot delete yourself' : 'Delete'} aria-label={`Delete ${u.name}`}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows && rows.length === 0 && <EmptyState title="No users match these filters" note="Try clearing a filter or searching with different words." icon={UsersIcon} />}
      </div>

      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={load} />
      <AddUserModal open={!!editUser} user={editUser} onClose={() => setEditUser(null)} onCreated={load} />
      <ConfirmModal
        open={!!delUser}
        title="Delete user?"
        message={delUser ? `${delUser.name} will be permanently removed along with all ratings they submitted.${delUser.role === 'OWNER' ? ' Stores they own will become unassigned.' : ''} This cannot be undone.` : ''}
        onClose={() => setDelUser(null)}
        onConfirm={async () => { await deleteUser(delUser.id); toast.success('User deleted'); setDelUser(null); load(); }}
      />
      <UserDetailModal userId={viewId} onClose={() => setViewId(null)} />
    </AppShell>
  );
}
