import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isOwner } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isOwner) return '/owner/dashboard';
    return '/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            🍽️ MenuHub
          </Link>
          
          <div className="navbar-links">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="nav-link">
                  Dashboard
                </Link>
                <div className="user-menu">
                  {user?.picture && (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="user-avatar"
                    />
                  )}
                  <span className="user-name">{user?.name}</span>
                  <button onClick={handleLogout} className="btn btn-secondary">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;