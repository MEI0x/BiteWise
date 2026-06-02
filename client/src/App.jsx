import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './index.css';

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
    
    if (!authEmail.trim() || !authPassword.trim()) {
      return setAuthError("Please fill out all basic credentials.");
    }

    try {
      let response;
      if (authMode === 'login') {
        response = await axios.post('http://localhost:5000/api/auth/login', {
          email: authEmail,
          password: authPassword
        });
      } else {
        if (!authUsername.trim()) return setAuthError("Username is required for registration.");
        response = await axios.post('http://localhost:5000/api/auth/register', {
          username: authUsername,
          email: authEmail,
          password: authPassword
        });
      }

      // Save credentials into React State and browser LocalStorage
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
    } catch (err) {
      console.error(err);
      setAuthError(err.response?.data?.message || "Authentication execution failed.");
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
              type="email" placeholder="Email Address" value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)} style={styles.inputField}
            />
            <input 
              type="password" placeholder="Account Password" value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)} style={styles.inputField}
            />
            
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
    <h3>Current Stock Balance</h3>

    {/* THE FORM STARTS HERE */}
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
            setPantryName(''); // Reset backend registration target until option clicked
          }}
          style={styles.formInput}
        />

        {/* CUSTOM ITEM CANCEL BUTTON OVERLAY */}
        {isCustomItem && (
          <button 
            type="button" 
            onClick={() => { setIsCustomItem(false); setPantryName(''); setDropdownSearch(''); }}
            style={{ position: 'absolute', right: '10px', top: '32px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}
          >
            ❌ Use List
          </button>
        )}

        {/* FLOATING DROPDOWN SUGGESTIONS LIST CONTAINER CARD */}
        {showSuggestions && !isCustomItem && (
          <div style={styles.autocompleteOverlayCard}>
            
            {/* INJECTED FALLBACK ROUTE ACTION TAB FOR DYNAMIC CUSTOM ENTRIES */}
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

            {/* ALPHABETICALLY FILTERED OPTION BLOCKS */}
            {PREDEFINED_ITEMS.filter(prod => 
              prod.name.toLowerCase().includes(dropdownSearch.toLowerCase())
            ).map((prod) => ( // Bound limits to top 15 results for ultra-clean look
              <div
                key={prod.name}
                onClick={() => {
                  setPantryName(prod.name);
                  setDropdownSearch(prod.name);
                  setShowSuggestions(false);

                  // Smart Unit Auto-Detection Triggers
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

    </form> {/* THE FORM SAFELY CLOSES HERE */}

          <div>
          <h3>Current Stock Balance</h3>

          {/* GLOBAL SEARCH & CATEGORY CONTROLS (NOW CORES AT THE TOP) */}
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            
            {/* ROW 1: FUZZY SEARCH BAR */}
            <div style={{ marginBottom: '12px' }}>
              <input 
                type="text" 
                placeholder="🔍 Search pantry items..." 
                value={pantrySearch}
                onChange={(e) => setPantrySearch(e.target.value)}
                style={styles.searchBar}
              />
            </div>

            {/* ROW 2: URGENCY FILTERS */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <button onClick={() => setPantryFilter('all')} style={{ ...styles.filterTabBtn, backgroundColor: pantryFilter === 'all' ? '#e2e8f0' : '#ffffff', border: '1px solid #cbd5e1' }}>All Stock Condition</button>
              <button onClick={() => setPantryFilter('expired')} style={{ ...styles.filterTabBtn, backgroundColor: pantryFilter === 'expired' ? '#fef2f2' : '#ffffff', color: '#b91c1c', border: pantryFilter === 'expired' ? '1px solid #ef4444' : '1px solid #cbd5e1' }}>🔴 Expired ({expiredCount})</button>
              <button onClick={() => setPantryFilter('soon')} style={{ ...styles.filterTabBtn, backgroundColor: pantryFilter === 'soon' ? '#fff7ed' : '#ffffff', color: '#c2410c', border: pantryFilter === 'soon' ? '1px solid #f97316' : '1px solid #cbd5e1' }}>⏳ Urgent ({expiringSoonCount})</button>
            </div>

            {/* ROW 3: CATEGORY DECK FILTER PILLS */}
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

            <div style={styles.filterButtonGroup}>
              <button 
                onClick={() => setPantryFilter('all')}
                style={{
                  ...styles.filterTabBtn,
                  backgroundColor: pantryFilter === 'all' ? '#e2e8f0' : 'transparent',
                  fontWeight: pantryFilter === 'all' ? '600' : '400'
                }}
              >
                All Stocks
              </button>
              <button 
                onClick={() => setPantryFilter('expired')}
                style={{
                  ...styles.filterTabBtn,
                  backgroundColor: pantryFilter === 'expired' ? '#fef2f2' : 'transparent',
                  color: '#b91c1c',
                  fontWeight: pantryFilter === 'expired' ? '600' : '400'
                }}
              >
                🔴 Expired ({expiredCount})
              </button>
              <button 
                onClick={() => setPantryFilter('soon')}
                style={{
                  ...styles.filterTabBtn,
                  backgroundColor: pantryFilter === 'soon' ? '#fff7ed' : 'transparent',
                  color: '#c2410c',
                  fontWeight: pantryFilter === 'soon' ? '600' : '400'
                }}
              >
                🟠 Urgent ({expiringSoonCount})
              </button>
            </div>
          </div>
          {/* Updated target source for mapping loop */}
          {pantryLoading ? (
            <p style={styles.infoText}>Querying inventory schema...</p>
          ) : filteredPantryItems.length === 0 ? (
            <p style={styles.infoText}>No matching inventory entries discovered.</p>
          ) : (
            <div style={styles.listContainer}>
              {filteredPantryItems.map((item) => { // ◄ Changed from pantryItems to filteredPantryItems
                const status = getExpiryStatus(item.expiration_date);
                return (
                  // ... rest of your item card code remains exactly identical
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
                        value={item.quantity === 0 ? '' : item.quantity} // Prevents a stubborn '0' from blocking fresh typing inputs
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
    </div>
  );
}


// 1. UNIQUE ITEM EMOJI REGISTRY
const ITEM_EMOJIS = {
  // --- FRUITS ---
  'apple': '🍎', 'banana': '🍌', 'strawberry': '🍓', 'blueberry': '🫐', 'cherry': '🍒',
  'lemon': '🍋', 'lime': '🍋', 'orange': '🍊', 'citrus': '🍊', 'melon': '🍈', 
  'watermelon': '🍉', 'avocado': '🥑', 'grape': '🍇', 'peach': '🍑', 'kiwi': '🥝', 'mango': '🥭',

  // --- VEGETABLES ---
  'potato': '🥔', 'carrot': '🥕', 'broccoli': '🥦', 'tomato': '🍅', 'onion': '🧅', 
  'garlic': '🧄', 'cucumber': '🥒', 'pepper': '🫑', 'corn': '🌽', 'mushroom': '🍄', 
  'cabbage': '🥬', 'lettuce': '🥬', 'spinach': '🥬', 'zucchini': '🥒', 'eggplant': '🍆',

  // --- MEAT & SEAFOOD ---
  'chicken': '🍗', 'turkey': '🦃', 'wing': '🍗', 'drumstick': '🍗', 'breast': '🥩',
  'beef': '🥩', 'steak': '🥩', 'mince': '🥩', 'burger': '🍔', 'lamb': '🥩',
  'pork': '🥓', 'bacon': '🥓', 'sausage': '🌭', 'pepperoni': '🍕', 'salami': '🥓', 'ham': '🍖',
  'salmon': '🐟', 'fish': '🐟', 'tuna': '🐟', 'shrimp': '🍤', 'prawn': '🍤', 'crab': '🦀', 'lobster': '🦞',

  // --- DAIRY & REFRIGERATED ---
  'milk': '🥛', 'butter': '🧈', 'cream': '🥛', 'yogurt': '🥛', 'ayran': '🥛', 'cacik': '🥣',
  'egg': '🥚', 'cheese': '🧀', 'cheddar': '🧀', 'mozzarella': '🧀', 'feta': '🧀', 'kasar': '🧀', 'peynir': '🧀',
  'almond milk': '🌱', 'oat milk': '🌱', 'soy milk': '🌱',

  // --- PANTRY STAPLES ---
  'rice': '🍚', 'oat': '🥣', 'quinoa': '🥣', 'bread': '🍞', 'tortilla': '🫓', 'flour': '🌾', 
  'sugar': '🍬', 'pasta': '🍝', 'spaghetti': '🍝', 'macaroni': '🍝', 'noodle': '🍜',
  'soup': '🥣', 'bean': '🫘', 'sauce': '🥫', 'paste': '🥫', 'canned': '🥫',
  'oil': '🍾', 'olive oil': '🫒', 'vinegar': '🍾', 'mayo': '🍾', 'ketchup': '🍅', 'mustard': '🍾',
  'salt': '🧂', 'pepper': '🧂', 'spice': '🌶️',

  // --- SNACKS & TREATS ---
  'chip': '🥔', 'nut': '🥜', 'popcorn': '🍿', 'cracker': '🫓', 'cookie': '🍪', 
  'chocolate': '🍫', 'biscuit': '🍪', 'sweet': '🍬', 'candy': '🍬', 'ice cream': '🍦', 'popsicle': '🍧',

  // --- BEVERAGES ---
  'coffee': '☕', 'bean': '🫘', 'tea': '🍵', 'cai': '🍵', 'espresso': '☕', 'hot chocolate': '☕',
  'water': '💧', 'juice': '🧃', 'soda': '🥤', 'cola': '🥤', 'sprite': '🥤', 'fanta': '🥤',
  'beer': '🍺', 'wine': '🍷', 'vodka': '🍾', 'whiskey': '🥃', 'raki': '🥛',

  // --- HOUSEHOLD & PET ---
  'toilet paper': '🧻', 'paper towel': '🧻', 'napkin': '🧻', 'tissue': '🧻',
  'soap': '🧼', 'detergent': '🧼', 'spray': '🧴', 'cleaner': '🧼', 'bleach': '🧴', 'sponge': '🧽',
  'shampoo': '🧴', 'toothpaste': '🪥', 'deodorant': '🧴', 'bandage': '🩹', 'medicine': '💊', 'vitamin': '💊',
  'cat food': '🐱', 'dog food': '🐶', 'pet': '🐾', 'treats': '🦴'
};
const PREDEFINED_ITEMS = [
  { label: "🥛 2% Milk", name: "2% Milk" },
  { label: "🧃 Apple juice", name: "Apple juice" },
  { label: "🌾 All-purpose flour", name: "All-purpose flour" },
  { label: "🌱 Almond butter", name: "Almond butter" },
  { label: "🌾 Almond flour", name: "Almond flour" },
  { label: "🌱 Almond milk", name: "Almond milk" },
  { label: "🧴 Aluminum foil", name: "Aluminum foil" },
  { label: "🧴 All-purpose cleaner spray", name: "All-purpose cleaner spray" },
  { label: "🥫 Anchovies", name: "Anchovies" },
  { label: "🧴 Antiperspirant", name: "Antiperspirant" },
  { label: "🍚 Arborio rice", name: "Arborio rice" },
  { label: "🥬 Arugula", name: "Arugula" },
  { label: "🐟 Atlantic salmon", name: "Atlantic salmon" },
  { label: "🥑 Avocado oil", name: "Avocado oil" },
  { label: "🧴 Baby formula", name: "Baby formula" },
  { label: "🧴 Baby food jars", name: "Baby food jars" },
  { label: "🧴 Baby lotion", name: "Baby lotion" },
  { label: "🧴 Baby shampoo", name: "Baby shampoo" },
  { label: "🧴 Baby wipes", name: "Baby wipes" },
  { label: "🥓 Bacon", name: "Bacon" },
  { label: "🥫 Baked beans", name: "Baked beans" },
  { label: "🌾 Baking powder", name: "Baking powder" },
  { label: "🌾 Baking soda", name: "Baking soda" },
  { label: "🍾 Balsamic vinegar", name: "Balsamic vinegar" },
  { label: "🍌 Bananas", name: "Bananas" },
  { label: "🧴 Bar soap", name: "Bar soap" },
  { label: "🔥 Barbecue sauce", name: "Barbecue sauce" },
  { label: "🥣 Barley", name: "Barley" },
  { label: "🍐 Bartlett pears", name: "Bartlett pears" },
  { label: "🍚 Basmati rice", name: "Basmati rice" },
  { label: "🌿 Basil", name: "Basil" },
  { label: "🫘 Black beans", name: "Black beans" },
  { label: "🥩 Beef chuck roast", name: "Beef chuck roast" },
  { label: "🥣 Beef broth", name: "Beef broth" },
  { label: "🥩 Beef stew meat", name: "Beef stew meat" },
  { label: "🫘 Beets", name: "Beets" },
  { label: "🍺 Beer", name: "Beer" },
  { label: "🫑 Bell peppers", name: "Bell peppers" },
  { label: "🍪 Biscuit", name: "Biscuit" },
  { label: "🍪 Brownies", name: "Brownies" },
  { label: "🍇 Blackberries", name: "Blackberries" },
  { label: "🧂 Black peppercorns", name: "Black peppercorns" },
  { label: "🍵 Black tea bags", name: "Black tea bags" },
  { label: "🍊 Blood oranges", name: "Blood oranges" },
  { label: "🫐 Blueberries", name: "Blueberries" },
  { label: "🧀 Blue cheese", name: "Blue cheese" },
  { label: "🦪 Blue mussels", name: "Blue mussels" },
  { label: "🥦 Bok choy", name: "Bok choy" },
  { label: "🥩 Bologna", name: "Bologna" },
  { label: "🧴 Body lotion", name: "Body lotion" },
  { label: "🧴 Body wash", name: "Body wash" },
  { label: "💧 Bottled spring water", name: "Bottled spring water" },
  { label: "🧀 Brie", name: "Brie" },
  { label: "🥦 Broccoli", name: "Broccoli" },
  { label: "🥦 Broccolini", name: "Broccolini" },
  { label: "🍚 Brown rice", name: "Brown rice" },
  { label: "🌾 Brown sugar", name: "Brown sugar" },
  { label: "🥦 Brussels sprouts", name: "Brussels sprouts" },
  { label: "🛁 Bubble bath", name: "Bubble bath" },
  { label: "🥛 Buttermilk", name: "Buttermilk" },
  { label: "🥬 Cabbage", name: "Cabbage" },
  { label: "🥫 Canned albacore tuna", name: "Canned albacore tuna" },
  { label: "🥫 Canned chicken breast", name: "Canned chicken breast" },
  { label: "🥫 Canned salmon", name: "Canned salmon" },
  { label: "🍉 Cantaloupe", name: "Cantaloupe" },
  { label: "🫘 Carrots", name: "Carrots" },
  { label: "🌱 Cashew milk", name: "Cashew milk" },
  { label: "🥜 Cashews", name: "Cashews" },
  { label: "🐱 Cat food", name: "Cat food" },
  { label: "🐾 Cat litter", name: "Cat litter" },
  { label: "🦴 Cat treats", name: "Cat treats" },
  { label: "🥦 Cauliflower", name: "Cauliflower" },
  { label: "🌶️ Cayenne pepper", name: "Cayenne pepper" },
  { label: "🥬 Celery", name: "Celery" },
  { label: "🍵 Chamomile tea", name: "Chamomile tea" },
  { label: "🧀 Sharp cheddar", name: "Sharp cheddar" },
  { label: "🍒 Cherries", name: "Cherries" },
  { label: "🍅 Cherry tomatoes", name: "Cherry tomatoes" },
  { label: "🫘 Chia seeds", name: "Chia seeds" },
  { label: "🍗 Chicken breasts", name: "Chicken breasts" },
  { label: "🥣 Chicken broth", name: "Chicken broth" },
  { label: "🥫 Chicken noodle soup", name: "Chicken noodle soup" },
  { label: "🍗 Chicken nuggets", name: "Chicken nuggets" },
  { label: "🍗 Chicken thighs", name: "Chicken thighs" },
  { label: "🍗 Chicken wings", name: "Chicken wings" },
  { label: "🌶️ Chili powder", name: "Chili powder" },
  { label: "🍫 Chocolate chip cookies", name: "Chocolate chip cookies" },
  { label: "🍫 Chocolate chips", name: "Chocolate chips" },
  { label: "🍦 Chocolate ice cream", name: "Chocolate ice cream" },
  { label: "🌿 Cilantro", name: "Cilantro" },
  { label: "🌿 Chives", name: "Chives" },
  { label: "🦪 Clams", name: "Clams" },
  { label: "🍊 Clementines", name: "Clementines" },
  { label: "🌾 Cocoa powder", name: "Cocoa powder" },
  { label: "🥥 Coconut milk", name: "Coconut milk" },
  { label: "🥥 Coconut oil", name: "Coconut oil" },
  { label: "🥥 Coconuts", name: "Coconuts" },
  { label: "🐟 Cod fillets", name: "Cod fillets" },
  { label: "☕ Coffee beans", name: "Coffee beans" },
  { label: "🥬 Collard greens", name: "Collard greens" },
  { label: "🥛 Condensed milk", name: "Condensed milk" },
  { label: "🧴 Conditioner", name: "Conditioner" },
  { label: "🍪 Cookie dough", name: "Cookie dough" },
  { label: "🍿 Corn chips", name: "Corn chips" },
  { label: "🍿 Cornflakes", name: "Cornflakes" },
  { label: "🌾 Cornstarch", name: "Cornstarch" },
  { label: "🧴 Cotton pads", name: "Cotton pads" },
  { label: "🧀 Cottage cheese", name: "Cottage cheese" },
  { label: "🥣 Couscous", name: "Couscous" },
  { label: "🦪 Crab meat", name: "Crab meat" },
  { label: "🧃 Cranberry juice", name: "Cranberry juice" },
  { label: "🧀 Cream cheese", name: "Cream cheese" },
  { label: "🌱 Creamy peanut butter", name: "Creamy peanut butter" },
  { label: "🥛 Crème fraîche", name: "Crème fraîche" },
  { label: "🍿 Crunchy peanut butter", name: "Crunchy peanut butter" },
  { label: "🥫 Crushed tomatoes", name: "Crushed tomatoes" },
  { label: "🌶️ Crushed red pepper flakes", name: "Crushed red pepper flakes" },
  { label: "🥒 Cucumber", name: "Cucumber" },
  { label: "🌶️ Curry powder", name: "Curry powder" },
  { label: "🍫 Dark chocolate", name: "Dark chocolate" },
  { label: "🥩 Deli ham", name: "Deli ham" },
  { label: "🧴 Dental floss", name: "Dental floss" },
  { label: "🧴 Deodorant", name: "Deodorant" },
  { label: "🥫 Diced tomatoes", name: "Diced tomatoes" },
  { label: "🥤 Diet soda", name: "Diet soda" },
  { label: "🧴 Diapers", name: "Diapers" },
  { label: "🍾 Dijon mustard", name: "Dijon mustard" },
  { label: "🌿 Dill", name: "Dill" },
  { label: "🧼 Disinfecting wipes", name: "Disinfecting wipes" },
  { label: "🧼 Dishwasher pods", name: "Dishwasher pods" },
  { label: "🧴 Disposable razors", name: "Disposable razors" },
  { label: "🐾 Dog treats", name: "Dog treats" },
  { label: "🌿 Dried basil", name: "Dried basil" },
  { label: "🌿 Dried oregano", name: "Dried oregano" },
  { label: "🌿 Dried thyme", name: "Dried thyme" },
  { label: "🐶 Dry dog food", name: "Dry dog food" },
  { label: "🐱 Dry cat food", name: "Dry cat food" },
  { label: "🧼 Dryer sheets", name: "Dryer sheets" },
  { label: "🧼 Duster refills", name: "Duster refills" },
  { label: "🫘 Edamame", name: "Edamame" },
  { label: "🥚 Eggplant", name: "Eggplant" },
  { label: "🍝 Elbow macaroni", name: "Elbow macaroni" },
  { label: "🥤 Energy drinks", name: "Energy drinks" },
  { label: "🧂 Everything bagel seasoning", name: "Everything bagel seasoning" },
  { label: "🌱 Firm tofu", name: "Firm tofu" },
  { label: "🌱 Extra-firm tofu", name: "Extra-firm tofu" },
  { label: "🍾 Extra virgin olive oil", name: "Extra virgin olive oil" },
  { label: "🧴 Facial cleanser", name: "Facial cleanser" },
  { label: "🧻 Facial tissues", name: "Facial tissues" },
  { label: "🧼 Fabric softener", name: "Fabric softener" },
  { label: "🥣 Farro", name: "Farro" },
  { label: "🧀 Feta", name: "Feta" },
  { label: "🍝 Fettuccine", name: "Fettuccine" },
  { label: "🧂 Fine sea salt", name: "Fine sea salt" },
  { label: "🐟 Fish sauce", name: "Fish sauce" },
  { label: "🌿 Flat-leaf parsley", name: "Flat-leaf parsley" },
  { label: "🥩 Flank steak", name: "Flank steak" },
  { label: "🫘 Flaxseeds", name: "Flaxseeds" },
  { label: "🧼 Floor cleaning solution", name: "Floor cleaning solution" },
  { label: "🧴 Fluoride toothpaste", name: "Whitening toothpaste" },
  { label: "🍟 French fries", name: "French fries" },
  { label: "🥦 Frozen broccoli florets", name: "Frozen broccoli florets" },
  { label: "🫐 Frozen blueberries", name: "Frozen blueberries" },
  { label: "🍕 Frozen pizza", name: "Frozen pizza" },
  { label: "🌯 Frozen burritos", name: "Frozen burritos" },
  { label: "🌽 Frozen corn", name: "Frozen corn" },
  { label: "🥭 Frozen mango chunks", name: "Frozen mango chunks" },
  { label: "🥦 Frozen mixed vegetables", name: "Frozen mixed vegetables" },
  { label: "🥦 Frozen peas", name: "Frozen peas" },
  { label: "🥬 Frozen riced cauliflower", name: "Frozen riced cauliflower" },
  { label: "🍓 Frozen strawberries", name: "Frozen strawberries" },
  { label: "🍦 Frozen waffles", name: "Frozen waffles" },
  { label: "🍦 Frozen yogurt", name: "Frozen yogurt" },
  { label: "🍇 Fruit popsicles", name: "Fruit popsicles" },
  { label: "🍓 Fruit snacks", name: "Fruit snacks" },
  { label: "🧻 Gallon ziploc bags", name: "Gallon ziploc bags" },
  { label: "🧄 Garlic", name: "Garlic" },
  { label: "🧂 Garlic powder", name: "Garlic powder" },
  { label: "🫘 Ginger", name: "Ginger" },
  { label: "🧼 Glass cleaner", name: "Glass cleaner" },
  { label: "🧀 Goat cheese", name: "Goat cheese" },
  { label: "🧀 Gouda", name: "Gouda" },
  { label: "🍇 Grapefruit", name: "Grapefruit" },
  { label: "🌱 Grape jelly", name: "Grape jelly" },
  { label: "🌾 Granulated sugar", name: "Granulated sugar" },
  { label: "🍿 Granola bars", name: "Granola bars" },
  { label: "🍏 Granny Smith apples", name: "Granny Smith apples" },
  { label: "🫘 Green beans", name: "Green beans" },
  { label: "🫘 Green lentils", name: "Green lentils" },
  { label: "🥦 Green peas", name: "Green peas" },
  { label: "🍵 Green tea", name: "Green tea" },
  { label: "🥩 Ground beef", name: "Ground beef" },
  { label: "☕ Ground coffee", name: "Ground coffee" },
  { label: "🥩 Ground pork", name: "Ground pork" },
  { label: "🥩 Ground turkey", name: "Ground turkey" },
  { label: "🌶️ Ground Cinnamon", name: "Ground Cinnamon" },
  { label: "🌶️ Ground cumin", name: "Ground cumin" },
  { label: "🌶️ Ground ginger", name: "Ground ginger" },
  { label: "🥑 Guacamole", name: "Guacamole" },
  { label: "🍫 Gummy bears", name: "Gummy bears" },
  { label: "🐟 Halibut", name: "Halibut" },
  { label: "🥛 Half-and-half", name: "Half-and-half" },
  { label: "🧴 Hand sanitizer", name: "Hand sanitizer" },
  { label: "🥔 Hash browns", name: "Hash browns" },
  { label: "🥑 Hass avocados", name: "Hass avocados" },
  { label: "🥛 Heavy whipping cream", name: "Heavy whipping cream" },
  { label: "🍿 Honey nut cereal", name: "Honey nut cereal" },
  { label: "🍏 Honeycrisp apples", name: "Honeycrisp apples" },
  { label: "🍉 Honeydew", name: "Honeydew" },
  { label: "🔥 Hot sauce", name: "Hot sauce" },
  { label: "🥑 Hummus", name: "Hummus" },
  { label: "🥬 Iceberg", name: "Iceberg" },
  { label: "🍦 Ice cream sandwiches", name: "Ice cream sandwiches" },
  { label: "☕ Instant coffee", name: "Instant coffee" },
  { label: "🥣 Instant oatmeal", name: "Instant oatmeal" },
  { label: "🌶️ Jalapeños", name: "Jalapeños" },
  { label: "🍚 Jasmine rice", name: "Jasmine rice" },
  { label: "☕ K-cups", name: "K-cups" },
  { label: "🥬 Kale", name: "Kale" },
  { label: "🥛 Kefir", name: "Kefir" },
  { label: "🍅 Ketchup", name: "Ketchup" },
  { label: "🫘 Kidney beans", name: "Kidney beans" },
  { label: "🧼 Kitchen sponges", name: "Kitchen sponges" },
  { label: "🥝 Kiwi", name: "Kiwi" },
  { label: "🧂 Kosher salt", name: "Kosher salt" },
  { label: "🥩 Lamb chops", name: "Lamb chops" },
  { label: "🥚 Large white eggs", name: "Large white eggs" },
  { label: "🍝 Lasagna sheets", name: "Lasagna sheets" },
  { label: "🧼 Laundry detergent liquid", name: "Laundry detergent liquid" },
  { label: "🧼 Laundry pods", name: "Laundry pods" },
  { label: "🧃 Lemonade", name: "Lemonade" },
  { label: "🥬 Lemons", name: "Lemons" },
  { label: "🌿 Lemongrass", name: "Lemongrass" },
  { label: "🥬 Limes", name: "Limes" },
  { label: "🥚 Liquid egg whites", name: "Liquid egg whites" },
  { label: "🧼 Liquid dish soap", name: "Liquid dish soap" },
  { label: "🧴 Liquid hand soap", name: "Liquid hand soap" },
  { label: "🦞 Lobster tails", name: "Lobster tails" },
  { label: "🐟 Mahi-mahi", name: "Mahi-mahi" },
  { label: "🍍 Mangos", name: "Mangos" },
  { label: "🥞 Maple syrup", name: "Maple syrup" },
  { label: "🧈 Margarine", name: "Margarine" },
  { label: "🥫 Marinara sauce", name: "Marinara sauce" },
  { label: "🧉 Matcha powder", name: "Matcha powder" },
  { label: "🍾 Mayonnaise", name: "Mayonnaise" },
  { label: "🧼 Microfiber cloths", name: "Microfiber cloths" },
  { label: "🥛 Milk chocolate bars", name: "Milk chocolate bars" },
  { label: "🌿 Mint", name: "Mint" },
  { label: "🌾 Molasses", name: "Molasses" },
  { label: "🧀 Monterey Jack", name: "Monterey Jack" },
  { label: "🧴 Moisturizer", name: "Moisturizer" },
  { label: "🧴 Mouthwash", name: "Mouthwash" },
  { label: "🧀 Mozzarella", name: "Mozzarella" },
  { label: "🍄 Mushroom (White Button)", name: "White button mushrooms" },
  { label: "🌶️ Nutmeg", name: "Nutmeg" },
  { label: "🍊 Navel oranges", name: "Navel oranges" },
  { label: "🍑 Nectarines", name: "Nectarines" },
  { label: "🥩 New York strip", name: "New York strip" },
  { label: "🌱 Oat milk", name: "Oat milk" },
  { label: "🧴 Oatmeal baby cereal", name: "Oatmeal baby cereal" },
  { label: "🫘 Okra", name: "Okra" },
  { label: "🫘 Sliced black olives", name: "Sliced black olives" },
  { label: "🫘 Onion powder", name: "Onion powder" },
  { label: "🧃 Orange juice", name: "Orange juice" },
  { label: "🌿 Oregano", name: "Oregano" },
  { label: "🍄 Oyster mushrooms", name: "Oyster mushrooms" },
  { label: "🥩 Pancetta", name: "Pancetta" },
  { label: "🥞 Pancake mix", name: "Pancake mix" },
  { label: "🥭 Papayas", name: "Papayas" },
  { label: "🧻 Paper bowls", name: "Paper bowls" },
  { label: "🧻 Paper napkins", name: "Paper napkins" },
  { label: "🧻 Paper plates", name: "Paper plates" },
  { label: "🧻 Paper towels", name: "Paper towels" },
  { label: "🧻 Parchment paper", name: "Parchment paper" },
  { label: "🧀 Parmesan", name: "Parmesan" },
  { label: "🫘 Parsnips", name: "Parsnips" },
  { label: "🍑 Peaches", name: "Peaches" },
  { label: "🥜 Peanuts", name: "Peanuts" },
  { label: "🍝 Penne", name: "Penne" },
  { label: "🧀 Pepper jack", name: "Pepper jack" },
  { label: "🍕 Pepperoni", name: "Pepperoni" },
  { label: "🥑 Pesto", name: "Pesto" },
  { label: "🦴 Pet waste bags", name: "Pet waste bags" },
  { label: "🍍 Pineapples", name: "Pineapples" },
  { label: "🫘 Pinto beans", name: "Pinto beans" },
  { label: "🥜 Pistachios", name: "Pistachios" },
  { label: "🍿 Pita chips", name: "Pita chips" },
  { label: "🧀 Plain Greek yogurt", name: "Plain Greek yogurt" },
  { label: "🧻 Plastic cling wrap", name: "Plastic cling wrap" },
  { label: "🧈 Plant-based butter", name: "Plant-based butter" },
  { label: "🍑 Plums", name: "Plums" },
  { label: "🍎 Pomegranates", name: "Pomegranates" },
  { label: "🍿 Popcorn", name: "Popcorn" },
  { label: "🥩 Pork ribs", name: "Pork ribs" },
  { label: "🥩 Pork chops", name: "Pork chops" },
  { label: "🥩 Pork rinds", name: "Pork rinds" },
  { label: "🥩 Pork tenderloin", name: "Pork tenderloin" },
  { label: "🍄 Portobello", name: "Portobello" },
  { label: "🥔 Potato chips", name: "Potato chips" },
  { label: "🥔 Potstickers", name: "Potstickers" },
  { label: "🌾 Powdered sugar", name: "Powdered sugar" },
  { label: "🍿 Pretzels", name: "Pretzels" },
  { label: "🍿 Protein bars", name: "Protein bars" },
  { label: "🥩 Prosciutto", name: "Prosciutto" },
  { label: "🧀 Provolone", name: "Provolone" },
  { label: "🫘 Pumpkin seeds", name: "Pumpkin seeds" },
  { label: "🧴 Q-tips", name: "Q-tips" },
  { label: "🧻 Quart ziploc bags", name: "Quart ziploc bags" },
  { label: "🥣 Quinoa", name: "Quinoa" },
  { label: "🫘 Radishes", name: "Radishes" },
  { label: "🍜 Ramen noodles", name: "Ramen noodles" },
  { label: "🍇 Raspberries", name: "Raspberries" },
  { label: "🥜 Raw almonds", name: "Raw almonds" },
  { label: "🫘 Red lentils", name: "Red lentils" },
  { label: "🫘 Red onions", name: "Red onions" },
  { label: "🍾 Relish", name: "Relish" },
  { label: "🥩 Ribeye steak", name: "Ribeye steak" },
  { label: "🧀 Ricotta", name: "Ricotta" },
  { label: "🍾 Rice vinegar", name: "Rice vinegar" },
  { label: "🍿 Rice cakes", name: "Rice cakes" },
  { label: "🍜 Rice noodles", name: "Rice noodles" },
  { label: "🍝 Rigatoni", name: "Rigatoni" },
  { label: "🍿 Ritz crackers", name: "Ritz crackers" },
  { label: "🥩 Roast beef", name: "Roast beef" },
  { label: "🥣 Rolled oats", name: "Rolled oats" },
  { label: "🥬 Romaine", name: "Romaine" },
  { label: "🍅 Roma tomatoes", name: "Roma tomatoes" },
  { label: "🌿 Rosemary", name: "Rosemary" },
  { label: "🧼 Rubber gloves", name: "Rubber gloves" },
  { label: "🥔 Russet potatoes", name: "Russet potatoes" },
  { label: "🥩 Salami", name: "Salami" },
  { label: "🥗 Salsa", name: "Salsa" },
  { label: "🍿 Saltine crackers", name: "Saltine crackers" },
  { label: "🍿 Sandwich cookies", name: "Sandwich cookies" },
  { label: "🧻 Sandwich bags", name: "Sandwich bags" },
  { label: "🧻 Sanitary pads", name: "Sanitary pads" },
  { label: "🥫 Sardines", name: "Sardines" },
  { label: "🦪 Sea scallops", name: "Sea scallops" },
  { label: "🧼 Scoring pads", name: "Scoring pads" },
  { label: "🧼 Scrub brushes", name: "Scrub brushes" },
  { label: "🌱 Seitan", name: "Seitan" },
  { label: "💧 Seltzer", name: "Seltzer" },
  { label: "🍾 Sesame oil", name: "Sesame oil" },
  { label: "🫘 Shallots", name: "Shallots" },
  { label: "🧴 Shampoo", name: "Shampoo" },
  { label: "🧴 Shaving cream", name: "Shaving cream" },
  { label: "🧴 Shaving gel", name: "Shaving gel" },
  { label: "🍄 Shiitake", name: "Shiitake" },
  { label: "🥛 Skim milk", name: "Skim milk" },
  { label: "🥩 Sliced turkey breast", name: "Sliced turkey breast" },
  { label: "🌶️ Smoked paprika", name: "Smoked paprika" },
  { label: "🥬 Sour cream", name: "Sour cream" },
  { label: "🌱 Soy milk", name: "Soy milk" },
  { label: "🐟 Soy sauce", name: "Soy sauce" },
  { label: "🍝 Spaghetti", name: "Spaghetti" },
  { label: "💧 Sparkling water", name: "Sparkling water" },
  { label: "🥬 Spinach", name: "Spinach" },
  { label: "🫘 Split peas", name: "Split peas" },
  { label: "🔥 Sriracha", name: "Sriracha" },
  { label: "🧼 Stain remover spray", name: "Stain remover spray" },
  { label: "🥩 Steel-cut oats", name: "Steel-cut oats" },
  { label: "🍓 Strawberries", name: "Strawberries" },
  { label: "🫘 Sugar snap peas", name: "Sugar snap peas" },
  { label: "🫘 Sunflower seeds", name: "Sunflower seeds" },
  { label: "🌽 Sweet corn", name: "Sweet corn" },
  { label: "🔥 Sweet chili sauce", name: "Sweet chili sauce" },
  { label: "🥔 Sweet potatoes", name: "Sweet potatoes" },
  { label: "🥬 Swiss chard", name: "Swiss chard" },
  { label: "🧀 Swiss", name: "Swiss" },
  { label: "🧻 Tall kitchen trash bags", name: "Tall kitchen trash bags" },
  { label: "🐟 Tamari", name: "Tamari" },
  { label: "🌮 Taquitos", name: "Taquitos" },
  { label: "🍟 Tater tots", name: "Tater tots" },
  { label: "🧴 Tampons", name: "Tampons" },
  { label: "🌱 Tempeh", name: "Tempeh" },
  { label: "🐟 Teriyaki sauce", name: "Teriyaki sauce" },
  { label: "🌿 Thyme", name: "Thyme" },
  { label: "🐟 Tilapia", name: "Tilapia" },
  { label: "🧻 Toilet paper", name: "Toilet paper" },
  { label: "🧼 Toilet bowl cleaner", name: "Toilet bowl cleaner" },
  { label: "🥫 Tomato juice", name: "Tomato juice" },
  { label: "🥫 Tomato paste", name: "Tomato paste" },
  { label: "🥫 Tomato sauce", name: "Tomato sauce" },
  { label: "🥫 Tomato soup", name: "Tomato soup" },
  { label: "🍿 Tortilla chips", name: "Tortilla chips" },
  { label: "🫓 Tortilla", name: "Tortilla" },
  { label: "🧴 Toothbrushes", name: "Toothbrushes" },
  { label: "🐟 Trout", name: "Trout" },
  { label: "🐟 Tuna steaks", name: "Tuna steaks" },
  { label: "🫘 Turnips", name: "Turnips" },
  { label: "🫘 Turmeric", name: "Turmeric" },
  { label: "🥛 Unsalted butter", name: "Unsalted butter" },
  { label: "🍦 Vanilla ice cream", name: "Vanilla ice cream" },
  { label: "🌾 Vanilla extract", name: "Vanilla extract" },
  { label: "🥛 Vanilla yogurt", name: "Vanilla yogurt" },
  { label: "🥣 Vegetable broth", name: "Vegetable broth" },
  { label: "🍾 Vegetable oil", name: "Vegetable oil" },
  { label: "🥜 Walnuts", name: "Walnuts" },
  { label: "🍉 Watercress", name: "Watercress" },
  { label: "🍉 Watermelon", name: "Watermelon" },
  { label: "🧻 Wax paper", name: "Wax paper" },
  { label: "🐾 Wet cat food", name: "Wet cat food" },
  { label: "🐾 Wet dog food", name: "Wet dog food" },
  { label: "🍿 Wheat crackers", name: "Wheat crackers" },
  { label: "🍾 White cleaning vinegar", name: "White cleaning vinegar" },
  { label: "🦪 White shrimp", name: "White shrimp" },
  { label: "🍾 White vinegar", name: "White vinegar" },
  { label: "Whole chicken", name: "Whole chicken" },
  { label: "🥛 Whole milk", name: "Whole milk" },
  { label: "🌾 Whole wheat flour", name: "Whole wheat flour" },
  { label: "🧼 Wood polish", name: "Wood polish" },
  { label: "🐟 Worcestershire sauce", name: "Worcestershire sauce" },
  { label: "🫘 Yellow onions", name: "Yellow onions" },
  { label: "🫘 Yellow squash", name: "Yellow squash" },
  { label: "🍾 Yellow mustard", name: "Yellow mustard" },
  { label: "🌾 Yeast", name: "Yeast" },
  { label: "🥒 Zucchini", name: "Zucchini" }
];

// 2. BACKBONE CATEGORY STRUCUTURAL GROUPS
const GROCERY_CATALOG = {
  fruits: { keywords: ['apple', 'banana', 'berr', 'strawberry', 'blueberry', 'raspberry', 'citrus', 'lemon', 'lime', 'orange', 'melon', 'watermelon', 'avocado', 'grape', 'peach', 'cherry', 'kiwi', 'mango'], cat: 'Fresh Produce', sub: 'Fruits' },
  vegetables: { keywords: ['green', 'lettuce', 'spinach', 'potato', 'carrot', 'broccoli', 'tomato', 'onion', 'garlic', 'cucumber', 'pepper', 'corn', 'mushroom', 'cabbage', 'zucchini', 'eggplant'], cat: 'Fresh Produce', sub: 'Vegetables' },
  poultry: { keywords: ['chicken', 'turkey', 'wing', 'drumstick', 'breast'], cat: '🥩 Meat, Seafood & Deli', sub: 'Meat & Poultry' },
  redmeat: { keywords: ['beef', 'pork', 'lamb', 'steak', 'mince', 'rib', 'chop', 'meat', 'burger'], cat: '🥩 Meat, Seafood & Deli', sub: 'Meat & Poultry' },
  seafood: { keywords: ['salmon', 'shrimp', 'cod', 'tuna', 'fish', 'prawn', 'crab', 'lobster'], cat: '🥩 Meat, Seafood & Deli', sub: 'Fish & Seafood' },
  deli: { keywords: ['salami', 'ham', 'bacon', 'sausage', 'pepperoni', 'pastrami', 'olive'], cat: '🥩 Meat, Seafood & Deli', sub: 'Deli' },
  dairyBase: { keywords: ['milk', 'butter', 'cream', 'sour cream', 'yogurt', 'ayran', 'cacik'], cat: '🧀 Dairy & Refrigerated', sub: 'Dairy' },
  eggsItem: { keywords: ['egg'], cat: '🧀 Dairy & Refrigerated', sub: 'Dairy' },
  cheeseItem: { keywords: ['cheese', 'cheddar', 'mozzarella', 'feta', 'kasar', 'peynir'], cat: '🧀 Dairy & Refrigerated', sub: 'Cheese' },
  veganDairy: { keywords: ['almond milk', 'oat milk', 'soy milk', 'vegan cheese'], cat: '🧀 Dairy & Refrigerated', sub: 'Plant-Based Alternatives' },
  grains: { keywords: ['rice', 'oat', 'quinoa', 'bread', 'tortilla', 'flour', 'baking', 'yeast', 'sugar', 'powder'], cat: '🥫 Center Store (Pantry Staples)', sub: 'Grains & Baking' },
  pasta: { keywords: ['pasta', 'spaghetti', 'macaroni', 'noodle'], cat: '🥫 Center Store (Pantry Staples)', sub: 'Grains & Pasta' },
  canned: { keywords: ['soup', 'bean', 'sauce', 'paste', 'canned'], cat: '🥫 Center Store (Pantry Staples)', sub: 'Canned Goods' },
  condiments: { keywords: ['oil', 'olive oil', 'vinegar', 'mayo', 'ketchup', 'mustard', 'sauce', 'salt', 'pepper', 'spice'], cat: '🥫 Center Store (Pantry Staples)', sub: 'Condiments & Spices' },
  snacks: { keywords: ['chip', 'nut', 'popcorn', 'cracker', 'cookie', 'chocolate', 'biscuit', 'sweet', 'candy'], cat: '🥫 Center Store (Pantry Staples)', sub: 'Snacks' },
  frozenMeals: { keywords: ['pizza', 'burrito', 'nugget', 'frozen meal', 'waffle'], cat: '🧊 Frozen Foods', sub: 'Frozen Meals' },
  frozenProduce: { keywords: ['frozen vegetable', 'frozen fruit', 'frozen berry', 'peas'], cat: '🧊 Frozen Foods', sub: 'Frozen Produce' },
  frozenTreats: { keywords: ['ice cream', 'popsicle', 'sorbet'], cat: '🧊 Frozen Foods', sub: 'Frozen Treats' },
  hotDrinks: { keywords: ['coffee', 'bean', 'tea', 'cai', 'espresso', 'hot chocolate'], cat: '☕ Beverages', sub: 'Hot Drinks' },
  coldDrinks: { keywords: ['water', 'juice', 'soda', 'cola', 'sprite', 'fanta', 'sports drink', 'energy drink'], cat: '☕ Beverages', sub: 'Cold Drinks' },
  alcohol: { keywords: ['beer', 'wine', 'spirit', 'vodka', 'whiskey', 'raki'], cat: '☕ Beverages', sub: 'Alcohol' },
  paper: { keywords: ['toilet paper', 'paper towel', 'napkin', 'tissue'], cat: '🧻 Non-Food & Household', sub: 'Paper Products' },
  cleaning: { keywords: ['soap', 'detergent', 'spray', 'cleaner', 'bleach', 'sponge'], cat: '🧻 Non-Food & Household', sub: 'Cleaning Supplies' },
  personal: { keywords: ['shampoo', 'toothpaste', 'deodorant', 'bandage', 'medicine', 'vitamin', 'brush'], cat: '🧻 Non-Food & Household', sub: 'Personal & Health Care' },
  pet: { keywords: ['cat food', 'dog food', 'pet', 'treats'], cat: '🧻 Non-Food & Household', sub: 'Pet Supplies' }
};

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



// 🏢 STYLE DICTIONARY
const styles = {
  appContainer: { maxWidth: '850px', margin: '40px auto', padding: '0 20px', fontFamily: 'inherit' },
  authWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9' },
  authCard: { width: '100%', maxWidth: '400px', padding: '35px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  errorAlert: { padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.9em', marginBottom: '16px', fontWeight: '500' },
  authSubmitBtn: { padding: '12px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '1em', fontWeight: '600', cursor: 'pointer', marginTop: '5px' },
  switchLink: { color: '#0288d1', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' },
  header: { marginBottom: '35px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' },
  brandTitle: { fontSize: '2.4em', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' },
  brandSubtitle: { fontSize: '1em', color: '#64748b', margin: 0 },
  userGreeting: { marginRight: '15px', color: '#475569', fontSize: '0.95em' },
  logoutBtn: { padding: '6px 12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '6px', fontSize: '0.85em', fontWeight: '600', cursor: 'pointer' },
  tabContainer: { display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '10px' },
  tabButton: { padding: '10px 20px', fontSize: '0.95em', fontWeight: '600', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  formCardGreen: { backgroundColor: '#f8fafc', borderLeft: '5px solid #2e7d32', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginBottom: '30px', border: '1px solid #e2e8f0' },
  formCardBlue: { backgroundColor: '#f8fafc', borderLeft: '5px solid #0288d1', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginBottom: '30px', border: '1px solid #e2e8f0' },
  formLayout: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  inputField: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.95em', flex: '2', transition: 'all 0.2s' },
  inputQty: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.95em', flex: '0.5', minWidth: '60px' },
  selectField: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.95em', cursor: 'pointer' },
  submitBtnGreen: { padding: '10px 20px', backgroundColor: '#2e7d32', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  submitBtnBlue: { padding: '10px 20px', backgroundColor: '#0288d1', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  sectionHeading: { fontSize: '1.4em', fontWeight: '700', color: '#1e293b', marginBottom: '15px' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
  dataRow: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: '1.05em', fontWeight: '600', color: '#0f172a' },
  itemBadge: { marginLeft: '12px', fontSize: '0.85em', padding: '3px 8px', backgroundColor: '#f1f5f9', borderRadius: '12px', color: '#475569', fontWeight: '500' },
  expiryTag: { marginLeft: '12px', fontSize: '0.85em', color: '#64748b' },
  actionBtnWarning: { backgroundColor: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85em', fontWeight: '600' },
  actionBtnDanger: { backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85em', fontWeight: '600' },
  checkbox: { width: '17px', height: '17px', cursor: 'pointer' },
  inlineRemoveBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.05em', padding: '4px' },
  infoText: { color: '#64748b', fontStyle: 'italic' },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    transition: 'all 0.2s ease'
  },
  statLabel: {
    fontSize: '0.85em',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px'
  },
  statValue: {
    fontSize: '1.8em',
    fontWeight: '800',
    color: '#0f172a'
  },
  filterControlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '20px'
  },
  searchBar: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95em',
    flex: '1',
    minWidth: '200px'
  },
  filterButtonGroup: {
    display: 'flex',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    padding: '2px',
    gap: '2px'
  },
  filterTabBtn: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.85em',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#475569',
    transition: 'all 0.15s ease'
  },
  inlineQtyInput: {
    width: '65px',
    padding: '4px 6px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9em',
    textAlign: 'center',
    fontWeight: '600',
    color: '#0f172a',
    backgroundColor: '#f8fafc'
  },
  unitLabel: {
    fontSize: '0.85em',
    padding: '3px 6px',
    color: '#475569',
    fontWeight: '500'
  },
  categoryTitleHeader: {
    fontSize: '1.15em',
    fontWeight: '700',
    color: '#334155',
    backgroundColor: '#f1f5f9',
    padding: '8px 14px',
    borderRadius: '6px',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  miniProductGraphic: {
    fontSize: '1.6em',
    padding: '6px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px'
  },
  subcategoryLabel: {
    fontSize: '0.75em',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: '8px',
    border: '1px solid #e2e8f0'
  },
  categoryPillBtn: {
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid #cbd5e1',
    fontSize: '0.8em',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
  },
  searchBar: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95em',
    width: '100%', // Makes search span the full width cleanly
    boxSizing: 'border-box'
  },
  formSelectInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95em',
    fontWeight: '500',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    outline: 'none',
    boxSizing: 'border-box',
    appearance: 'none', // Removes default retro browser arrow profiling
    backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23475569\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', // Custom sleek dropdown arrow
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px', // Extra breathing room for the custom arrow icon
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
    transition: 'border-color 0.15s ease'
  },
  addItemSubmitBtn: {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: '#2e7d32', // Emerald green style signature
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.95em',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease'
  },
  formInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95em',
    fontWeight: '500',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit' // Ensures native date typography matches your layout
  },
  autocompleteOverlayCard: {
    position: 'absolute',
    top: '64px',
    left: '0',
    right: '0',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: '999', // Forces suggestions to display above all background card wrappers safely
    maxHeight: '260px',
    overflowY: 'auto'
  },
  suggestionRowItem: {
    padding: '10px 14px',
    fontSize: '0.9em',
    color: '#334155',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',
    borderBottom: '1px solid #f1f5f9',
    textAlign: 'left'
  },
  autocompleteOverlayCard: {
    position: 'absolute',
    top: '64px',
    left: '0',
    right: '0',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: '999',
    maxHeight: '500px', // 💡 INCREASED HERE: Gives you room for roughly 12-14 items visible at a glance!
    overflowY: 'auto'
  },
};

export default App;