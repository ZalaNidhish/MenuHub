// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import RestaurantCard from '../components/RestaurantCard';
import './Home.css';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home">
      <div className="hero">
        <div className="container">
          <h1>Welcome to MenuHub</h1>
          <p>Discover amazing restaurants and their delicious menus</p>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search restaurants or cuisines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container">
        <h2 className="section-title">Featured Restaurants</h2>
        
        {loading ? (
          <div className="loading">Loading restaurants...</div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="no-restaurants">
            <p>No restaurants found</p>
          </div>
        ) : (
          <div className="restaurants-grid">
            {filteredRestaurants.map(restaurant => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;