import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import IconInput from './IconInput';
import { changePassword } from '../api/auth';
import { validatePassword } from '../utils/validators';
import { apiError } from '../utils/format';

const EMPTY = { oldPassword: '', newPassword: '', confirm: '' };

export default function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const close = () => { setForm(EMPTY); setErrors({}); setServerError(''); onClose(); };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const next = {
      oldPassword: form.oldPassword ? null : 'Enter your current password',
      newPassword: validatePassword(form.newPassword),
      confirm: form.confirm === form.newPassword ? null : 'Passwords do not match'
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      await changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      toast.success('Password updated');
      close();
    } catch (err) {
      setServerError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Update password" subtitle="Choose a strong password you don't use elsewhere.">
      <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {serverError && <div className="banner-error">{serverError}</div>}
        <IconInput icon="lock" label="Current password" type="password" value={form.oldPassword} onChange={set('oldPassword')} error={errors.oldPassword} autoComplete="current-password" />
        <IconInput icon="lock" label="New password" type="password" value={form.newPassword} onChange={set('newPassword')} error={errors.newPassword} hint="8–16 characters, one uppercase letter, one special character" autoComplete="new-password" />
        <IconInput icon="lock" label="Confirm new password" type="password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} autoComplete="new-password" />
        <div className="modal-actions">
          <button type="button" className="btn" onClick={close}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <span className="spinner" />} Update password
          </button>
        </div>
      </form>
    </Modal>
  );
}
