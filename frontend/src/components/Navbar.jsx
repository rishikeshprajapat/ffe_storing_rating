import { Link, useNavigate } from 'react-router-dom';
import { homeFor, useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const onLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="navbar">
      <Link to="/" className="brand">★ StoreRatings</Link>
      <nav>
        {user ? (
          <>
            <Link to={homeFor(user.role)}>Dashboard</Link>
            <Link to="/password">Change Password</Link>
            <span className="muted">{user.name} ({user.role.replace('_', ' ')})</span>
            <button className="btn btn-outline" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
