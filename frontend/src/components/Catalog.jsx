import React, { useState, useEffect } from 'react';
import GlassesViewer from './Glassviwer';
import CheckoutCustomizerModal from './CheckoutCustomizerModal';
import { API_BASE_URL } from '../config/api';

class GlassesErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("GlassesViewer rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Import the 3D model assets
import glassesModel from '../assets/models/glasses.glb';
import blackGlassesModel from '../assets/models/black_glasses.glb';
import metalRoundModel from '../assets/models/metal_round_glasses.glb';
import rayBanModel from '../assets/models/ray_ban_glasses.glb';
import oakleyModel from '../assets/models/oakley_glasses.glb';
import glasses2Model from '../assets/models/glasses_2.glb';
import glasses08Model from '../assets/models/glasses_08.glb';
import glasses09Model from '../assets/models/glasses_09.glb';
import cartoonGlassesModel from '../assets/models/cartoon_glasses.glb';
import glasses12Model from '../assets/models/glasses (12).glb';
import glasses13Model from '../assets/models/glasses (13).glb';
import sunGlassesModel from '../assets/models/sun_glasses.glb';

// Maps backend image URLs/model keys to imported Vite assets
const MODEL_MAP = {
  "/src/assets/ray_ban_glasses.glb": rayBanModel,
  "/src/assets/oakley_glasses.glb": oakleyModel,
  "/src/assets/metal_round_glasses.glb": metalRoundModel,
  "/src/assets/cartoon_glasses.glb": cartoonGlassesModel,
  "glasses.glb": glassesModel,
  "black_glasses.glb": blackGlassesModel,
  "metal_round_glasses.glb": metalRoundModel,
  "ray_ban_glasses.glb": rayBanModel,
  "oakley_glasses.glb": oakleyModel,
  "glasses_2.glb": glasses2Model,
  "glasses_08.glb": glasses08Model,
  "glasses_09.glb": glasses09Model,
  "cartoon_glasses.glb": cartoonGlassesModel,
  "glasses (12).glb": glasses12Model,
  "glasses (13).glb": glasses13Model,
  "sun_glasses.glb": sunGlassesModel,
};

const getModelFile = (url) => {
  if (!url) return glassesModel;
  if (MODEL_MAP[url]) return MODEL_MAP[url];
  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const filename = url.substring(url.lastIndexOf('/') + 1);
  return MODEL_MAP[filename] || glassesModel;
};

const getModelPath = (item) => {
  if (item.modelUrl) {
    if (MODEL_MAP[item.modelUrl] || item.modelUrl.toLowerCase().endsWith('.glb')) {
      return item.modelUrl;
    }
  }
  if (item.imageUrl) {
    if (MODEL_MAP[item.imageUrl] || item.imageUrl.toLowerCase().endsWith('.glb')) {
      return item.imageUrl;
    }
  }
  return null;
};

const getProductImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/lenses/')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

function LazyGlassesViewer({ modelPath }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      {isVisible ? (
        <GlassesViewer modelPath={modelPath} height="h-full" autoRotate={false} enableZoom={false} isListMode={true} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 rounded-xl">
          <div className="animate-pulse flex flex-col items-center">
            <svg className="w-12 h-12 text-slate-350 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-[10px] text-slate-400 mt-2.5 font-bold tracking-wider uppercase">Loading 3D Frame...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Option A: Rule-Based face shape to frame shape recommendation mapping
const RECOMMENDATION_RULES = {
  oval: ['Rectangle', 'Geometric', 'Square', 'Aviator', 'Wayfarer', 'Clubmaster'],
  round: ['Rectangle', 'Square', 'Geometric', 'Wayfarer', 'Clubmaster'],
  square: ['Round', 'Oval', 'Aviator', 'Cat-Eye'],
  heart: ['Round', 'Aviator', 'Oval', 'Clubmaster'],
  diamond: ['Round', 'Oval', 'Geometric', 'Aviator', 'Cat-Eye'],
  oblong: ['Rectangle', 'Square', 'Geometric', 'Aviator', 'Wayfarer'],
};

export default function Catalog({ isDashboardView = false, onCheckoutSuccess }) {
  const userEmail = localStorage.getItem("user_email");
  const cartKey = userEmail ? `cart_${userEmail}` : "cart";
  const favoritesKey = userEmail ? `favorites_${userEmail}` : "favorites";

  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filters, setFilters] = useState({ priceRange: [], faceShapes: [] });

  // New States for Cart, Wishlist, and Notifications
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem(cartKey) || "[]"));
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem(favoritesKey) || "[]"));
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Modal open trigger
  const [isCheckoutCustomizerOpen, setIsCheckoutCustomizerOpen] = useState(false);

  // Sync Cart and Favorites to localStorage
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  useEffect(() => {
    localStorage.setItem(favoritesKey, JSON.stringify(favorites));
  }, [favorites, favoritesKey]);



  // Merge guest cart on mount if it exists
  useEffect(() => {
    const guestCart = localStorage.getItem("guest_cart");
    if (guestCart) {
      try {
        const parsed = JSON.parse(guestCart);
        if (parsed && parsed.length > 0) {
          setCart((prev) => {
            const merged = [...prev];
            parsed.forEach((guestItem) => {
              const existing = merged.find((item) => item.id === guestItem.id);
              if (existing) {
                existing.quantity += guestItem.quantity;
              } else {
                merged.push(guestItem);
              }
            });
            return merged;
          });
        }
      } catch (err) {
        console.error("Failed to parse guest cart", err);
      }
      localStorage.removeItem("guest_cart");
    }

    // Auto-open checkout customization modal if returning from guest-redirected login
    const checkoutAfterLogin = localStorage.getItem("checkout_after_login");
    if (checkoutAfterLogin === "true") {
      localStorage.removeItem("checkout_after_login");
      localStorage.removeItem("guest_order");
      setIsCheckoutCustomizerOpen(true);
    }
  }, []);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateCartQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const handleCheckout = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      const guestOrderPayload = {
        items: cart.map((item) => ({
          frameId: item.id,
          lensId: null,
          quantity: item.quantity,
        })),
        prescriptionId: null
      };
      localStorage.setItem("guest_order", JSON.stringify(guestOrderPayload));
      localStorage.setItem("guest_cart", JSON.stringify(cart));
      setShowLoginPrompt(true);
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setIsCheckoutCustomizerOpen(true);
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then(data => {
        setCatalog(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handlePriceChange = (e) => {
    const { value, checked } = e.target;
    setFilters((prev) => {
      const newRanges = checked
        ? [...prev.priceRange, value]
        : prev.priceRange.filter((r) => r !== value);
      return { ...prev, priceRange: newRanges };
    });
  };

  const handleFaceShapeChange = (e) => {
    const { value, checked } = e.target;
    setFilters((prev) => {
      const newShapes = checked
        ? [...prev.faceShapes, value]
        : prev.faceShapes.filter((s) => s !== value);
      return { ...prev, faceShapes: newShapes };
    });
  };

  const filteredCatalog = catalog.filter((item) => {
    // 0. Category Tab Filter
    const shapeStr = (item.shape || '').toLowerCase();
    const nameStr = (item.name || '').toLowerCase();
    const imgStr = (item.imageUrl || '').toLowerCase();

    const isContactLens = shapeStr.includes('contact') || imgStr.includes('contact') || nameStr.includes('contact');
    const isOpticalLens = shapeStr.includes('optical') || imgStr.includes('lens 1') || nameStr.includes('lens 1') || nameStr.includes('bluecut');
    const isLens = isContactLens || isOpticalLens || (item.imageUrl && item.imageUrl.startsWith('/lenses/'));
    const isFrame = !isLens;

    if (selectedCategory === "frames" && !isFrame) return false;
    if (selectedCategory === "contact-lenses" && !isContactLens) return false;
    if (selectedCategory === "optical-lenses" && !isOpticalLens) return false;

    // 1. Price Range filter
    const priceOk =
      filters.priceRange.length === 0 ||
      filters.priceRange.some((range) => {
        if (range === "<15000") return item.price < 15000;
        if (range === "15000-20000")
          return item.price >= 15000 && item.price <= 20000;
        if (range === ">20000") return item.price > 20000;
        return true;
      });

    // 2. Face Shape recommendation filter (Option A - Applies only to frames)
    const shapeOk =
      filters.faceShapes.length === 0 ||
      isLens ||
      filters.faceShapes.some((faceShape) => {
        const recommendedShapes = RECOMMENDATION_RULES[faceShape.toLowerCase()] || [];
        return recommendedShapes.map(s => s.toLowerCase()).includes((item.shape || '').toLowerCase());
      });

    // 3. Favorites filter
    const favoritesOk = !showFavoritesOnly || favorites.includes(item.id);

    return priceOk && shapeOk && favoritesOk;
  });

  if (loading) {
    return (
      <div className={`flex items-center justify-center font-sans ${isDashboardView ? "py-16" : "min-h-screen bg-[#f8fafc]"}`}>
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-500 font-bold">Loading Frame Catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center font-sans ${isDashboardView ? "py-16" : "min-h-screen bg-[#f8fafc]"}`}>
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl max-w-md text-center shadow">
          <h3 className="text-lg font-black mb-2">Error Loading Catalog</h3>
          <p className="text-sm font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDashboardView ? "bg-transparent p-2" : "min-h-screen bg-[#f8fafc] p-8"} text-slate-800 font-sans`}>
      <div className={isDashboardView ? "w-full" : "max-w-7xl mx-auto"}>
        <header className="mb-12 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">
            Smart Frame <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 font-extrabold">Catalog</span>
          </h1>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[#00aaff] text-slate-700 hover:text-[#00aaff] transition-all duration-300 shadow-sm cursor-pointer"
            aria-label="View Cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cart.reduce((total, item) => total + item.quantity, 0) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow animate-bounce">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-8 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] text-slate-300">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Filters</h3>
                </div>
                {(filters.priceRange.length > 0 || filters.faceShapes.length > 0) && (
                  <button
                    onClick={() => setFilters({ priceRange: [], faceShapes: [] })}
                    className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-8">
                {/* Price Range */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-4">By Price (LKR)</h4>
                  <div className="flex flex-col gap-3">
                    {[
                      { value: '<15000', label: 'Under 15K' },
                      { value: '15000-20000', label: '15K - 20K' },
                      { value: '>20000', label: 'Over 20K' }
                    ].map((range) => {
                      const isChecked = filters.priceRange.includes(range.value);
                      return (
                        <label
                          key={range.value}
                          className={`cursor-pointer p-3 rounded-xl text-sm font-semibold transition-all duration-300 border select-none flex items-center justify-between
                            ${isChecked
                              ? 'bg-[#00aaff] text-white border-[#00aaff] shadow-[0_4px_12px_rgba(0,170,255,0.3)]'
                              : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-[#00aaff]/40 hover:bg-slate-800 hover:text-slate-200'}`}
                        >
                          <span>{range.label}</span>
                          <input
                            type="checkbox"
                            value={range.value}
                            checked={isChecked}
                            onChange={handlePriceChange}
                            className="hidden"
                          />
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isChecked ? 'border-white bg-white/20' : 'border-slate-600'}`}>
                            {isChecked && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Favorites Only */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-4">Saved Items</h4>
                  <label
                    className={`cursor-pointer p-3 rounded-xl text-sm font-semibold transition-all duration-300 border select-none flex items-center justify-between
                      ${showFavoritesOnly
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_4px_12px_rgba(244,63,94,0.15)]'
                        : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-rose-500/40 hover:bg-slate-800 hover:text-slate-200'}`}
                  >
                    <span>Show Favorites Only</span>
                    <input
                      type="checkbox"
                      checked={showFavoritesOnly}
                      onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                      className="hidden"
                    />
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${showFavoritesOnly ? 'border-rose-450 bg-rose-500/20' : 'border-slate-600'}`}>
                      {showFavoritesOnly && <svg className="w-3.5 h-3.5 text-rose-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>}
                    </div>
                  </label>
                </div>

                {/* Face Shapes */}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-4">By Face Shape</h4>
                  <div className="flex flex-wrap gap-2">
                    {['oval', 'round', 'square', 'heart', 'diamond', 'oblong'].map((shape) => {
                      const isChecked = filters.faceShapes.includes(shape);
                      return (
                        <label
                          key={shape}
                          className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border select-none capitalize
                            ${isChecked
                              ? 'bg-slate-100 text-slate-900 border-slate-100 shadow-[0_4px_12px_rgba(255,255,255,0.15)]'
                              : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}
                        >
                          <input
                            type="checkbox"
                            value={shape}
                            checked={isChecked}
                            onChange={handleFaceShapeChange}
                            className="hidden"
                          />
                          {shape}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Category Selection Tabs */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none flex-wrap">
              {[
                { id: "all", label: "All Items", count: catalog.length },
                { id: "frames", label: "Eyeglass Frames", count: catalog.filter(i => !i.shape?.toLowerCase().includes('lens') && !i.imageUrl?.startsWith('/lenses/')).length },
                { id: "contact-lenses", label: "Contact Lenses", count: catalog.filter(i => (i.shape && i.shape.toLowerCase().includes('contact')) || (i.imageUrl && i.imageUrl.toLowerCase().includes('contact'))).length },
                { id: "optical-lenses", label: "Optical Lenses", count: catalog.filter(i => (i.shape && i.shape.toLowerCase().includes('optical')) || (i.name && i.name.toLowerCase().includes('lens 1')) || (i.name && i.name.toLowerCase().includes('bluecut'))).length },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${selectedCategory === cat.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-[1.02]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 shadow-sm"
                    }`}
                >
                  <span>{cat.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${selectedCategory === cat.id ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {filteredCatalog.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCatalog.map((item) => (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredCard(item.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_35px_rgba(0,170,255,0.1)] hover:border-[#00aaff]/50 transition-all duration-300 group hover:-translate-y-1"
                  >
                    <div>
                      <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-50 mb-4 relative border border-slate-100/50 flex items-center justify-center">
                        {(() => {
                          const modelPath = getModelPath(item);
                          return modelPath ? (
                            <GlassesErrorBoundary fallback={
                              <div className="flex flex-col items-center justify-center text-slate-350 p-4">
                                <svg className="w-20 h-20 mb-1 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 9c0-1.5 1.5-3 3.5-3s3.5 1.5 3.5 3c0 2-2.5 3.5-3.5 3.5S4 11 4 9zm13 0c0-1.5 1.5-3 3.5-3S24 7.5 24 9c0 2-2.5 3.5-3.5 3.5S17 11 17 9z M11 9.5h5" />
                                </svg>
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Failed to load 3D model</span>
                              </div>
                            }>
                              <LazyGlassesViewer modelPath={getModelFile(modelPath)} />
                            </GlassesErrorBoundary>
                          ) : (
                            <img
                              src={getProductImageUrl(item.imageUrl)}
                              alt={item.name}
                              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                            />
                          );
                        })()}
                        <span className="absolute top-2 left-2 text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full z-10">
                          {item.shape}
                        </span>

                        {/* Favorites Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          className={`absolute top-2 right-2 w-8 h-8 rounded-full border border-slate-200/60 backdrop-blur-md shadow flex items-center justify-center cursor-pointer transition-all duration-300 z-10
                            ${favorites.includes(item.id)
                              ? 'bg-rose-500 border-rose-500 text-white'
                              : 'bg-white/70 text-slate-450 hover:text-rose-500'}`}
                          aria-label="Toggle Favorite"
                        >
                          <svg className="w-4.5 h-4.5" fill={favorites.includes(item.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">{item.name}</h3>
                      <p className="text-lg font-bold text-[#1b5e85] mt-1">LKR {item.price.toLocaleString()}</p>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <button
                        onClick={() => setSelectedProduct(item)}
                        className="flex-1 bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-3 rounded-xl transition-all duration-200 border-none cursor-pointer text-xs"
                      >
                        {getModelPath(item) ? "Inspect 3D" : "Quick View"}
                      </button>
                      <button
                        onClick={() => addToCart(item)}
                        className="flex-1 bg-[#00aaff] hover:bg-[#0099ee] text-white font-bold py-2.5 px-3 rounded-xl transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,170,255,0.25)] border-none cursor-pointer text-xs"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 bg-white/50 rounded-3xl border border-white/50 border-dashed text-center min-h-[400px]">
                <div className="w-20 h-20 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No frames found</h3>
                <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any frames matching your selected filters. Try adjusting your search criteria.</p>
                <button
                  onClick={() => setFilters({ priceRange: [], faceShapes: [] })}
                  className="mt-6 px-6 py-2.5 bg-[#00aaff] text-white font-bold rounded-xl hover:bg-[#0099ee] transition-all duration-300 hover:shadow-[0_4px_15px_rgba(0,170,255,0.3)] hover:-translate-y-0.5 border-none cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>

        {selectedProduct && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-100 w-full max-w-6xl rounded-3xl p-8 relative shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col md:flex-row gap-8 items-stretch">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-200 z-10"
              >
                ✕
              </button>

              {/* Left side: 3D model or image */}
              <div className="flex-1 min-h-[350px] md:min-h-[600px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative flex items-center justify-center">
                {(() => {
                  const modelPath = getModelPath(selectedProduct);
                  return modelPath ? (
                    <GlassesViewer modelPath={getModelFile(modelPath)} height="h-full" />
                  ) : (
                    <img
                      src={getProductImageUrl(selectedProduct.imageUrl)}
                      alt={selectedProduct.name}
                      className="max-w-full max-h-[500px] object-contain p-6"
                    />
                  );
                })()}
              </div>

              {/* Right side: details */}
              <div className="w-full md:w-[320px] flex flex-col justify-between py-4">
                <div>
                  <span className="text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-full inline-block mb-4">
                    {selectedProduct.shape} Frame
                  </span>
                  <h2 className="text-3xl font-extrabold text-slate-800 mb-2">{selectedProduct.name}</h2>
                  <p className="text-2xl font-bold text-[#1b5e85] mb-6">LKR {selectedProduct.price.toLocaleString()}</p>

                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Specifications</h4>
                    <ul className="text-sm text-slate-600 space-y-2.5 list-none p-0 m-0">
                      <li className="flex justify-between">
                        <span className="text-slate-400">Material</span>
                        <span className="font-semibold text-slate-700">{selectedProduct.material}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-slate-400">Gender</span>
                        <span className="font-semibold text-slate-700 capitalize">{selectedProduct.gender.toLowerCase()}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-slate-400">Hinge</span>
                        <span className="font-semibold text-slate-700">Flexible Spring Hinge</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full bg-[#00aaff] hover:bg-[#0099ee] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_4px_15px_rgba(0,170,255,0.3)] border-none cursor-pointer"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 border-none cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Drawer Overlay */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm animate-[fadeIn_0.25s_ease]">
            <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />
            <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl p-6 animate-[slideLeft_0.3s_cubic-bezier(0.16,1,0.3,1)]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                  🛍️ Shopping Cart
                  <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                    {cart.reduce((total, item) => total + item.quantity, 0)} items
                  </span>
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border-none"
                >
                  ✕
                </button>
              </div>

              {/* Cart Items List */}
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <svg className="w-16 h-16 mb-4 text-slate-700 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="font-semibold text-slate-400">Cart is empty</p>
                  <p className="text-xs text-slate-600 mt-1">Browse catalog and add frames to start trying them on.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3.5 bg-slate-800/40 border border-slate-850 rounded-2xl items-center">
                      <div className="w-16 h-16 rounded-xl bg-slate-950 overflow-hidden border border-slate-800 shrink-0 relative flex items-center justify-center">
                        {(() => {
                          const modelPath = getModelPath(item);
                          return modelPath ? (
                            <GlassesViewer modelPath={getModelFile(modelPath)} height="h-full" autoRotate={false} enableZoom={false} />
                          ) : (
                            <img
                              src={getProductImageUrl(item.imageUrl)}
                              alt={item.name}
                              className="w-full h-full object-contain p-1"
                            />
                          );
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-100 truncate">{item.name}</h4>
                        <p className="text-[10px] text-slate-555 font-semibold">{item.color} · LKR {item.price.toLocaleString()}</p>

                        <div className="flex items-center gap-2.5 mt-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer border-none"
                          >
                            −
                          </button>
                          <span className="text-xs font-bold font-mono text-slate-200">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 font-bold text-xs flex items-center justify-center cursor-pointer border-none"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="font-extrabold text-sm text-blue-400">LKR {(item.price * item.quantity).toLocaleString()}</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[10px] font-bold text-rose-400 hover:underline cursor-pointer bg-transparent border-none"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cart Summary */}
              {cart.length > 0 && (
                <div className="border-t border-slate-800 pt-4 mt-4 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-semibold">Subtotal:</span>
                    <span className="font-black text-xl text-blue-400">
                      LKR {cart.reduce((total, item) => total + item.price * item.quantity, 0).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-[#00aaff] hover:bg-[#0099ee] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_4px_15px_rgba(0,170,255,0.3)] border-none cursor-pointer text-sm"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Guest Login Required Modal */}
        {showLoginPrompt && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 text-center text-slate-200">
              <div className="w-16 h-16 bg-blue-500/10 border border-blue-550/20 text-blue-400 rounded-full flex items-center justify-center mx-auto shadow-inner text-2xl">
                🔑
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Login Required</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  You need to log in to place an order. We will save your cart items and take you back here automatically after login.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 py-2.5 border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-350 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <a
                  href="#/login"
                  onClick={() => {
                    const guestOrderPayload = {
                      items: cart.map((item) => ({
                        frameId: item.id,
                        lensId: null,
                        quantity: item.quantity,
                      })),
                      prescriptionId: null
                    };
                    localStorage.setItem("guest_order", JSON.stringify(guestOrderPayload));
                    localStorage.setItem("guest_cart", JSON.stringify(cart));
                    setShowLoginPrompt(false);
                  }}
                  className="flex-1 py-2.5 bg-[#00aaff] hover:bg-[#0099ee] text-white font-bold text-xs rounded-xl text-center no-underline flex items-center justify-center cursor-pointer"
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Isolated Checkout Customization Modal (Instant 60fps typing) */}
        <CheckoutCustomizerModal
          isOpen={isCheckoutCustomizerOpen}
          onClose={() => setIsCheckoutCustomizerOpen(false)}
          cart={cart}
          onClearCart={() => {
            setCart([]);
            setIsCartOpen(false);
          }}
          onOrderSuccess={() => {
            setCheckoutSuccess(true);
            setTimeout(() => setCheckoutSuccess(false), 5000);
            if (onCheckoutSuccess) onCheckoutSuccess();
          }}
        />

        {/* Style tags for keyframe animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideLeft {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `
        }} />
      </div>
    </div>
  );
}