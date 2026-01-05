// frontend/src/components/MenuView.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './MenuView.css';

const MenuView = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchData();
  }, [id, showTodayOnly]);

  const fetchData = async () => {
    try {
      const [restaurantRes, menuRes] = await Promise.all([
        axios.get(`${API_URL}/api/restaurants/${id}`),
        axios.get(`${API_URL}/api/menu/restaurant/${id}${showTodayOnly ? '/today' : ''}`)
      ]);

      setRestaurant(restaurantRes.data);
      setMenuItems(menuRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading menu...</div>;
  }

  if (!restaurant) {
    return <div className="loading">Restaurant not found</div>;
  }

  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="menu-view">
      <div className="restaurant-header">
        <img src={restaurant.image} alt={restaurant.name} />
        <div className="header-info">
          <h1>{restaurant.name}</h1>
          <p className="cuisine">{restaurant.cuisine}</p>
          <p className="description">{restaurant.description}</p>
          <p className="address">📍 {restaurant.address}</p>
          <p className="phone">📞 {restaurant.phone}</p>
        </div>
      </div>

      <div className="container">
        <div className="menu-controls">
          <h2>Menu</h2>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showTodayOnly}
              onChange={(e) => setShowTodayOnly(e.target.checked)}
            />
            Show Today's Menu Only
          </label>
        </div>

        {Object.keys(groupedMenu).length === 0 ? (
          <div className="no-items">No menu items available</div>
        ) : (
          Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category} className="menu-category">
              <h3>{category}</h3>
              <div className="menu-items-grid">
                {items.map(item => (
                  <div key={item._id} className="menu-item-card">
                    <img src={item.image} alt={item.name} />
                    <div className="item-info">
                      <div className="item-header">
                        <h4>{item.name}</h4>
                        <span className="price">₹{item.price}</span>
                      </div>
                      <p className="item-description">{item.description}</p>
                      <div className="item-badges">
                        {item.isVegetarian && (
                          <span className="badge badge-success">🥬 Veg</span>
                        )}
                        {item.isAvailableToday && (
                          <span className="badge badge-warning">✓ Available Today</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuView;