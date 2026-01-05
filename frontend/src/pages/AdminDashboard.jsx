// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, restaurantsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`),
        axios.get(`${API_URL}/api/admin/users`),
        axios.get(`${API_URL}/api/admin/restaurants`)
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setRestaurants(restaurantsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        await axios.put(`${API_URL}/api/admin/users/${userId}/role`, { role: newRole });
        alert('Role updated successfully!');
        fetchData();
      } catch (error) {
        alert('Error updating role: ' + error.response?.data?.message);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/api/admin/users/${userId}`);
        alert('User deleted successfully!');
        fetchData();
      } catch (error) {
        alert('Error deleting user: ' + error.response?.data?.message);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`tab ${activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            Restaurants
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👨‍💼</div>
                <div className="stat-info">
                  <h3>{stats.totalOwners}</h3>
                  <p>Restaurant Owners</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🍽️</div>
                <div className="stat-info">
                  <h3>{stats.totalRestaurants}</h3>
                  <p>Total Restaurants</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats.activeRestaurants}</h3>
                  <p>Active Restaurants</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <h3>{stats.totalMenuItems}</h3>
                  <p>Total Menu Items</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="card">
              <h2>All Users ({users.length})</h2>
              <div className="table-responsive">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Restaurant</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-cell">
                            {user.picture && (
                              <img src={user.picture} alt={user.name} className="user-avatar-small" />
                            )}
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="role-select"
                          >
                            <option value="user">User</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>{user.restaurant?.name || 'N/A'}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'restaurants' && (
          <div className="restaurants-section">
            <div className="card">
              <h2>All Restaurants ({restaurants.length})</h2>
              <div className="restaurants-grid">
                {restaurants.map(restaurant => (
                  <div key={restaurant._id} className="restaurant-card-admin">
                    <img src={restaurant.image} alt={restaurant.name} />
                    <div className="restaurant-card-body">
                      <h3>{restaurant.name}</h3>
                      <p className="cuisine">{restaurant.cuisine}</p>
                      <p className="description">{restaurant.description}</p>
                      <div className="restaurant-meta">
                        <p><strong>Owner:</strong> {restaurant.owner?.name}</p>
                        <p><strong>Address:</strong> {restaurant.address}</p>
                        <p><strong>Phone:</strong> {restaurant.phone}</p>
                        <p><strong>Rating:</strong> ⭐ {restaurant.rating.toFixed(1)}</p>
                      </div>
                      <div className="restaurant-status">
                        <span className={`badge ${restaurant.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {restaurant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;