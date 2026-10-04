import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Star, BarChart3 } from 'lucide-react';
import { StarsStatic } from './Stars';

const FEATURES = [
  { icon: ShieldCheck, title: 'Role-based access', text: 'Admins, store owners and members each get a purpose-built workspace.' },
  { icon: Star, title: 'Honest 1–5 ratings', text: 'Submit once, update any time — averages refresh instantly.' },
  { icon: BarChart3, title: 'Live insights', text: 'Dashboards, filters and sorting powered by a secure JWT API.' }
];

const float = (delay, dist) => ({
  animate: { y: [0, -dist, 0] },
  transition: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay }
});

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-shell" data-role="ADMIN">
      <section className="auth-hero">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

        <div className="logo">
          <span className="logo-mark"><Sparkles size={18} /></span>
          <span className="logo-text">Ledger</span>
        </div>

        <div className="hero-copy">
          <motion.h2 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Ratings that feel <span className="brand-gradient-text">as good</span> as the stores they celebrate.
          </motion.h2>
          <p>One platform for discovering stores, rating them and understanding feedback.</p>

          <ul className="hero-features">
            {FEATURES.map(({ icon: Icon, title: t, text }, i) => (
              <motion.li key={t} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.12 }}>
                <span className="f-icon"><Icon size={18} /></span>
                <div><strong>{t}</strong><span>{text}</span></div>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div className="float-card fc-1 glass" {...float(0, 10)}>
          <div className="fc-row"><span className="avatar sm av-2">S</span><strong>Sharma General Store</strong></div>
          <div className="fc-row"><StarsStatic value={4.6} size={14} /><span className="numeral">4.6</span></div>
        </motion.div>
        <motion.div className="float-card fc-2 glass" {...float(1.2, 12)}>
          <div className="fc-row"><span className="avatar sm av-3">G</span><strong>Green Valley Market</strong></div>
          <div className="fc-row"><StarsStatic value={4.2} size={14} /><span className="numeral">4.2</span></div>
        </motion.div>
      </section>

      <section className="auth-panel">
        <div className="logo auth-mobile-logo">
          <span className="logo-mark"><Sparkles size={18} /></span>
          <span className="logo-text">Ledger</span>
        </div>
        <motion.div
          className="auth-card glass"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-card-bar" />
          <div className="auth-card-inner">
            <h1>{title}</h1>
            {subtitle && <p className="auth-sub">{subtitle}</p>}
            <div className="auth-form">{children}</div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
