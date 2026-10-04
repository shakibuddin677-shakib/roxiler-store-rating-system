import { useState } from 'react';
import { User, Mail, Lock, MapPin, Eye, EyeOff, Shield } from 'lucide-react';

const ICONS = { user: User, mail: Mail, lock: Lock, pin: MapPin, role: Shield };

export default function IconInput({ icon, label, error, hint, as = 'input', children, type, ...rest }) {
  const [show, setShow] = useState(false);
  const Icon = ICONS[icon] || User;
  const isPassword = type === 'password';

  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <div className={error ? 'input-box has-error' : 'input-box'}>
        <Icon size={17} />
        {as === 'select' ? (
          <select {...rest}>{children}</select>
        ) : (
          <input {...rest} type={isPassword && show ? 'text' : type} />
        )}
        {isPassword && (
          <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility">
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
