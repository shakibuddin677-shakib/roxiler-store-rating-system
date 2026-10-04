import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import IconInput from '../components/IconInput';
import { useAuth } from '../context/AuthContext';
import { validateName, validateEmail, validateAddress, validatePassword } from '../utils/validators';
import { apiError } from '../utils/format';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password)
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      await signup(form);
      navigate('/stores', { replace: true });
    } catch (err) {
      setServerError(apiError(err, 'Could not sign up. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join to discover and rate stores.">
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {serverError && <div className="banner-error">{serverError}</div>}
        <IconInput icon="user" label="Full name" value={form.name} onChange={setField('name')} placeholder="20–60 characters" autoComplete="name" error={errors.name} hint={`${form.name.trim().length}/60 characters`} />
        <IconInput icon="mail" label="Email" type="email" value={form.email} onChange={setField('email')} placeholder="you@example.com" autoComplete="email" error={errors.email} />
        <IconInput icon="pin" label="Address" value={form.address} onChange={setField('address')} placeholder="Optional, up to 400 characters" autoComplete="street-address" error={errors.address} />
        <IconInput icon="lock" label="Password" type="password" value={form.password} onChange={setField('password')} placeholder="8–16 chars, 1 uppercase, 1 special" autoComplete="new-password" error={errors.password} />
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : <UserPlus size={17} />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="auth-foot">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
