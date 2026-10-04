import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStores from './pages/admin/AdminStores';
import UserStores from './pages/user/UserStores';
import OwnerDashboard from './pages/owner/OwnerDashboard';

const guard = (roles, element) => <ProtectedRoute roles={roles}>{element}</ProtectedRoute>;

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2800,
          style: {
            background: 'rgba(20, 18, 52, 0.95)',
            color: '#f5f4ff',
            border: '1px solid rgba(255,255,255,0.14)',
            fontSize: '13.5px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#07061a' } },
          error: { iconTheme: { primary: '#ff6b81', secondary: '#07061a' } }
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/admin" element={guard(['ADMIN'], <AdminDashboard />)} />
          <Route path="/admin/users" element={guard(['ADMIN'], <AdminUsers />)} />
          <Route path="/admin/stores" element={guard(['ADMIN'], <AdminStores />)} />

          <Route path="/stores" element={guard(['USER'], <UserStores />)} />
          <Route path="/owner" element={guard(['OWNER'], <OwnerDashboard />)} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
