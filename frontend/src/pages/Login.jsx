import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import IconInput from '../components/IconInput';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils/validators';
import { apiError } from '../utils/format';

const HOME_BY_ROLE = { ADMIN: '/admin', USER: '/stores', OWNER: '/owner' };

// Matches backend/scripts/seed.js — handy for reviewers trying every role quickly.
const DEMOS = [
  { label: 'Admin', email: 'admin@example.com' },
  { label: 'Store owner', email: 'owner@example.com' },
  { label: 'Member', email: 'user1@example.com' }
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const next = { email: validateEmail(email), password: password ? null : 'Password is required' };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(HOME_BY_ROLE[user.role] || '/login', { replace: true });
    } catch (err) {
      setServerError(apiError(err, 'Could not log in. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue to your workspace.">
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {serverError && <div className="banner-error">{serverError}</div>}
        <IconInput icon="mail" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" error={errors.email} />
        <IconInput icon="lock" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" error={errors.password} />
        <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : <LogIn size={17} />}
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="demo-box">
        <p>Try a demo account</p>
        <div className="chips">
          {DEMOS.map((d) => (
            <button key={d.label} type="button" className="chip" onClick={() => { setEmail(d.email); setPassword('Test@1234'); setErrors({}); }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <p className="auth-foot">
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
