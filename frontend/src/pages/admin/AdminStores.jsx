import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PlusCircle, Pencil, Trash2, Store as StoreIcon } from 'lucide-react';
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
import { listStores, listUsers, createStore, updateStore, deleteStore } from '../../api/admin';
import { validateName, validateEmail, validateAddress } from '../../utils/validators';
import { apiError, formatRating } from '../../utils/format';

const EMPTY_FORM = { name: '', email: '', address: '', ownerId: '' };

function AddStoreModal({ open, onClose, onCreated, store = null }) {
  const editing = !!store;
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (open) setForm(store ? { name: store.name, email: store.email, address: store.address || '', ownerId: store.owner_id ? String(store.owner_id) : '' } : EMPTY_FORM);
  }, [open, store]);
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Only users with the OWNER role can be assigned to a store (the API enforces this too).
  useEffect(() => {
    if (open) listUsers({ role: 'OWNER', sortBy: 'name', order: 'asc' }).then(setOwners).catch(() => setOwners([]));
  }, [open]);

  const close = () => { setForm(EMPTY_FORM); setErrors({}); setServerError(''); onClose(); };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const next = { name: validateName(form.name), email: validateEmail(form.email), address: validateAddress(form.address) };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, address: form.address, ownerId: form.ownerId ? Number(form.ownerId) : null };
      if (editing) {
        await updateStore(store.id, payload);
        toast.success('Store updated');
      } else {
        await createStore(payload);
        toast.success('Store added');
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
    <Modal open={open} onClose={close} title={editing ? 'Edit store' : 'Add a new store'} subtitle={editing ? 'Update the store details or change its owner.' : 'Register a store and optionally assign its owner.'}>
      <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {serverError && <div className="banner-error">{serverError}</div>}
        <IconInput icon="user" label="Store name" value={form.name} onChange={set('name')} placeholder="20–60 characters" error={errors.name} hint={`${form.name.trim().length}/60 characters`} />
        <IconInput icon="mail" label="Store email" type="email" value={form.email} onChange={set('email')} placeholder="store@example.com" error={errors.email} />
        <IconInput icon="pin" label="Address" value={form.address} onChange={set('address')} placeholder="Optional, up to 400 characters" error={errors.address} />
        <IconInput icon="role" label="Store owner" as="select" value={form.ownerId} onChange={set('ownerId')} hint={owners.length === 0 ? 'No store-owner accounts yet — create one from the Users page.' : undefined}>
          <option value="">No owner (assign later)</option>
          {owners.map((o) => <option key={o.id} value={o.id}>{o.name} — {o.email}</option>)}
        </IconInput>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={close}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <span className="spinner" />} {editing ? 'Save changes' : 'Add store'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminStores() {
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', order: 'asc' });
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editStore, setEditStore] = useState(null);
  const [delStore, setDelStore] = useState(null);

  const debounced = useDebounce(filters);

  const load = useCallback(() => {
    const params = { ...sort };
    Object.entries(debounced).forEach(([k, v]) => { if (v) params[k] = v; });
    listStores(params)
      .then((data) => { setRows(data); setError(''); })
      .catch((e) => setError(apiError(e, 'Could not load stores.')));
  }, [debounced, sort]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const onSort = (f) => setSort(nextSort(sort, f));

  return (
    <AppShell
      title="Stores"
      subtitle="Every registered store with its live average rating."
      action={<button className="btn btn-primary" onClick={() => setAddOpen(true)}><PlusCircle size={17} /> Add store</button>}
    >
      <div className="filters-grid">
        <IconInput icon="user" placeholder="Filter by name" value={filters.name} onChange={setFilter('name')} />
        <IconInput icon="mail" placeholder="Filter by email" value={filters.email} onChange={setFilter('email')} />
        <IconInput icon="pin" placeholder="Filter by address" value={filters.address} onChange={setFilter('address')} />
      </div>

      {error && <div className="banner-error" style={{ marginBottom: 14 }}>{error}</div>}
      {rows && <p className="result-count">{rows.length} {rows.length === 1 ? 'store' : 'stores'} found</p>}

      <MobileSort
        options={[{ value: 'name', label: 'Store' }, { value: 'email', label: 'Email' }, { value: 'address', label: 'Address' }, { value: 'owner', label: 'Owner' }, { value: 'rating', label: 'Rating' }]}
        sort={sort}
        onChange={setSort}
      />

      <div className="table-card glass">
        <div className="table-scroll">
          <table className="table responsive">
            <thead>
              <tr>
                <SortHeader label="Store" field="name" sort={sort} onSort={onSort} />
                <SortHeader label="Email" field="email" sort={sort} onSort={onSort} />
                <SortHeader label="Address" field="address" sort={sort} onSort={onSort} />
                <SortHeader label="Owner" field="owner" sort={sort} onSort={onSort} />
                <SortHeader label="Rating" field="rating" sort={sort} onSort={onSort} />
                <th />
              </tr>
            </thead>
            <tbody>
              {rows === null && [1, 2, 3].map((i) => (
                <tr key={i}><td><Skeleton width="80%" height={20} /></td><td><Skeleton width="70%" /></td><td><Skeleton width="60%" /></td><td><Skeleton width="50%" /></td><td><Skeleton width={110} /></td><td /></tr>
              ))}
              {rows && rows.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.025 }}>
                  <td className="td-main"><div className="cell-user"><Avatar name={s.name} /><span className="nm">{s.name}</span></div></td>
                  <td className="cell-muted" data-label="Email">{s.email}</td>
                  <td className="cell-muted" data-label="Address">{s.address || '—'}</td>
                  <td data-label="Owner">{s.owner_name ? <span className="owner-chip">{s.owner_name}</span> : <span className="cell-muted">Unassigned</span>}</td>
                  <td data-label="Rating">
                    {s.rating === null
                      ? <span className="cell-muted">No ratings</span>
                      : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><StarsStatic value={s.rating} size={14} /><b className="numeral">{formatRating(s.rating)}</b></span>}
                  </td>
                  <td className="td-action">
                    <div className="row-actions">
                      <button className="btn btn-sm" onClick={() => setEditStore(s)} title="Edit" aria-label={`Edit ${s.name}`}><Pencil size={14} /><span className="lbl">Edit</span></button>
                      <button className="btn btn-sm btn-danger" onClick={() => setDelStore(s)} title="Delete" aria-label={`Delete ${s.name}`}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows && rows.length === 0 && <EmptyState title="No stores found" note="Add your first store or adjust the filters." icon={StoreIcon} />}
      </div>

      <AddStoreModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={load} />
      <AddStoreModal open={!!editStore} store={editStore} onClose={() => setEditStore(null)} onCreated={load} />
      <ConfirmModal
        open={!!delStore}
        title="Delete store?"
        message={delStore ? `${delStore.name} and all of its ratings will be permanently removed. This cannot be undone.` : ''}
        onClose={() => setDelStore(null)}
        onConfirm={async () => { await deleteStore(delStore.id); toast.success('Store deleted'); setDelStore(null); load(); }}
      />
    </AppShell>
  );
}
