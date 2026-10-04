import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Store, KeyRound, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import ChangePasswordModal from './ChangePasswordModal';

const ROLE_LABEL = { ADMIN: 'Administrator', OWNER: 'Store Owner', USER: 'Member' };

const NAV = {
  ADMIN: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/stores', label: 'Stores', icon: Store }
  ],
  USER: [{ to: '/stores', label: 'Discover stores', icon: Store }],
  OWNER: [{ to: '/owner', label: 'My store', icon: LayoutDashboard }]
};

export default function AppShell({ title, subtitle, action, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app" data-role={user?.role}>
      <button className="menu-btn btn btn-icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
        <Menu size={20} />
      </button>

      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

      <aside className={`sidebar glass ${menuOpen ? 'open' : ''}`}>
        <div className="side-top">
          <div className="logo">
            <span className="logo-mark"><Sparkles size={18} /></span>
            <span className="logo-text">Ledger</span>
          </div>
          <button className="close-btn btn btn-icon" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="nav">
          {(NAV[user?.role] || []).map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-item" onClick={() => setMenuOpen(false)}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="side-bottom">
          <div className="me">
            <Avatar name={user?.name} />
            <div className="me-text">
              <span className="me-name">{user?.name}</span>
              <span className={`badge badge-${user?.role}`}>{ROLE_LABEL[user?.role]}</span>
            </div>
          </div>
          <button className="btn btn-block" onClick={() => setPwOpen(true)}>
            <KeyRound size={16} /> Update password
          </button>
          <button className="btn btn-block btn-danger" onClick={handleLogout}>
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="page-head">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </header>
        {children}
      </main>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  );
}
