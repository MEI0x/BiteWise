import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './index.css';
// 1. Import it at the top of App.jsx or Dashboard.jsx
import AccountSettings from './components/AccountSettings';
import { ITEM_EMOJIS, PREDEFINED_ITEMS, GROCERY_CATALOG } from './utils/constants';
import { styles } from './styles';



function App() {
  // --- AUTHENTICATION STATE ---
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // --- APPLICATION NAVIGATION & MAIN STATE ---
  const [currentTab, setCurrentTab] = useState('pantry');
  const [pantryItems, setPantryItems] = useState([]);
  const [pantryLoading, setPantryLoading] = useState(true);
  const [pantryName, setPantryName] = useState('');
  const [pantryQuantity, setPantryQuantity] = useState('1');
  const [pantryUnit, setPantryUnit] = useState('pieces');
  const [pantryExpiry, setPantryExpiry] = useState('');

  const [shoppingItems, setShoppingItems] = useState([]);
  const [shoppingLoading, setShoppingLoading] = useState(true);
  const [shopName, setShopName] = useState('');
  const [shopQuantity, setShopQuantity] = useState('1');
  const [shopUnit, setShopUnit] = useState('pieces');

  // --- SEARCH AND FILTER STATE ---
  const [pantrySearch, setPantrySearch] = useState('');
  const [pantryFilter, setPantryFilter] = useState('all'); // 'all', 'expired', 'soon'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'Fresh Produce', 'Meat', etc.

  // --- PREDEFINED ITEM AUTOCOMPLETE STATES ---
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCustomItem, setIsCustomItem] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // Trigger content loading automatically when the token changes/exists
  useEffect(() => {
    if (token) {
      fetchPantry();
      fetchShopping();
    }
  }, [token]);

  // Closes search dropdown menu wrapper if user clicks outside form layout boundaries
  useEffect(() => {
    const closeTrap = (e) => {
      if (!e.target.closest('form')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', closeTrap);
    return () => document.removeEventListener('click', closeTrap);
  }, []);

  // --- HELPER: GET AUTH HEADERS CONFIG ---
  const getAuthConfig = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // --- HELPER: CALCULATE EXPIRATION STATUS ---
  const getExpiryStatus = (expiryDateString) => {
    if (!expiryDateString) return { color: '#64748b', badge: null, isExpired: false };

    // Get midnight of today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get midnight of the item's expiry date
    const expiryDate = new Date(expiryDateString);
    expiryDate.setHours(0, 0, 0, 0);

    // Calculate difference in milliseconds, then convert to total days
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { color: '#ef4444', badge: '🚨 EXPIRED', isExpired: true };
    } else if (diffDays === 0) {
      return { color: '#df2020', badge: '⚠️ EXPIRES TODAY', isExpired: true };
    } else if (diffDays <= 3) {
      return { color: '#f97316', badge: `⏳ Expiring in ${diffDays}d`, isExpired: false };
    }

    // Default safe state
    return { color: '#64748b', badge: null, isExpired: false };
  };

  // --- AUTH HANDLERS ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
  
    // 1. Check if fields are empty first
    if (!authEmail.trim() || !authPassword.trim()) {
      return setAuthError("Please fill out all basic credentials.");
    }
  
    // 2. Validate email structure
    // 💡 Wrap the email format check so it ONLY runs when a user is signing up for a brand new account!
    if (authMode === 'register') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(authEmail)) {
      return setAuthError("Please enter a valid email structure.");
    }
  }
    
    // 2b. Validate strong password structure (Registration Only)
    if (authMode === 'register') {
    // Regex: Requires >= 1 uppercase, >= 1 number, >= 1 special char, min 8 chars total
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  
      if (!passwordRegex.test(authPassword)) {
        return setAuthError(
          "Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character."
        );
      }
    }

    // 3. Process backend requests safely inside a single async block
    try {
      let response;
      if (authMode === 'login') {
        response = await axios.post('http://localhost:5000/api/auth/login', {
          identifier: authEmail,
          password: authPassword
        });
      } else {
        if (!authUsername.trim()) {
          return setAuthError("Username is required for registration.");
        }
        response = await axios.post('http://localhost:5000/api/auth/register', {
          username: authUsername,
          email: authEmail,
          password: authPassword
        });
      }
  
      // 4. Save credentials into React State and browser LocalStorage
      if (response.data && response.data.token) {
        const receivedToken = response.data.token;
        const receivedUser = response.data.user;
  
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(receivedUser));
  
        setToken(receivedToken);
        setUser(receivedUser);
  
        // Reset form variables
        setAuthUsername('');
        setAuthEmail('');
        setAuthPassword('');
      }
  
    } catch (err) {
      console.error("Auth Error:", err);
      setAuthError(err.response?.data?.error || err.response?.data?.message || "Authentication failed. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setPantryItems([]);
    setShoppingItems([]);
  };

  // --- SECURED FETCH FUNCTIONS ---
  const fetchPantry = async () => {
    try {
      setPantryLoading(true);
      const response = await axios.get('http://localhost:5000/api/pantry', getAuthConfig());
      setPantryItems(response.data);
      setPantryLoading(false);
    } catch (error) {
      console.error(error);
      setPantryLoading(false);
    }
  };

  const fetchShopping = async () => {
    try {
      setShoppingLoading(true);
      const response = await axios.get('http://localhost:5000/api/shopping', getAuthConfig());
      setShoppingItems(response.data);
      setShoppingLoading(false);
    } catch (error) {
      console.error(error);
      setShoppingLoading(false);
    }
  };

  // --- SECURED PANTRY CRUD HANDLERS ---
  const handlePantrySubmit = async (e) => {
    e.preventDefault();
    let finalName = pantryName;

    // If they picked the custom input flag option, prompt them for the unique name
    if (pantryName === "custom_input") {
      const { value: customName } = await Swal.fire({
        title: 'Enter Custom Item Name',
        input: 'text',
        inputPlaceholder: 'e.g., Avocados, Hot Sauce...',
        showCancelButton: true
      });
      
      if (!customName) {
        setPantryName('');
        return; // User canceled out
      }
      finalName = customName;
    }

    if (!finalName.trim()) {
      return Swal.fire({ icon: 'warning', title: 'Missing Name', text: 'Please choose or type an item name.' });
    }

    // Run our existing smart fuzzy metadata matching engine automatically!
    const metaData = autoDetectCategory(finalName);

    try {
      const newItem = { 
        name: finalName, 
        quantity: parseFloat(pantryQuantity), 
        unit: pantryUnit, 
        expiration_date: pantryExpiry || null,
        category: metaData.cat,
        subcategory: metaData.sub
      };
      
      const response = await axios.post('http://localhost:5000/api/pantry', newItem, getAuthConfig());
      setPantryItems([...pantryItems, response.data]);
      
      // Clear values back to clean form defaults
      setPantryName(''); 
      setPantryQuantity('1'); 
      setPantryExpiry('');
    } catch (error) {
      console.error(error);
    }
  };

  const handlePantryDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This item will be permanently removed from your kitchen inventory!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/pantry/${id}`, getAuthConfig());
      setPantryItems(pantryItems.filter(item => item.id !== id));
      
      Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Item has been purged.', timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error(error);
    }
  };

  const handleMoveToList = async (id) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/pantry/move-to-list/${id}`, {}, getAuthConfig());
      setPantryItems(pantryItems.filter(item => item.id !== id));
      setShoppingItems([response.data.shoppingItem, ...shoppingItems]);
    } catch (error) {
      console.error(error);
    }
  };

  // --- SECURED SHOPPING CRUD HANDLERS ---
  const handleShoppingSubmit = async (e) => {
    e.preventDefault();
    if (!pantryName.trim()) {
      return Swal.fire({ icon: 'warning', title: 'Missing Name', text: 'Please enter a valid item name before adding.', confirmButtonColor: '#2e7d32' });
    }
    try {
      const newItem = { name: shopName, quantity: parseFloat(shopQuantity), unit: shopUnit };
      const response = await axios.post('http://localhost:5000/api/shopping', newItem, getAuthConfig());
      setShoppingItems([response.data, ...shoppingItems]);
      setShopName(''); setShopQuantity('1');
    } catch (error) {
      console.error(error);
    }
  };

  const handleTogglePurchased = async (id, currentStatus) => {
    let actualQuantity = undefined;
    let actualExpiry = null;

    if (!currentStatus) {
      const targetItem = shoppingItems.find(item => item.id === id);
      
      // Multi-Input Custom HTML Form Alert Modal
      const { value: formValues } = await Swal.fire({
        title: `🛒 Restock "${targetItem.name}"`,
        html: `
          <div style="text-align: left; font-family: inherit;">
            <label style="font-weight: 600; font-size: 0.9em; color: #475569; display: block; margin-bottom: 4px;">Quantity Securing (${targetItem.unit})</label>
            <input id="swal-input-qty" type="number" step="any" class="swal2-input" value="${targetItem.quantity}" style="margin: 0 0 16px 0; width: 100%; box-sizing: border-box; border-radius: 6px;">
            
            <label style="font-weight: 600; font-size: 0.9em; color: #475569; display: block; margin-bottom: 4px;">Batch Expiration Date</label>
            <input id="swal-input-date" type="date" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box; border-radius: 6px;">
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirm & Restock',
        confirmButtonColor: '#0288d1',
        cancelButtonColor: '#94a3b8',
        preConfirm: () => {
          // Extract the data variables out of the custom HTML string layout block
          const qtyVal = document.getElementById('swal-input-qty').value;
          const dateVal = document.getElementById('swal-input-date').value;
          
          const parsedQty = parseFloat(qtyVal);
          if (isNaN(parsedQty) || parsedQty <= 0) {
            Swal.showValidationMessage('Please enter a valid quantity greater than 0');
            return false;
          }
          
          return { quantity: parsedQty, expiryDate: dateVal || null };
        }
      });

      // If user cancels or closes out of the layout block, exit early
      if (!formValues) return;

      actualQuantity = formValues.quantity;
      actualExpiry = formValues.expiryDate;
    }

    try {
      const targetItem = shoppingItems.find(item => item.id === id);
      const metaData = autoDetectCategory(targetItem.name);

      const response = await axios.put(
        `http://localhost:5000/api/shopping/${id}`, 
        { 
          is_purchased: !currentStatus, 
          actual_quantity: actualQuantity,
          actual_expiry: actualExpiry, // Transmit the calendar input to the backend
          category: metaData.cat,
          subcategory: metaData.sub
        }, 
        getAuthConfig()
      );
      
      setShoppingItems(shoppingItems.map(item => item.id === id ? response.data : item));
      
      if (!currentStatus) {
        Swal.fire({ icon: 'success', title: 'Stocked into pantry!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      }
      fetchPantry(); 
    } catch (error) {
      console.error(error);
    }
  };

  const handleShoppingDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/shopping/${id}`, getAuthConfig());
      setShoppingItems(shoppingItems.filter(item => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateQuantity = async (id, newQuantity) => {
    // If the field is entirely blanked out while editing, fallback to 0 safely
    const parsedQty = newQuantity === '' ? 0 : parseFloat(newQuantity);
    if (isNaN(parsedQty) || parsedQty < 0) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/pantry/${id}/quantity`, 
        { quantity: parsedQty }, 
        getAuthConfig()
      );
      
      // Force convert response data parameters to raw numbers to keep React state aligned
      const updatedData = {
        ...response.data,
        quantity: Number(response.data.quantity)
      };

      // Synchronize state array
      setPantryItems(pantryItems.map(item => item.id === id ? updatedData : item));
    } catch (error) {
      console.error("Failed to execute inline inventory balance adjustment:", error);
    }
  };

  // ==========================================
  // RENDER PATTERN A: GATEKEEPER LOGIN PANEL
  // ==========================================
  if (!token) {
    return (
      <div style={styles.authWrapper}>
        <div style={styles.authCard}>
          <h2 style={{ textAlign: 'center', margin: '0 0 8px 0', fontSize: '1.8em' }}>🍏 BiteWise</h2>
          <p style={{ textAlign: 'center', color: '#64748b', margin: '0 0 24px 0' }}>
            {authMode === 'login' ? 'Sign in to access your kitchen storage' : 'Establish a new planning account'}
          </p>

          {authError && <div style={styles.errorAlert}>⚠️ {authError}</div>}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {authMode === 'register' && (
              <input 
                type="text" placeholder="Username" value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)} style={styles.inputField}
              />
            )}
            <input 
  type="text"                  
  placeholder="Username or Email Address" 
  value={authEmail}            
  onChange={(e) => setAuthEmail(e.target.value)} 
  style={styles.inputField}
/>
            <div style={{ position: 'relative', marginBottom: '15px' }}>
  <label style={styles.inputLabel}>Password</label>
  <input
    type={showPassword ? "text" : "password"} 
    placeholder="Enter your secure password"
    value={authPassword}
    onChange={(e) => setAuthPassword(e.target.value)}
    style={styles.formInput}
    required
  />
  
  {/* 👁️ The Toggle Checkbox/Link */}
  <div style={{ display: 'flex', alignItems: 'center', marginTop: '6px', gap: '6px' }}>
    <input 
      type="checkbox" 
      id="togglePassword"
      checked={showPassword} 
      onChange={() => setShowPassword(!showPassword)} 
      style={{ cursor: 'pointer' }}
    />
    <label htmlFor="togglePassword" style={{ fontSize: '0.85em', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}>
      Show Password
    </label>
  </div>
</div>
            
            <button type="submit" className="btn-animate" style={styles.authSubmitBtn}>
              {authMode === 'login' ? 'Authenticate Login' : 'Register Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9em' }}>
            {authMode === 'login' ? (
              <p style={{ margin: 0 }}>New client? <span onClick={() => { setAuthMode('register'); setAuthError(''); }} style={styles.switchLink}>Create an account</span></p>
            ) : (
              <p style={{ margin: 0 }}>Existing user? <span onClick={() => { setAuthMode('login'); setAuthError(''); }} style={styles.switchLink}>Sign back in</span></p>
            )}
          </div>
        </div>
      </div>
    );
  }



  // --- EXECUTIVE ANALYTICS ENGINE ---
  const totalPantryItems = pantryItems.length;

  const expiredCount = pantryItems.filter(item => {
    const status = getExpiryStatus(item.expiration_date);
    return status.badge === '🚨 EXPIRED' || status.badge === '⚠️ EXPIRES TODAY';
  }).length;

  const expiringSoonCount = pantryItems.filter(item => {
    const status = getExpiryStatus(item.expiration_date);
    return status.badge && status.badge.includes('⏳');
  }).length;

  const remainingShoppingItems = shoppingItems.filter(item => !item.is_purchased).length;
  
  
  // --- RUNTIME FILTER ENGINE ---
  const filteredPantryItems = pantryItems.filter(item => {
    // 1. Apply Fuzzy Search Filter
    const matchesSearch = item.name.toLowerCase().includes(pantrySearch.toLowerCase());

    // 2. Apply Expiration Type Filter
    const status = getExpiryStatus(item.expiration_date);
    let matchesExpiry = true;
    if (pantryFilter === 'expired') {
      matchesExpiry = (status.badge === '🚨 EXPIRED' || status.badge === '⚠️ EXPIRES TODAY');
    } else if (pantryFilter === 'soon') {
      matchesExpiry = (status.badge && status.badge.includes('⏳'));
    }

    // 3. NEW: Apply Category Group Filter (Checks main container names or subcategories)
    const itemCat = item.category || '🥫 Center Store (Pantry Staples)';
    let matchesCategory = true;
    if (categoryFilter !== 'all') {
      matchesCategory = itemCat.toLowerCase().includes(categoryFilter.toLowerCase());
    }

    return matchesSearch && matchesExpiry && matchesCategory;
  });
  
  
  
  
  // ==========================================
  // RENDER PATTERN B: MAIN APP DASHBOARD
  // ==========================================
  return (
    <div style={styles.appContainer}>
      {/* HEADER BAR */}
      <header style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={styles.brandTitle}>🍏 BiteWise</h1>
            <p style={styles.brandSubtitle}>Intelligent Kitchen & Grocery Coordination</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={styles.userGreeting}>👤 User: <strong>{user?.username}</strong></span>
            <button onClick={handleLogout} className="btn-animate" style={styles.logoutBtn}>Sign Out</button>
          </div>
        </div>
      </header>
      
      {/* NAVIGATION TABS */}
      <div style={styles.tabContainer}>
        <button 
          onClick={() => setCurrentTab('pantry')} className="btn-animate"
          style={{
            ...styles.tabButton,
            backgroundColor: currentTab === 'pantry' ? '#2e7d32' : '#ffffff',
            color: currentTab === 'pantry' ? '#ffffff' : '#64748b',
            border: currentTab === 'pantry' ? 'none' : '1px solid #e2e8f0',
          }}
        >
          📦 Inventory Pantry
        </button>
        <button 
          onClick={() => setCurrentTab('shopping')} className="btn-animate"
          style={{
            ...styles.tabButton,
            backgroundColor: currentTab === 'shopping' ? '#0288d1' : '#ffffff',
            color: currentTab === 'shopping' ? '#ffffff' : '#64748b',
            border: currentTab === 'shopping' ? 'none' : '1px solid #e2e8f0',
          }}
        >
          📝 Grocery List
        </button>
      </div>
  
      <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', marginBottom: '30px' }} />
  
      {/* EXECUTIVE DASHBOARD ANALYTICS BANNER */}
      <div style={styles.dashboardGrid}>
        <div style={{ ...styles.statCard, borderTop: '4px solid #475569' }}>
          <div style={styles.statLabel}>📦 Total Inventory</div>
          <div style={styles.statValue}>{totalPantryItems}</div>
        </div>
        
        <div style={{ 
          ...styles.statCard, 
          borderTop: '4px solid #ef4444',
          backgroundColor: expiredCount > 0 ? '#fef2f2' : '#ffffff' 
        }}>
          <div style={{ ...styles.statLabel, color: expiredCount > 0 ? '#991b1b' : '#475569' }}>🚨 Expired Items</div>
          <div style={{ ...styles.statValue, color: expiredCount > 0 ? '#b91c1c' : '#0f172a' }}>{expiredCount}</div>
        </div>
  
        <div style={{ 
          ...styles.statCard, 
          borderTop: '4px solid #f97316',
          backgroundColor: expiringSoonCount > 0 ? '#fff7ed' : '#ffffff'
        }}>
          <div style={{ ...styles.statLabel, color: expiringSoonCount > 0 ? '#9a3412' : '#475569' }}>⏳ Use Within 3 Days</div>
          <div style={{ ...styles.statValue, color: expiringSoonCount > 0 ? '#c2410c' : '#0f172a' }}>{expiringSoonCount}</div>
        </div>
  
        <div style={{ ...styles.statCard, borderTop: '4px solid #0288d1' }}>
          <div style={styles.statLabel}>🛒 Deficit Shopping Items</div>
          <div style={styles.statValue}>{remainingShoppingItems}</div>
        </div>
      </div>    
  
      {/* PANTRY INVENTORY MODULE */}
      {currentTab === 'pantry' && (
        <div>
          {/* THE FORM STARTS HERE */}
          <form 
            onSubmit={handlePantrySubmit} 
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px' }}
          >
            {/* 1. AUTOCOMPLETE SEARCHABLE PRODUCT SELECTOR */}
            <div style={{ flex: '2', minWidth: '220px', position: 'relative' }}>
              <label style={styles.inputLabel}>Select or Search Item</label>
              <input
                type="text"
                placeholder="🔍 Type to search food list..."
                value={isCustomItem ? pantryName : dropdownSearch}
                disabled={isCustomItem}
                onFocus={() => { if (!isCustomItem) setShowSuggestions(true); }}
                onChange={(e) => {
                  setDropdownSearch(e.target.value);
                  setShowSuggestions(true);
                  setPantryName('');
                }}
                style={styles.formInput}
              />
  
              {isCustomItem && (
                <button 
                  type="button" 
                  onClick={() => { setIsCustomItem(false); setPantryName(''); setDropdownSearch(''); }}
                  style={{ position: 'absolute', right: '10px', top: '32px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}
                >
                  ❌ Use List
                </button>
              )}
  
              {showSuggestions && !isCustomItem && (
                <div style={styles.autocompleteOverlayCard}>
                  <div 
                    onClick={() => {
                      setIsCustomItem(true);
                      setShowSuggestions(false);
                      Swal.fire({
                        title: 'Enter Custom Item Name',
                        input: 'text',
                        inputPlaceholder: 'e.g., Turkish Delight, Hot Sauce...',
                        showCancelButton: true
                      }).then((result) => {
                        if (result.value) {
                          setPantryName(result.value);
                        } else {
                          setIsCustomItem(false);
                        }
                      });
                    }}
                    style={{ ...styles.suggestionRowItem, color: '#0288d1', fontWeight: '600', borderBottom: '2px solid #e2e8f0' }}
                  >
                    ➕ Name not on list? Create Custom Item...
                  </div>
  
                  {PREDEFINED_ITEMS.filter(prod => 
                    prod.name.toLowerCase().includes(dropdownSearch.toLowerCase())
                  ).map((prod) => (
                    <div
                      key={prod.name}
                      onClick={() => {
                        setPantryName(prod.name);
                        setDropdownSearch(prod.name);
                        setShowSuggestions(false);
  
                        const lowerName = prod.name.toLowerCase();
                        if (['milk', 'juice', 'broth', 'water', 'vinegar', 'oil', 'cream', 'seltzer'].some(k => lowerName.includes(k))) {
                          setPantryUnit('Liters');
                        } else if (['egg', 'bread', 'waffles', 'bars', 'pizza', 'burritos', 'bags', 'pods'].some(k => lowerName.includes(k))) {
                          setPantryUnit('Pieces');
                        } else {
                          setPantryUnit('Kilograms');
                        }
                      }}
                      style={styles.suggestionRowItem}
                    >
                      {prod.label}
                    </div>
                  ))}
  
                  {PREDEFINED_ITEMS.filter(prod => prod.name.toLowerCase().includes(dropdownSearch.toLowerCase())).length === 0 && (
                    <div style={{ padding: '10px', color: '#64748b', fontSize: '0.85em', textAlign: 'center' }}>No matches. Click the custom option at the top!</div>
                  )}
                </div>
              )}
            </div>
  
            {/* 2. QUANTITY INPUT FIELD */}
            <div style={{ flex: '1', minWidth: '100px' }}>
              <label style={styles.inputLabel}>Quantity</label>
              <input 
                type="number" 
                step="any"
                min="0.01"
                value={pantryQuantity}
                onChange={(e) => setPantryQuantity(e.target.value)}
                style={styles.formInput} 
                required
              />
            </div>
  
            {/* 3. UNIT SELECTOR DROPDOWN */}
            <div style={{ flex: '1', minWidth: '110px' }}>
              <label style={styles.inputLabel}>Unit</label>
              <select
                value={pantryUnit}
                onChange={(e) => setPantryUnit(e.target.value)}
                style={styles.formSelectInput}
              >
                <option value="Kilograms">Kilograms</option>
                <option value="Liters">Liters</option>
                <option value="Pieces">Pieces</option>
                <option value="Packs">Packs</option>
              </select>
            </div>
  
            {/* 4. EXPIRATION DATE PICKER */}
            <div style={{ flex: '1.5', minWidth: '150px' }}>
              <label style={styles.inputLabel}>Expiration Date</label>
              <input 
                type="date"
                value={pantryExpiry}
                onChange={(e) => setPantryExpiry(e.target.value)}
                style={styles.formInput}
              />
            </div>
  
            {/* 5. SUBMIT BUTTON */}
            <div style={{ flex: '1', minWidth: '120px' }}>
              <button type="submit" style={styles.addItemSubmitBtn}>
                Add to Stock
              </button>
            </div>
          </form>
  
          <h3>Current Stock Balance</h3>
  
          {/* GLOBAL SEARCH & CATEGORY CONTROLS */}
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <div style={{ marginBottom: '12px' }}>
              <input 
                type="text" 
                placeholder="🔍 Search pantry items..." 
                value={pantrySearch}
                onChange={(e) => setPantrySearch(e.target.value)}
                style={styles.searchBar}
              />
            </div>
  
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <button onClick={() => setPantryFilter('all')} style={{ ...styles.filterTabBtn, backgroundColor: pantryFilter === 'all' ? '#e2e8f0' : '#ffffff', border: '1px solid #cbd5e1' }}>All Stock Condition</button>
              <button onClick={() => setPantryFilter('expired')} style={{ ...styles.filterTabBtn, backgroundColor: pantryFilter === 'expired' ? '#fef2f2' : '#ffffff', color: '#b91c1c', border: pantryFilter === 'expired' ? '1px solid #ef4444' : '1px solid #cbd5e1' }}>🔴 Expired ({expiredCount})</button>
              <button onClick={() => setPantryFilter('soon')} style={{ ...styles.filterTabBtn, backgroundColor: pantryFilter === 'soon' ? '#fff7ed' : '#ffffff', color: '#c2410c', border: pantryFilter === 'soon' ? '1px solid #f97316' : '1px solid #cbd5e1' }}>⏳ Urgent ({expiringSoonCount})</button>
            </div>
  
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <span style={{ fontSize: '0.8em', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginRight: '6px' }}>Filter Group:</span>
              {[
                { label: 'All Categories', value: 'all' },
                { label: '🍌 Produce', value: 'Fresh Produce' },
                { label: '🥩 Meat & Deli', value: 'Meat' },
                { label: '🧀 Dairy', value: 'Dairy' },
                { label: '🥫 Staples', value: 'Center Store' },
                { label: '☕ Beverages', value: 'Beverages' },
                { label: '🧻 Household', value: 'Household' }
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setCategoryFilter(pill.value)}
                  style={{
                    ...styles.categoryPillBtn,
                    backgroundColor: categoryFilter === pill.value ? '#0f172a' : '#ffffff',
                    color: categoryFilter === pill.value ? '#ffffff' : '#475569',
                    fontWeight: categoryFilter === pill.value ? '600' : '400',
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
  
          {pantryLoading ? (
            <p style={styles.infoText}>Querying inventory schema...</p>
          ) : filteredPantryItems.length === 0 ? (
            <p style={styles.infoText}>No matching inventory entries discovered.</p>
          ) : (
            <div style={styles.listContainer}>
              {filteredPantryItems.map((item) => {
                const status = getExpiryStatus(item.expiration_date);
                return (
                  <div 
                    key={item.id} 
                    className="card-item" 
                    style={{ 
                      ...styles.dataRow,
                      borderLeft: status.badge ? `5px solid ${status.color}` : '1px solid #e2e8f0'
                    }}
                  >
                    <div>
                      <span style={styles.itemName}>{item.name}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '12px', gap: '4px' }}>
                        <input 
                          type="number" 
                          step="any"
                          min="0"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                          style={styles.inlineQtyInput}
                        />
                        <span style={styles.unitLabel}>{item.unit}</span>
                      </span>
                      {item.expiration_date && (
                        <span style={{ ...styles.expiryTag, color: status.color, fontWeight: status.badge ? '600' : '400' }}>
                          📅 Exp: {new Date(item.expiration_date).toLocaleDateString()}
                          {status.badge && (
                            <span style={{ marginLeft: '8px', padding: '2px 6px', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.85em' }}>
                              {status.badge}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleMoveToList(item.id)} className="btn-animate" style={styles.actionBtnWarning}>
                        🔄 Depleted / Restock
                      </button>
                      <button onClick={() => handlePantryDelete(item.id)} className="btn-animate" style={styles.actionBtnDanger}>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
  
      {/* SHOPPING LIST MODULE */}
      {currentTab === 'shopping' && (
        <div>
          <div style={styles.formCardBlue}>
            <h4 style={{ margin: '0 0 12px 0', color: '#0a3044' }}>➕ Append Deficit Item</h4>
            <form onSubmit={handleShoppingSubmit} style={styles.formLayout}>
              <input 
                type="text" placeholder="Item Requirement... (e.g. Whole Milk)" value={shopName}
                onChange={(e) => setShopName(e.target.value)} style={styles.inputField}
              />
              <input 
                type="number" step="0.01" placeholder="Qty" value={shopQuantity}
                onChange={(e) => setShopQuantity(e.target.value)} style={styles.inputQty}
              />
              <select value={shopUnit} onChange={(e) => setShopUnit(e.target.value)} style={styles.selectField}>
                <option value="pieces">pieces</option>
                <option value="Liters">Liters</option>
                <option value="Grams">Grams</option>
                <option value="Kilograms">Kilograms</option>
                <option value="Packs">Packs</option>
              </select>
              <button type="submit" className="btn-animate" style={styles.submitBtnBlue}>Add to List</button>
            </form>
          </div>
  
          <h3 style={styles.sectionHeading}>Active Procurement Items</h3>
          {shoppingLoading ? (
            <p style={styles.infoText}>Loading purchase registries...</p>
          ) : shoppingItems.length === 0 ? (
            <p style={styles.infoText}>No shopping targets recorded.</p>
          ) : (
            <div style={styles.listContainer}>
              {shoppingItems.map((item) => (
                <div 
                  key={item.id} className="card-item"
                  style={{ 
                    ...styles.dataRow, 
                    backgroundColor: item.is_purchased ? '#f8fafc' : '#ffffff',
                    opacity: item.is_purchased ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="checkbox" checked={item.is_purchased} 
                      onChange={() => handleTogglePurchased(item.id, item.is_purchased)}
                      style={styles.checkbox}
                    />
                    <span style={{ 
                      ...styles.itemName,
                      textDecoration: item.is_purchased ? 'line-through' : 'none',
                      color: item.is_purchased ? '#94a3b8' : '#1e293b'
                    }}>
                      {item.name} <span style={{ fontWeight: '400', fontSize: '0.9em', color: '#64748b' }}>({item.quantity} {item.unit})</span>
                    </span>
                  </div>
                  <button onClick={() => handleShoppingDelete(item.id)} style={styles.inlineRemoveBtn}>
                    ❌
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
  
      {/* 🚨 ACCOUNT SETTINGS MODULE (Always accessible at the absolute bottom of the dashboard) */}
      <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', marginTop: '40px', marginBottom: '20px' }} />
      <AccountSettings />
  
    </div>
  );
}




// 3. MULTI-LAYER FUZZY DETECTION LOGIC ENGINE
const autoDetectCategory = (name) => {
  if (!name) return { icon: '📦', cat: '🥫 Center Store (Pantry Staples)', sub: 'Other' };
  
  const cleanName = name.toLowerCase().trim();
  let detectedIcon = '📦'; // Default fallback icon

  // Step A: Find the highly-specific custom item emoji first
  for (const itemKey in ITEM_EMOJIS) {
    if (cleanName.includes(itemKey)) {
      detectedIcon = ITEM_EMOJIS[itemKey];
      break; // Found the precise item emoji match, stop looking
    }
  }

  // Step B: Match structural layout categorization groups
  for (const groupKey in GROCERY_CATALOG) {
    const group = GROCERY_CATALOG[groupKey];
    const hasMatch = group.keywords.some(keyword => cleanName.includes(keyword));
    
    if (hasMatch) {
      return { icon: detectedIcon, cat: group.cat, sub: group.sub };
    }
  }

  // Final generic fallback if nothing matches
  return { icon: '📦', cat: '🥫 Center Store (Pantry Staples)', sub: 'Unassigned Items' };
};





export default App;