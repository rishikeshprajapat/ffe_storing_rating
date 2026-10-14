import { Navigate, Route, Routes } from 'react-router-dom';
import { homeFor, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/AdminDashboard';
import UserStores from './pages/UserStores';
import OwnerDashboard from './pages/OwnerDashboard';

export default function App() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to={user ? homeFor(user.role) : '/login'} replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/stores" element={<ProtectedRoute roles={['user']}><UserStores /></ProtectedRoute>} />
          <Route path="/owner" element={<ProtectedRoute roles={['store_owner']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/password" element={<ProtectedRoute roles={['user', 'store_owner', 'admin']}><ChangePassword /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
