import { useState } from 'react';
import Modal from './Modal';

// Generic "are you sure?" dialog for destructive actions.
export default function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirm();
    } catch (e) {
      setError(e?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {error && <div className="banner-error">{error}</div>}
      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>{message}</p>
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn-danger" onClick={run} disabled={loading}>
          {loading && <span className="spinner" />} {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
