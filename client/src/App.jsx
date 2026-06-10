import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './index.css';
import { ITEM_EMOJIS, PREDEFINED_ITEMS, GROCERY_CATALOG } from './utils/constants';
import { styles } from './styles';

// At the top of src/App.jsx
const API_BASE_URL = 'https://bitewise-nxnc.onrender.com'; // Make sure this matches your exact Render URL!



// Place this at the top of src/App.jsx
const TRANSLATIONS = {
  en: {
    pantryTab: "📦 Inventory Pantry",
    groceryTab: "📝 Grocery List",
    profileTab: "👤 Profile & Settings",
    accountCreated: "Account Created On",
    securityStatus: "Current Security Status",
    activeSession: "Active Storage Session",
    modifyUsername: "Modify Username",
    modifyEmail: "Modify Email Address",
    applyChanges: "Apply Account Changes",
    dangerZone: "⚠️ Danger Zone",
    dangerText: "Deleting your account will purge all database entries including active grocery deficit lists and pantry inventory logs.",
    deleteBtn: "Permanently Delete BiteWise Account",
    emptyFields: "Credentials cannot be left empty.",
    updateSuccess: "Profile Updated!",
    updateFailed: "Update Failed",
    mainTitle: "Intelligent Kitchen & Grocery Coordination",
    user: "👤 User:",
    signOut: "Sign Out",
    totalInventory: "📦 Total Inventory",
    expiredItems: "🚨 Expired Items", 
    useWithinThreeDays: "⏳ Use Within 3 Days",
    deficitShoppingItems: "🛒 Deficit Shopping Items",
    selectItem: "Select or Search Item",
    quantity: "Quantity",
    unit: "Unit",
    grams: "Grams",
    kilograms: "Kilograms",
    liters: "Liters",
    pieces: "Pieces",
    packs: "Packs",
    expirationDate: "Expiration Date",
    addToStock: "Add to Stock",
    currentStockBalance: "Current Stock Balance",
    searchPantryItems: "🔍 Search pantry items...",
    allStockCondition: "All Stock Condition",
    expired: "🔴 Expired",
    urgent: "⏳ Urgent",
    filterGroup: "Filter Group:",
    allCategories: "All Categories",
    produce: "🍌 Produce",
    meat: "🥩 Meat & Deli",
    dairy: "🧀 Dairy", 
    staples: "🥫 Staples",
    beverages: "☕ Beverages",
    household: "🧻 Household",
    delete: "Delete",
    depleted: "🔄 Depleted / Restock",
    nameNotOnList: "➕ Name not on list? Create Custom Item...",
    typeToSearch: "🔍 Type to search food list...",
    exp: "📅 Exp: ",
    appendDeficitItem: "➕ Append Deficit Item",
    activeProcurementItems: "Active Procurement Items",
    itemRequirement: "Item Requirement... (e.g. Whole Milk)",
    addToList: "Add to List",
    establishANew: "Establish a new planning account",
    username: "Username",
    password: "Password",
    enterYourSecurePassword: "Enter your secure password",
    showPassword: "Show Password",
    registerAccount: "Register Account",
    existingUser: "Existing user?",
    signBackIn: "Sign back in",
    newClient: "New client?",
    createAnAccount: "Create an account",
    authenticateLogin: "Authenticate Login",
    usernameOrEmail: "Enter Username or Email Address",
    email: "Enter Valid Email Address",
    noMatchingInventory: "No matching inventory entries discovered.",
    pleaseFillOut: "Please fill out all basic credentials.", 
    pleaseEnterAValid: "Please enter a valid email structure.",
    enterCustom: "Enter Custom Item Name",
    signInMessage: "Sign in to access your kitchen storage",
    passwordError: "Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.",
    deleteYourEntire: "Delete Your Entire Account?",
    typeDeleteBelow: "Type 'DELETE' below to permanently destroy your profile.",
    yesPermanently: "Yes, permanently delete",
    cancel: "Cancel",
    youMustType: "You must type 'DELETE' to confirm",
    profileErased: "Profile Erased",
    stockedInto: "Stocked into pantry",
    areYouSure: "Are you sure?",
    thisItemWillBe: "This item will be permanently removed from your kitchen inventory!",
    expired: "🚨 Expired",
    expiresToday: "⚠️ EXPIRES TODAY",


  },
  tr: {
    pantryTab: "📦 Kiler Envanteri",
    groceryTab: "📝 Alışveriş Listesi",
    profileTab: "👤 Profil ve Ayarlar",
    accountCreated: "Hesap Oluşturma Tarihi",
    securityStatus: "Mevcut Güvenlik Durumu",
    activeSession: "Aktif Depolama Oturumu",
    modifyUsername: "Kullanıcı Adını Değiştir",
    modifyEmail: "E-posta Adresini Değiştir",
    applyChanges: "Hesap Değişikliklerini Uygula",
    dangerZone: "⚠️ Tehlikeli Bölge",
    dangerText: "Hesabınızı silmek, aktif alışveriş listeleri ve kiler envanter kayıtları dahil olmak üzere tüm veri tabanı kayıtlarını kalıcı olarak temizler.",
    deleteBtn: "BiteWise Hesabını Kalıcı Olarak Sil",
    emptyFields: "Alanlar boş bırakılamaz.",
    updateSuccess: "Profil Güncellendi!",
    updateFailed: "Güncelleme Başarısız",
    mainTitle: "Akıllı Mutfak & Market Koordinasyonu",
    user: "👤 Kullanıcı:",
    signOut: "Çıkış Yap",
    totalInventory: "📦 Toplam Ürün",
    expiredItems: "🚨 Tarİhİ Geçmİş Ürünler", 
    useWithinThreeDays: "⏳ 3 Gün İçİnde Tüketİn",
    deficitShoppingItems: "🛒 Eksİk Ürünler",
    selectItem: "Ürün Seçiniz veya Arayınız",
    quantity: "Miktar",
    unit: "Birim",
    grams: "Gram",
    kilograms: "Kilogram",
    liters: "Litre",
    pieces: "Adet",
    packs: "Paket",
    expirationDate: "Son Kullanma Tarihi",
    addToStock: "Stoğa Ekleyin",
    currentStockBalance: "Mevcut Stok Durumu",
    searchPantryItems: "🔍 Mutfak ürünleri ara",
    allStockCondition: "Tüm Stok Durumu",
    expired: "🔴 Tarihi Geçmiş",
    urgent: "⏳ Acil Olarak Tüketilmesi Gereken",
    filterGroup: "Filtre:",
    allCategories: "Tüm Kategoriler",
    produce: "🍌 Sebze-Mevye",
    meat: "🥩 Et Ürünleri",
    dairy: "🧀 Mandıra", 
    staples: "🥫 Temel Gıdalar",
    beverages: "☕ İçecekler",
    household: "🧻 Ev Gereçleri",
    delete: "Sil",
    depleted: "🔄 Tükendi / Stok Bitti",
    nameNotOnList: "➕ İsim listede yok mu? Yeni ürün oluşturun...",
    typeToSearch: "🔍 Ürün listesinde arayın...",
    exp: "📅 STT: ",
    appendDeficitItem: "Gerekli Olan Ürünü Ekleyin",
    activeProcurementItems: "Aktif Tedarik Ürünleri",
    itemRequirement: "Ürün Ekleyin",
    addToList: "Listeye Ekle",
    establishANew: "Yeni bir hesap oluşturun",
    username: "Kullanıcı adı",
    password: "Şifre",
    enterYourSecurePassword: "Şifrenizi girin",
    showPassword: "Şifreyi göster",
    registerAccount: "Kayıt ol",
    existingUser: "Zaten hesabınız var mı?",
    signBackIn: "Tekrar giriş yap",
    newClient: "Yeni kullanıcı?",
    createAnAccount: "Hesap oluştur",
    authenticateLogin: "Giriş yap",
    usernameOrEmail: "Kullanıcı adı veya Email adresi girin",
    email: "Kullanıcı adı veya E-posta adresi girin",
    noMatchingInventory: "Eşleşen ürün bulunamadı.",
    pleaseFillOut: "Lütfen bütün boşlukları doldurun.", 
    pleaseEnterAValid: "Lütfen geçerli bir e-posta adresi girin",
    enterCustom: "Listede olmayan ürün ismi giriniz",
    signInMessage: "Hesabınıza erişmek için giriş yapınız",
    passwordError: "Şifreniz en az 8 karakter uzunluğunda olmalı, büyük harf, rakam ve özel karakter içermelidir.",
    deleteYourEntire: "Hesabınızı kalıcı olarak silinecek?",
    typeDeleteBelow: "Hesabınızı silmek için aşağıya DELETE yazın",
    yesPermanently: "Evet, kalıcı olarak sil",
    cancel: "İptal",
    youMustType: "Kabul etmek için DELETE yazmalısınız",
    profileErased: "Hesap silinmiştir",
    stockedInto: "Ürün Stoğa Eklendi",
    areYouSure: "Emin misin?",
    thisItemWillBe: "Bu ürün mutfak envanterinden kalıcı olarak silinecek",
    expired: "🚨 TARİHİ GEÇMİŞ",
    expiresToday: "⚠️ BUGÜN SON KULLANMA TARİHİ",
    
  }
};


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

  
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [activeTab, setActiveTab] = useState('pantry'); // or 'grocery'


  const [lang, setLang] = useState(localStorage.getItem('biteWiseLang') || 'en');


  const t = TRANSLATIONS[lang];



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
      return { color: '#ef4444', badge: '🚨 Expired', isExpired: true };
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
      return setAuthError(t.pleaseFillOut);
    }
  
    // 2. Validate email structure
    // 💡 Wrap the email format check so it ONLY runs when a user is signing up for a brand new account!
    if (authMode === 'register') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(authEmail)) {
      return setAuthError(t.pleaseEnterAValid);
    }
  }
    
    // 2b. Validate strong password structure (Registration Only)
    if (authMode === 'register') {
    // Regex: Requires >= 1 uppercase, >= 1 number, >= 1 special char, min 8 chars total
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  
      if (!passwordRegex.test(authPassword)) {
        return setAuthError(
          t.passwordError
        );
      }
    }

    // 3. Process backend requests safely inside a single async block
    try {
      let response;
      if (authMode === 'login') {
        response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          identifier: authEmail,
          password: authPassword
        });
      } else {
        if (!authUsername.trim()) {
          return setAuthError("Username is required for registration.");
        }
        response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
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
      const response = await axios.get(`${API_BASE_URL}/api/pantry`, getAuthConfig());
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
      const response = await axios.get(`${API_BASE_URL}/api/shopping`, getAuthConfig());
      setShoppingItems(response.data);
      setShoppingLoading(false);
    } catch (error) {
      console.error(error);
      setShoppingLoading(false);
    }
  };

  const handlePantrySubmit = async (e) => {
    e.preventDefault();
    let finalName = pantryName;

    // If they picked the custom input flag option, prompt them for the unique name
    if (pantryName === "custom_input") {
      const { value: customName } = await Swal.fire({
        title: t.enterCustom,
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

    // 1. Run your existing smart fuzzy metadata matching engine automatically!
    const metaData = autoDetectCategory(finalName);

    // 2. SAFE EXTRACTION: Resolve localized category structures down to strings
    // If metaData returns an object { en, tr }, extract the active language string.
    // If it's already a string or missing, fall back gracefully.
    const resolvedCategory = metaData?.cat && typeof metaData.cat === 'object' 
      ? (metaData.cat[lang] || metaData.cat['en']) 
      : (metaData?.cat || "Other");

    const resolvedSubCategory = metaData?.sub && typeof metaData.sub === 'object' 
      ? (metaData.sub[lang] || metaData.sub['en']) 
      : (metaData?.sub || "Other");

    try {
      const newItem = { 
        name: finalName, 
        quantity: parseFloat(pantryQuantity), 
        unit: pantryUnit, 
        expiration_date: pantryExpiry || null,
        category: resolvedCategory,      // Now safely passes a Flat String (e.g., "Süt Ürünleri & Dolap")
        subcategory: resolvedSubCategory // Now safely passes a Flat String (e.g., "Süt ve Krema")
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/pantry`, newItem, getAuthConfig());
      setPantryItems([...pantryItems, response.data]);
      
      // Clear values back to clean form defaults
      setPantryName(''); 
      setPantryQuantity('1'); 
      setPantryExpiry('');
    } catch (error) {
      console.error("Backend Error adding item to pantry:", error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Could not add item. Check if backend fields match the required formats.'
      });
    }
};

  const handlePantryDelete = async (id) => {
    const result = await Swal.fire({
      title: t.areYouSure,
      text: t.thisItemWillBe,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: t.yesPermanently
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/pantry/${id}`, getAuthConfig());
      setPantryItems(pantryItems.filter(item => item.id !== id));
      
      Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Item has been purged.', timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error(error);
    }
  };

  const handleMoveToList = async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/pantry/move-to-list/${id}`, {}, getAuthConfig());
      setPantryItems(pantryItems.filter(item => item.id !== id));
      setShoppingItems([response.data.shoppingItem, ...shoppingItems]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShoppingSubmit = async (e) => {
    e.preventDefault();
    
    // 💡 FIXED: Check shopName instead of pantryName
    if (!shopName || !shopName.trim()) {
      return Swal.fire({ 
        icon: 'warning', 
        title: 'Missing Name', 
        text: 'Please enter a valid item name before adding.', 
        confirmButtonColor: '#2e7d32' 
      });
    }
    
    try {
      const newItem = { 
        name: shopName.trim(), // Clean up any trailing spaces
        quantity: parseFloat(shopQuantity), 
        unit: shopUnit 
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/shopping`, newItem, getAuthConfig());
      setShoppingItems([response.data, ...shoppingItems]);
      
      // Reset form fields
      setShopName(''); 
      setShopQuantity('1');
    } catch (error) {
      console.error("Error adding item to shopping list:", error);
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
        `${API_BASE_URL}/api/shopping/${id}`, 
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
        Swal.fire({ icon: 'success', title: t.stockedInto, toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      }
      fetchPantry(); 
    } catch (error) {
      console.error(error);
    }
  };

  const handleShoppingDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/shopping/${id}`, getAuthConfig());
      setShoppingItems(shoppingItems.filter(item => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateQuantity = async (id, newQuantity, extraData = {}) => {
    const parsedQty = newQuantity === '' ? 0 : parseFloat(newQuantity);
    if (isNaN(parsedQty) || parsedQty < 0) return;

    try {
      const payload = { quantity: parsedQty };
      if (extraData.expiration_date !== undefined) {
        payload.expiration_date = extraData.expiration_date || null;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/pantry/${id}/quantity`, 
        payload, 
        getAuthConfig()
      );
      
      const updatedData = {
        ...response.data,
        quantity: Number(response.data.quantity)
      };

      setPantryItems(pantryItems.map(item => item.id === id ? updatedData : item));

      if (extraData.isRestock) {
        Swal.fire({
          icon: 'success',
          title: 'Restocked!',
          text: 'Item details updated successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Failed to execute inventory balance adjustment:", error);
    }
  };


  // --- DYNAMIC AUTH VIEWS WITH INTEGRATED LANGUAGE SWITCHER ---

  // --- DYNAMIC AUTH VIEWS WITH FIXED FLOW LANGUAGE SWITCHER ---

  const LoginScreen = () => {
    return (
      <div className="auth-page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        
        {/* 🌐 Clean In-Flow Language Switcher Bar */}
        <div className="auth-lang-header" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setLang('en')} 
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            style={{ 
              fontWeight: lang === 'en' ? 'bold' : 'normal', 
              padding: '8px 16px', 
              cursor: 'pointer', 
              borderRadius: '4px',
              border: lang === 'en' ? '2px solid #000' : '1px solid #ccc',
              backgroundColor: '#fff'
            }}
          >
            🇬🇧 EN
          </button>
          <button 
            onClick={() => setLang('tr')} 
            className={`lang-btn ${lang === 'tr' ? 'active' : ''}`}
            style={{ 
              fontWeight: lang === 'tr' ? 'bold' : 'normal', 
              padding: '8px 16px', 
              cursor: 'pointer', 
              borderRadius: '4px',
              border: lang === 'tr' ? '2px solid #000' : '1px solid #ccc',
              backgroundColor: '#fff'
            }}
          >
            🇹🇷 TR
          </button>
        </div>
  
        <div className="login-card" style={{ width: '100%', maxWidth: '400px' }}>
          <h2>{lang === 'tr' ? 'Giriş Yap' : 'Login'}</h2>
          
          <form onSubmit={handleAuthSubmit}>
            <label style={{ display: 'block', marginTop: '10px' }}>{lang === 'tr' ? 'E-posta' : 'Email'}</label>
            <input 
              type="email" 
              placeholder="example@email.com" 
              value={authEmail} 
              onChange={(e) => setAuthEmail(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
            
            <label style={{ display: 'block', marginTop: '10px' }}>{lang === 'tr' ? 'Şifre' : 'Password'}</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={authPassword} 
              onChange={(e) => setAuthPassword(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
            
            <button type="submit" style={{ marginTop: '20px', width: '100%', padding: '10px', cursor: 'pointer' }}>
              {lang === 'tr' ? 'Giriş' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const RegisterScreen = () => {
    return (
      <div className="auth-page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        
        {/* 🌐 Clean In-Flow Language Switcher Bar */}
        <div className="auth-lang-header" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setLang('en')} 
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            style={{ 
              fontWeight: lang === 'en' ? 'bold' : 'normal', 
              padding: '8px 16px', 
              cursor: 'pointer', 
              borderRadius: '4px',
              border: lang === 'en' ? '2px solid #000' : '1px solid #ccc',
              backgroundColor: '#fff'
            }}
          >
            🇬🇧 EN
          </button>
          <button 
            onClick={() => setLang('tr')} 
            className={`lang-btn ${lang === 'tr' ? 'active' : ''}`}
            style={{ 
              fontWeight: lang === 'tr' ? 'bold' : 'normal', 
              padding: '8px 16px', 
              cursor: 'pointer', 
              borderRadius: '4px',
              border: lang === 'tr' ? '2px solid #000' : '1px solid #ccc',
              backgroundColor: '#fff'
            }}
          >
            🇹🇷 TR
          </button>
        </div>
  
        <div className="register-card" style={{ width: '100%', maxWidth: '400px' }}>
          <h2>{lang === 'tr' ? 'Hesap Oluştur' : 'Create Account'}</h2>
          
          <form onSubmit={handleAuthSubmit}>
            <label style={{ display: 'block', marginTop: '10px' }}>{lang === 'tr' ? 'Ad Soyad' : 'Full Name'}</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              value={authUsername} 
              onChange={(e) => setAuthUsername(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
  
            <label style={{ display: 'block', marginTop: '10px' }}>{lang === 'tr' ? 'E-posta' : 'Email'}</label>
            <input 
              type="email" 
              placeholder="example@email.com" 
              value={authEmail} 
              onChange={(e) => setAuthEmail(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
            
            <label style={{ display: 'block', marginTop: '10px' }}>{lang === 'tr' ? 'Şifre' : 'Password'}</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={authPassword} 
              onChange={(e) => setAuthPassword(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
            
            <button type="submit" style={{ marginTop: '20px', width: '100%', padding: '10px', cursor: 'pointer' }}>
              {lang === 'tr' ? 'Kayıt Ol' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    );
  };



  // ==========================================
  // RENDER PATTERN A: GATEKEEPER LOGIN PANEL
  // ==========================================
  if (!token) {
    return (
      <div style={{ ...styles.authWrapper, flexDirection: 'column', gap: '20px' }}>
        
        {/* 🌐 GLOBAL AUTH LANGUAGE TOGGLE BAR */}
        <div style={{ display: 'flex', gap: '10px', background: '#fff', padding: '6px 12px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <button 
            onClick={() => setLang('en')} 
            style={{ 
              fontWeight: lang === 'en' ? 'bold' : 'normal', 
              padding: '6px 14px', 
              cursor: 'pointer', 
              borderRadius: '15px',
              border: 'none',
              backgroundColor: lang === 'en' ? '#f1f5f9' : 'transparent',
              color: lang === 'en' ? '#0f172a' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            🇬🇧 EN
          </button>
          <button 
            onClick={() => setLang('tr')} 
            style={{ 
              fontWeight: lang === 'tr' ? 'bold' : 'normal', 
              padding: '6px 14px', 
              cursor: 'pointer', 
              borderRadius: '15px',
              border: 'none',
              backgroundColor: lang === 'tr' ? '#f1f5f9' : 'transparent',
              color: lang === 'tr' ? '#0f172a' : '#64748b',
              transition: 'all 0.2s'
            }}
          >
            🇹🇷 TR
          </button>
        </div>

        <div style={styles.authCard}>
          <h2 style={{ textAlign: 'center', margin: '0 0 8px 0', fontSize: '1.8em' }}>🍏 BiteWise</h2>
          <p style={{ textAlign: 'center', color: '#64748b', margin: '0 0 24px 0' }}>
            {authMode === 'login' ? (t.signInMessage || 'Sign in to access your kitchen storage') : (t.signUpMessage || t.establishANew)}
          </p>

          {authError && <div style={styles.errorAlert}>⚠️ {authError}</div>}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {authMode === 'register' && (
              <input 
                type="text" placeholder={t.username} value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)} style={styles.inputField}
              />
            )}
            <input 
              type="text"                  
              placeholder={t.email}
              value={authEmail}            
              onChange={(e) => setAuthEmail(e.target.value)} 
              style={styles.inputField}
            />
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <label style={styles.inputLabel}>{t.password}</label>
              <input
                type={showPassword ? "text" : "password"} 
                placeholder={t.enterYourSecurePassword}
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
                  {t.showPassword}
                </label>
              </div>
            </div>
            
            <button type="submit" className="btn-animate" style={styles.authSubmitBtn}>
              {authMode === 'login' ? t.authenticateLogin : t.registerAccount}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9em' }}>
            {authMode === 'login' ? (
              <p style={{ margin: 0 }}>{t.newClient} <span onClick={() => { setAuthMode('register'); setAuthError(''); }} style={styles.switchLink}>{t.createAnAccount}</span></p>
            ) : (
              <p style={{ margin: 0 }}>{t.existingUser} <span onClick={() => { setAuthMode('login'); setAuthError(''); }} style={styles.switchLink}>{t.signBackIn}</span></p>
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
    return status.badge === '🚨 Expired' || status.badge === '⚠️ EXPIRES TODAY';
  }).length;

  const expiringSoonCount = pantryItems.filter(item => {
    const status = getExpiryStatus(item.expiration_date);
    return status.badge && status.badge.includes('⏳');
  }).length;

  const remainingShoppingItems = shoppingItems.filter(item => !item.is_purchased).length;
  
  
  // --- RUNTIME FILTER ENGINE ---
  const filteredPantryItems = pantryItems.filter(item => {
    // 1. Apply Fuzzy Search Filter (Unchanged)
    const matchesSearch = item.name.toLowerCase().includes(pantrySearch.toLowerCase());

    // 2. Apply Expiration Type Filter (FIXED: Uses robust timestamp math instead of localized text labels)
    let matchesExpiry = true;
    
    if (pantryFilter !== 'all') {
      if (!item.expiration_date) {
        // Items without expiration dates can't be 'expired' or 'soon'
        matchesExpiry = false; 
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to midnight
        
        const expiryDate = new Date(item.expiration_date);
        expiryDate.setHours(0, 0, 0, 0);

        // Calculate exact days left
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (pantryFilter === 'expired') {
          // It is expired if daysLeft is less than 0, or expires today (daysLeft === 0)
          matchesExpiry = daysLeft <= 0; 
        } else if (pantryFilter === 'soon') {
          // Matches your urgent item rule (e.g., expiring within the next 3 days, but not already expired)
          matchesExpiry = daysLeft > 0 && daysLeft <= 3; 
        }
      }
    }

    // 3. Apply Category Group Filter (Unchanged)
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
            <p style={styles.brandSubtitle}>{t.mainTitle}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={styles.userGreeting}>{t.user} <strong>{user?.username}</strong></span>
            <button onClick={handleLogout} className="btn-animate" style={styles.logoutBtn}>{t.signOut}</button>
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
          {t.pantryTab}
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
          {t.groceryTab}
        </button>
        <button 
          onClick={() => setCurrentTab('profile')} className="btn-animate"
          style={{
            ...styles.tabButton,
            backgroundColor: currentTab === 'profile' ? '#a80324' : '#ffffff',
            color: currentTab === 'profile' ? '#ffffff' : '#64748b',
            border: currentTab === 'profile' ? 'none' : '1px solid #e2e8f0',
          }}  
  >
          {t.profileTab}
      </button>
    </div>
    <button
    onClick={() => {
      const nextLang = lang === 'en' ? 'tr' : 'en';
      setLang(nextLang);
      localStorage.setItem('biteWiseLang', nextLang);
    }}
    style={{
      padding: '8px 16px',
      backgroundColor: '#f1f5f9',
      border: '1px solid #cbd5e1',
      borderRadius: '20px',
      fontWeight: '600',
      color: '#334155',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s'
    }}
    onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
    onMouseOut={(e) => e.target.style.backgroundColor = '#f1f5f9'}
  >
    {lang === 'en' ? '🇹🇷 Türkçe\'ye Geç' : '🇬🇧 Switch to English'}
  </button>


      <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', marginBottom: '30px' }} />
  
      {/* EXECUTIVE DASHBOARD ANALYTICS BANNER */}
      <div style={styles.dashboardGrid}>
        <div style={{ ...styles.statCard, borderTop: '4px solid #475569' }}>
          <div style={styles.statLabel}>{t.totalInventory}</div>
          <div style={styles.statValue}>{totalPantryItems}</div>
        </div>
        
        <div style={{ 
          ...styles.statCard, 
          borderTop: '4px solid #ef4444',
          backgroundColor: expiredCount > 0 ? '#fef2f2' : '#ffffff' 
        }}>
          <div style={{ ...styles.statLabel, color: expiredCount > 0 ? '#991b1b' : '#475569' }}>{t.expiredItems}</div>
          <div style={{ ...styles.statValue, color: expiredCount > 0 ? '#b91c1c' : '#0f172a' }}>{expiredCount}</div>
        </div>
  
        <div style={{ 
          ...styles.statCard, 
          borderTop: '4px solid #f97316',
          backgroundColor: expiringSoonCount > 0 ? '#fff7ed' : '#ffffff'
        }}>
          <div style={{ ...styles.statLabel, color: expiringSoonCount > 0 ? '#9a3412' : '#475569' }}>{t.useWithinThreeDays}</div>
          <div style={{ ...styles.statValue, color: expiringSoonCount > 0 ? '#c2410c' : '#0f172a' }}>{expiringSoonCount}</div>
        </div>
  
        <div style={{ ...styles.statCard, borderTop: '4px solid #0288d1' }}>
          <div style={styles.statLabel}>{t.deficitShoppingItems}</div>
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
              <label style={styles.inputLabel}>{t.selectItem}</label>
              <input
                type="text"
                placeholder={t.typeToSearch}
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
                        title: t.enterCustom,
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
                    {t.nameNotOnList}
                    </div>
  
  {/* 1. LOCALIZED FILTERING AND MAPPING */}
  {PREDEFINED_ITEMS.filter(prod => {
    // Pull the correct language name string dynamically
    const currentItemName = typeof prod.name === 'object' ? prod.name[lang] : prod.name;
    return currentItemName.toLowerCase().includes(dropdownSearch.toLowerCase());
  }).map((prod, idx) => {
    // Pull localized string values safely
    const localizedName = typeof prod.name === 'object' ? prod.name[lang] : prod.name;
    const localizedLabel = typeof prod.label === 'object' ? prod.label[lang] : prod.label;

    return (
      <div
        key={idx} // Uses your new index key tracker
        onClick={() => {
          setPantryName(localizedName); // Uses localized standard value
          setDropdownSearch(localizedName);
          setShowSuggestions(false);

          // 2. KEEP YOUR SMART UNIT PRESET LOGIC WORKING
          const lowerName = localizedName.toLowerCase();
          if (['milk', 'juice', 'broth', 'water', 'vinegar', 'oil', 'cream', 'seltzer', 'litre', 'litre'].some(k => lowerName.includes(k))) {
            setPantryUnit('Liters');
          } else if (['egg', 'bread', 'waffles', 'bars', 'pizza', 'burritos', 'bags', 'pods', 'adet'].some(k => lowerName.includes(k))) {
            setPantryUnit('Pieces');
          } else {
            setPantryUnit('Kilograms');
          }
        }}
        style={styles.suggestionRowItem}
        className="autocomplete-item" // Adds your new class reference
      >
        {localizedLabel} {/* Displays the localized emoji + label text */}
      </div>
    );
  })}

  {/* 3. UPDATED NO MATCHES NO NOTIFICATION PANEL */}
  {PREDEFINED_ITEMS.filter(prod => {
    const currentItemName = typeof prod.name === 'object' ? prod.name[lang] : prod.name;
    return currentItemName.toLowerCase().includes(dropdownSearch.toLowerCase());
  }).length === 0 && (
    <div style={{ padding: '10px', color: '#64748b', fontSize: '0.85em', textAlign: 'center' }}>
      {lang === 'tr' ? 'Eşleşen ürün bulunamadı. Yukarıdaki özel seçeneğe tıklayın!' : 'No matches. Click the custom option at the top!'}
    </div>
  )}
</div>
)}
</div>
  
            {/* 2. QUANTITY INPUT FIELD */}
            <div style={{ flex: '1', minWidth: '100px' }}>
              <label style={styles.inputLabel}>{t.quantity}</label>
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
              <label style={styles.inputLabel}>{t.unit}</label>
              <select
                value={pantryUnit}
                onChange={(e) => setPantryUnit(e.target.value)}
                style={styles.formSelectInput}
              >
                <option value="Kilograms">{t.kilograms}</option>
                <option value="Liters">{t.liters}</option>
                <option value="Pieces">{t.pieces}</option>
                <option value="Packs">{t.packs}</option>
              </select>
            </div>
  
            {/* 4. EXPIRATION DATE PICKER */}
            <div style={{ flex: '1.5', minWidth: '150px' }}>
              <label style={styles.inputLabel}>{t.expirationDate}</label>
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
                {t.addToStock}
              </button>
            </div>
          </form>
  
          <h3>{t.currentStockBalance}</h3>





          {/* GLOBAL SEARCH & CATEGORY CONTROLS */}
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <div style={{ marginBottom: '12px' }}>
              <input 
                type="text" 
                placeholder={t.searchPantryItems} 
                value={pantrySearch}
                onChange={(e) => setPantrySearch(e.target.value)}
                style={styles.searchBar}
              />
            </div>
  
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <button onClick={() => setPantryFilter('all')} style={{ ...styles.filterTabBtn, backgroundColor: pantryFilter === 'all' ? '#e2e8f0' : '#ffffff', border: '1px solid #cbd5e1' }}>{t.allStockCondition}</button>
              <button onClick={() => setPantryFilter('expired')} style={{ ...styles.filterTabBtn, backgroundColor: pantryFilter === 'expired' ? '#fef2f2' : '#ffffff', color: '#b91c1c', border: pantryFilter === 'expired' ? '1px solid #ef4444' : '1px solid #cbd5e1' }}>{t.expired} ({expiredCount})</button>
              <button onClick={() => setPantryFilter('soon')} style={{ ...styles.filterTabBtn, backgroundColor: pantryFilter === 'soon' ? '#fff7ed' : '#ffffff', color: '#c2410c', border: pantryFilter === 'soon' ? '1px solid #f97316' : '1px solid #cbd5e1' }}>{t.urgent} ({expiringSoonCount})</button>
            </div>
  
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <span style={{ fontSize: '0.8em', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginRight: '6px' }}>{t.filterGroup}</span>
              {[
                { label: t.allCategories, value: 'all' },
                { label: t.produce, value: 'Fresh Produce' },
                { label: t.meat, value: 'Meat' },
                { label: t.dairy, value: 'Dairy' },
                { label: t.staples, value: 'Center Store' },
                { label: t.beverages, value: 'Beverages' },
                { label: t.household, value: 'Household' }
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
            <p style={styles.infoText}>{t.noMatchingInventory}</p>
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
                          {t.exp} {new Date(item.expiration_date).toLocaleDateString('en-GB')}
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
                        {t.depleted}
                      </button>
                      <button onClick={() => handlePantryDelete(item.id)} className="btn-animate" style={styles.actionBtnDanger}>
                        {t.delete}
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
            <h4 style={{ margin: '0 0 12px 0', color: '#0a3044' }}>{t.appendDeficitItem}</h4>
            <form onSubmit={handleShoppingSubmit} style={styles.formLayout}>
              <input 
                type="text" placeholder={t.itemRequirement} value={shopName}
                onChange={(e) => setShopName(e.target.value)} style={styles.inputField}
              />
              <input 
                type="number" step="0.01" placeholder="Qty" value={shopQuantity}
                onChange={(e) => setShopQuantity(e.target.value)} style={styles.inputQty}
              />
              <select value={shopUnit} onChange={(e) => setShopUnit(e.target.value)} style={styles.selectField}>
                <option value="pieces">{t.pieces}</option>
                <option value="Liters">{t.liters}</option>
                <option value="Grams">{t.grams}</option>
                <option value="Kilograms">{t.kilograms}</option>
                <option value="Packs">{t.packs}</option>
              </select>
              <button type="submit" className="btn-animate" style={styles.submitBtnBlue}>{t.addToList}</button>
            </form>
          </div>
  
          <h3 style={styles.sectionHeading}>{t.activeProcurementItems}</h3>
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

{currentTab === 'profile' && (
  <div style={{
    ...styles.pantryCard, // Matches your exact beautiful UI cards
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
  }}>
    <h2 style={{ margin: '0 0 16px 0', color: '#1e293b' }}> {t.profileTab}</h2>
    
    {/* Account Information Card */}
    <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '0.85em', color: '#64748b', fontWeight: '600' }}>{t.accountCreated}</div>
      <div style={{ fontWeight: '500', color: '#334155', marginBottom: '10px' }}>
        {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
      </div>
      
      <div style={{ fontSize: '0.85em', color: '#64748b', fontWeight: '600' }}>{t.securityStatus}</div>
      <div style={{ fontSize: '0.9em', color: '#10b981', fontWeight: '600' }}>{t.activeSession}</div>
    </div>

    {/* Update Profile Form */}
    <form onSubmit={async (e) => {
      e.preventDefault();
      if (!newUsername.trim() || !newEmail.trim()) {
        return Swal.fire({ icon: 'warning', title: 'Empty Fields', text: 'Credentials cannot be left empty.' });
      }
      try {
        setIsUpdatingProfile(true);
        const response = await axios.put(`${API_BASE_URL}/api/user/update`, {
          id: user?.id, // 👈 Explicitly passing the ID to find the record
          username: newUsername,
          email: newEmail
        }, getAuthConfig());
        
        const updatedUser = { ...user, username: response.data.username, email: response.data.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        Swal.fire({ icon: 'success', title: t.updateSuccess, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      } catch (err) {
        Swal.fire({ icon: 'error', title: t.updateFailed, text: err.response?.data?.error || 'Could not update profile details.' });
      } finally {
        setIsUpdatingProfile(false);
      }
    }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      <div>
        <label style={{ ...styles.inputLabel, display: 'block', marginBottom: '4px', fontWeight: '600' }}>{t.modifyUsername}</label>
        <input 
          type="text" 
          value={newUsername} 
          onChange={(e) => setNewUsername(e.target.value)}
          style={{ ...styles.formInput, width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      <div>
        <label style={{ ...styles.inputLabel, display: 'block', marginBottom: '4px', fontWeight: '600' }}>{t.modifyEmail}</label>
        <input 
          type="email" 
          value={newEmail} 
          onChange={(e) => setNewEmail(e.target.value)}
          style={{ ...styles.formInput, width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      <button 
        type="submit" 
        disabled={isUpdatingProfile}
        style={{
          padding: '10px 14px',
          backgroundColor: '#475569',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        {isUpdatingProfile ? 'Saving Details...' : t.applyChanges}
      </button>
    </form>

    <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', margin: '24px 0' }} />

    {/* Danger Zone */}
<div style={{ border: '1px solid #fee2e2', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '6px' }}>
  <h4 style={{ margin: '0 0 6px 0', color: '#991b1b', fontWeight: '700' }}>{t.dangerZone}</h4>
  <p style={{ margin: '0 0 12px 0', fontSize: '0.85em', color: '#7f1d1d' }}>
    {t.dangerText}
  </p>
  <button
    type="button"
    onClick={async () => {
      const confirmResult = await Swal.fire({
        title: t.deleteYourEntire,
        text: t.typeDeleteBelow,
        input: 'text',
        inputPlaceholder: t.delete,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#b91c1c',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: t.yesPermanently,
        preConfirm: (val) => {
          // 💡 FIXED: Explicitly return true if validation passes, otherwise show validation message
          if (val === 'DELETE') {
            return true; 
          } else {
            Swal.showValidationMessage(t.youMustType);
            return false;
          }
        }
      });

      // Now this hook triggers properly because preConfirm returns true
      // Inside your Danger Zone Swal confirmation block:
if (confirmResult.isConfirmed) {
  try {
    // 💡 FIXED: Pointing to the exact route your backend is listening for
    await axios.delete(`${API_BASE_URL}/auth/delete-account`, getAuthConfig());
    
    await Swal.fire({ 
      icon: 'success', 
      title: t.profileErased, 
      showConfirmButton: false, 
      timer: 1500 
    });
    
    if (typeof handleLogout === 'function') {
      handleLogout();
    } else {
      localStorage.clear();
      window.location.reload();
    }
  } catch (err) {
    console.error("Account erasure failed:", err);
    Swal.fire({ 
      icon: 'error', 
      title: 'Error processing request', 
      text: err.response?.data?.error || err.response?.data?.message || 'Server error.' 
    });
  }
}
    }}
    style={{
      width: '100%',
      padding: '10px',
      backgroundColor: '#ef4444',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '700',
      cursor: 'pointer'
    }}
  >
    {t.deleteBtn}
  </button>
</div>
  </div>
)}


  </div> // <--- This cleanly closes your main view component container block!
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