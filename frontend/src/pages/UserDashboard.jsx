// frontend/src/pages/UserDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/restaurants`);
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p>Explore restaurants and discover their menus</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🍽️</div>
            <div className="stat-info">
              <h3>{restaurants.length}</h3>
              <p>Restaurants Available</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>{user?.role}</h3>
              <p>Account Type</p>
            </div>
          </div>
        </div>

        <div className="section">
          <h2>All Restaurants</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="restaurants-list">
              {restaurants.map(restaurant => (
                <div 
                  key={restaurant._id} 
                  className="restaurant-item"
                  onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                >
                  <img src={restaurant.image} alt={restaurant.name} />
                  <div className="restaurant-details">
                    <h3>{restaurant.name}</h3>
                    <p className="cuisine">{restaurant.cuisine}</p>
                    <p className="description">{restaurant.description}</p>
                    <div className="restaurant-meta">
                      <span>⭐ {restaurant.rating.toFixed(1)}</span>
                      <span>📍 {restaurant.address}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;