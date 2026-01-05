import { useNavigate } from 'react-router-dom';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="restaurant-card"
      onClick={() => navigate(`/restaurant/${restaurant._id}`)}
    >
      <img 
        src={restaurant.image} 
        alt={restaurant.name}
        className="restaurant-image"
      />
      <div className="restaurant-info">
        <h3>{restaurant.name}</h3>
        <p className="cuisine">{restaurant.cuisine}</p>
        <p className="description">{restaurant.description}</p>
        <div className="restaurant-footer">
          <span className="rating">⭐ {restaurant.rating.toFixed(1)}</span>
          <span className="address">📍 {restaurant.address}</span>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;