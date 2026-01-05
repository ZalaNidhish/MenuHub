// frontend/src/pages/OwnerDashboard.jsx - SIMPLIFIED VERSION
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [restaurantData, setRestaurantData] = useState({
    name: '',
    description: '',
    cuisine: '',
    address: '',
    phone: '',
    image: ''
  });

  const [menuData, setMenuData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    image: '',
    isVegetarian: false
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Current user:', user);
      console.log('🔍 User restaurant ID:', user?.restaurant);
      
      // Method 1: If user has restaurant ID, fetch it directly
      if (user?.restaurant) {
        console.log('✅ User has restaurant ID, fetching...');
        try {
          const restaurantRes = await axios.get(`${API_URL}/api/restaurants/${user.restaurant}`);
          console.log('✅ Restaurant fetched:', restaurantRes.data);
          setRestaurant(restaurantRes.data);
          
          // Fetch menu items
          const menuRes = await axios.get(`${API_URL}/api/menu/restaurant/${user.restaurant}`);
          setMenuItems(menuRes.data);
          setLoading(false);
          return;
        } catch (err) {
          console.log('⚠️ Failed to fetch by ID, trying alternative method...');
        }
      }
      
      // Method 2: If no restaurant ID or fetch failed, search all restaurants
      console.log('🔍 Searching all restaurants for owner...');
      const allRestaurantsRes = await axios.get(`${API_URL}/api/restaurants`);
      const allRestaurants = allRestaurantsRes.data;
      
      console.log('📊 Total restaurants:', allRestaurants.length);
      console.log('🔍 Looking for restaurants owned by user ID:', user?.id);
      
      // Find restaurant where owner matches current user
      const myRestaurant = allRestaurants.find(r => {
        const ownerId = r.owner?._id || r.owner;
        console.log(`  Checking restaurant "${r.name}" - Owner ID: ${ownerId}`);
        return ownerId === user?.id || ownerId === user?._id;
      });
      
      if (myRestaurant) {
        console.log('✅ Found restaurant:', myRestaurant.name);
        setRestaurant(myRestaurant);
        
        // Fetch menu items
        const menuRes = await axios.get(`${API_URL}/api/menu/restaurant/${myRestaurant._id}`);
        setMenuItems(menuRes.data);
      } else {
        console.log('❌ No restaurant found for this user');
        setRestaurant(null);
      }
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('📝 Submitting restaurant...');
      
      if (restaurant) {
        // Update existing
        await axios.put(`${API_URL}/api/restaurants/${restaurant._id}`, restaurantData);
        alert('Restaurant updated successfully!');
      } else {
        // Create new
        const response = await axios.post(`${API_URL}/api/restaurants`, restaurantData);
        console.log('✅ Restaurant created:', response.data);
        alert('Restaurant created successfully!');
      }
      
      setShowRestaurantForm(false);
      
      // Refresh user data from server
      if (refreshUser) {
        await refreshUser();
      }
      
      // Reload data
      await fetchData();
      
    } catch (error) {
      console.error('❌ Error saving restaurant:', error);
      alert('Error saving restaurant: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`${API_URL}/api/menu/${editingItem._id}`, menuData);
        alert('Menu item updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/menu`, menuData);
        alert('Menu item added successfully!');
      }
      setShowMenuForm(false);
      setEditingItem(null);
      resetMenuForm();
      fetchData();
    } catch (error) {
      alert('Error saving menu item: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleToday = async (itemId) => {
    try {
      await axios.put(`${API_URL}/api/menu/${itemId}/toggle-today`);
      fetchData();
    } catch (error) {
      alert('Error toggling availability: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_URL}/api/menu/${itemId}`);
        alert('Menu item deleted successfully!');
        fetchData();
      } catch (error) {
        alert('Error deleting item: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEditMenuItem = (item) => {
    setEditingItem(item);
    setMenuData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      isVegetarian: item.isVegetarian
    });
    setShowMenuForm(true);
  };

  const resetMenuForm = () => {
    setMenuData({
      name: '',
      description: '',
      price: '',
      category: 'Main Course',
      image: '',
      isVegetarian: false
    });
  };

  const handleEditRestaurant = () => {
    setRestaurantData({
      name: restaurant.name,
      description: restaurant.description,
      cuisine: restaurant.cuisine,
      address: restaurant.address,
      phone: restaurant.phone,
      image: restaurant.image
    });
    setShowRestaurantForm(true);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="owner-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Owner Dashboard</h1>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              fetchData();
            }}
            style={{fontSize: '14px', padding: '8px 16px'}}
          >
            🔄 Refresh
          </button>
        </div>

        {!restaurant ? (
          <div className="no-restaurant">
            <h2>You don't have a restaurant yet</h2>
            <p>Create your restaurant to start managing your menu</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowRestaurantForm(true)}
            >
              Create Restaurant
            </button>
          </div>
        ) : (
          <>
            <div className="restaurant-section card">
              <div className="section-header">
                <h2>My Restaurant</h2>
                <button 
                  className="btn btn-secondary"
                  onClick={handleEditRestaurant}
                >
                  Edit Restaurant
                </button>
              </div>
              <div className="restaurant-info-grid">
                <div>
                  <img src={restaurant.image} alt={restaurant.name} className="restaurant-img" />
                </div>
                <div>
                  <h3>{restaurant.name}</h3>
                  <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
                  <p><strong>Address:</strong> {restaurant.address}</p>
                  <p><strong>Phone:</strong> {restaurant.phone}</p>
                  <p><strong>Description:</strong> {restaurant.description}</p>
                </div>
              </div>
            </div>

            <div className="menu-section card">
              <div className="section-header">
                <h2>Menu Items ({menuItems.length})</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingItem(null);
                    resetMenuForm();
                    setShowMenuForm(true);
                  }}
                >
                  Add Menu Item
                </button>
              </div>

              {menuItems.length === 0 ? (
                <div className="no-items" style={{textAlign: 'center', padding: '40px', color: '#666'}}>
                  <p>No menu items yet. Add your first item!</p>
                </div>
              ) : (
                <div className="menu-items-list">
                  {menuItems.map(item => (
                    <div key={item._id} className="menu-item">
                      <img src={item.image} alt={item.name} />
                      <div className="menu-item-details">
                        <h4>{item.name}</h4>
                        <p className="category">{item.category}</p>
                        <p className="description">{item.description}</p>
                        <p className="price">₹{item.price}</p>
                        <div className="badges">
                          {item.isVegetarian && <span className="badge badge-success">Veg</span>}
                          {item.isAvailableToday ? (
                            <span className="badge badge-success">Available Today</span>
                          ) : (
                            <span className="badge badge-danger">Not Available</span>
                          )}
                        </div>
                      </div>
                      <div className="menu-item-actions">
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleEditMenuItem(item)}
                        >
                          Edit
                        </button>
                        <button 
                          className={`btn ${item.isAvailableToday ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleToday(item._id)}
                        >
                          {item.isAvailableToday ? 'Remove from Today' : 'Add to Today'}
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeleteMenuItem(item._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Restaurant Form Modal - Same as before */}
        {showRestaurantForm && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{restaurant ? 'Edit Restaurant' : 'Create Restaurant'}</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowRestaurantForm(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleRestaurantSubmit}>
                <div className="form-group">
                  <label>Restaurant Name *</label>
                  <input
                    type="text"
                    value={restaurantData.name}
                    onChange={(e) => setRestaurantData({...restaurantData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cuisine *</label>
                  <input
                    type="text"
                    value={restaurantData.cuisine}
                    onChange={(e) => setRestaurantData({...restaurantData, cuisine: e.target.value})}
                    required
                    placeholder="e.g., Italian, Chinese, Indian"
                  />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={restaurantData.description}
                    onChange={(e) => setRestaurantData({...restaurantData, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    value={restaurantData.address}
                    onChange={(e) => setRestaurantData({...restaurantData, address: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="text"
                    value={restaurantData.phone}
                    onChange={(e) => setRestaurantData({...restaurantData, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={restaurantData.image}
                    onChange={(e) => setRestaurantData({...restaurantData, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {restaurant ? 'Update' : 'Create'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowRestaurantForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Menu Form Modal - Same as before */}
        {showMenuForm && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowMenuForm(false);
                    setEditingItem(null);
                    resetMenuForm();
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleMenuSubmit}>
                <div className="form-group">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    value={menuData.name}
                    onChange={(e) => setMenuData({...menuData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={menuData.description}
                    onChange={(e) => setMenuData({...menuData, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    value={menuData.price}
                    onChange={(e) => setMenuData({...menuData, price: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={menuData.category}
                    onChange={(e) => setMenuData({...menuData, category: e.target.value})}
                    required
                  >
                    <option value="Appetizer">Appetizer</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Side Dish">Side Dish</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    value={menuData.image}
                    onChange={(e) => setMenuData({...menuData, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={menuData.isVegetarian}
                      onChange={(e) => setMenuData({...menuData, isVegetarian: e.target.checked})}
                    />
                    Vegetarian
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? 'Update' : 'Add'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowMenuForm(false);
                      setEditingItem(null);
                      resetMenuForm();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;