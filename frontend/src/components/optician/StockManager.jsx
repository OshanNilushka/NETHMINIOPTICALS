import { useState, useEffect } from "react";
import FrameCalibratorModal from "./FrameCalibratorModal";
import { API_BASE_URL } from "../../config/api";

const LENS_STOCK = [
  { id: "L001", name: "Single Vision Standard", material: "CR-39", coating: "Anti-Reflective", stock: 42, price: 45 },
  { id: "L002", name: "Single Vision Premium", material: "Polycarbonate", coating: "Blue Cut + AR", stock: 31, price: 75 },
  { id: "L003", name: "Progressive Standard", material: "CR-39", coating: "Anti-Reflective", stock: 18, price: 120 },
  { id: "L004", name: "Progressive Premium", material: "High-Index 1.67", coating: "Blue Cut + AR + UV", stock: 7, price: 195 },
  { id: "L005", name: "Bifocal", material: "Polycarbonate", coating: "Anti-Scratch", stock: 12, price: 90 },
];

const statusBadge = (status) => {
  const map = {
    "In Stock": "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "Low Stock": "bg-amber-50 text-amber-700 border border-amber-200",
    "Out of Stock": "bg-red-50 text-red-700 border border-red-200",
  };
  return map[status] || "bg-slate-100 text-slate-600";
};

export default function StockManager() {
  const [frames, setFrames] = useState([]);
  const [lenses, setLenses] = useState(LENS_STOCK);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("frames");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [calibratingFrame, setCalibratingFrame] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    brand: "",
    material: "Acetate",
    price: "",
    stock: "",
    threshold: 5,
    shape: "Square",
    gender: "UNISEX",
    file: null
  });
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchProducts = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load products");
        return res.json();
      })
      .then(data => {
        const mapped = data.map(f => ({
          ...f,
          stock: f.stockLevel,
          threshold: 5,
          status: f.stockLevel === 0 ? "Out of Stock" : f.stockLevel <= 5 ? "Low Stock" : "In Stock"
        }));
        setFrames(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        notify("Error fetching frames", "error");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const updateFrameStock = async (id, delta) => {
    const frame = frames.find(f => f.id === id);
    if (!frame) return;
    const newQty = Math.max(0, frame.stock + delta);

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ stockLevel: newQty })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update stock");
      }

      fetchProducts();
      notify("Stock updated successfully");
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const saveEdit = async (id) => {
    const qty = parseInt(editQty);
    if (isNaN(qty) || qty < 0) { notify("Invalid quantity", "error"); return; }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ stockLevel: qty })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to save stock");
      }

      setEditingId(null);
      fetchProducts();
      notify("Stock saved");
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const addFrame = async () => {
    if (!newItem.name || !newItem.brand || !newItem.material || !newItem.price || !newItem.stock) {
      notify("Fill all required fields", "error");
      return;
    }

    if (!newItem.file) {
      notify("Please upload a 3D model file (.glb)", "error");
      return;
    }

    const formData = new FormData();
    formData.append("name", newItem.name);
    formData.append("brand", newItem.brand);
    formData.append("material", newItem.material);
    formData.append("price", newItem.price);
    formData.append("shape", newItem.shape);
    formData.append("gender", newItem.gender);
    formData.append("stockLevel", newItem.stock);
    formData.append("file", newItem.file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to add frame");
      }

      setNewItem({
        name: "",
        brand: "",
        material: "Acetate",
        price: "",
        stock: "",
        threshold: 5,
        shape: "Square",
        gender: "UNISEX",
        file: null
      });
      setShowAddModal(false);
      fetchProducts();
      notify("Frame added to inventory");
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const deleteFrame = async (id) => {
    if (!window.confirm("Are you sure you want to delete this frame?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to delete frame");
      }

      fetchProducts();
      notify("Frame deleted from catalog");
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const isLensItem = (item) => {
    const shapeStr = (item.shape || '').toLowerCase();
    const nameStr = (item.name || '').toLowerCase();
    const imgStr = (item.imageUrl || '').toLowerCase();
    return shapeStr.includes('lens') || shapeStr.includes('contact') ||
      imgStr.includes('/lenses/') || imgStr.includes('contact') ||
      nameStr.includes('contact') || nameStr.includes('lens 1') ||
      nameStr.includes('bluecut');
  };

  const framesOnly = frames.filter(f => !isLensItem(f));
  const lensesOnly = frames.filter(f => isLensItem(f));

  const filteredFrames = framesOnly.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.brand.toLowerCase().includes(search.toLowerCase()) ||
    f.shape.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLenses = lensesOnly.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.brand.toLowerCase().includes(search.toLowerCase()) ||
    l.shape.toLowerCase().includes(search.toLowerCase()) ||
    l.material.toLowerCase().includes(search.toLowerCase())
  );

  const currentDataset = activeView === "frames" ? framesOnly : lensesOnly;

  const stats = {
    total: currentDataset.length,
    inStock: currentDataset.filter(f => f.status === "In Stock").length,
    lowStock: currentDataset.filter(f => f.status === "Low Stock").length,
    outOfStock: currentDataset.filter(f => f.status === "Out of Stock").length,
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 transition-all
          ${notification.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
          {notification.type === "error"
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          }
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Stock Manager</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">
            {activeView === "frames" ? "Monitor and update 3D eyeglass frame inventory" : "Monitor and update optical & contact lens stock levels"}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#1b5e85] hover:bg-[#154d70] text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Frame
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: activeView === "frames" ? "Total Frames" : "Total Lenses", value: stats.total, color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
          { label: "In Stock", value: stats.inStock, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Low Stock", value: stats.lowStock, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { label: "Out of Stock", value: stats.outOfStock, color: "text-red-700", bg: "bg-red-50 border-red-200" },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${s.bg}`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* View tabs */}
      <div className="flex gap-2 mb-5 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: "frames", label: ` Frames (${framesOnly.length})` },
          { id: "lenses", label: ` Lenses (${lensesOnly.length})` }
        ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveView(tab.id); setSearch(""); }}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeView === tab.id ? "bg-white text-[#1b5e85] shadow" : "text-slate-500 hover:text-slate-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={activeView === "frames" ? "Search frames by name, brand, or shape..." : "Search lenses by name, brand, or material..."}
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
      </div>

      {/* 1. FRAMES TAB */}
      {activeView === "frames" && (
        <>
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-bold">Loading frames...</div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Item</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Shape</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                      <th className="text-center px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                      <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-center px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredFrames.map(frame => (
                      <tr key={frame.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{frame.name}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{frame.brand} · {frame.material} · {frame.gender}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-medium">{frame.shape}</td>
                        <td className="px-5 py-4 text-slate-700 font-bold">LKR {frame.price.toLocaleString()}</td>
                        <td className="px-5 py-4 text-center">
                          {editingId === frame.id ? (
                            <div className="flex items-center justify-center gap-2">
                              <input
                                type="number" min="0"
                                value={editQty}
                                onChange={e => setEditQty(e.target.value)}
                                className="w-16 text-center border border-blue-300 rounded-lg py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                              />
                              <button onClick={() => saveEdit(frame.id)} className="text-emerald-600 hover:text-emerald-700 font-bold text-xs">Save</button>
                              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
                            </div>
                          ) : (
                            <span className={`font-extrabold text-lg ${frame.stock === 0 ? "text-red-500" : frame.stock <= frame.threshold ? "text-amber-500" : "text-slate-800"}`}>
                              {frame.stock}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusBadge(frame.status)}`}>
                            {frame.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => setCalibratingFrame(frame)} title="Calibrate 3D Model Fit" className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs flex items-center gap-1 transition-colors">
                              <span>🎯</span> Calibrate 3D
                            </button>
                            <button onClick={() => updateFrameStock(frame.id, -1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors">−</button>
                            <button onClick={() => updateFrameStock(frame.id, +1)} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold flex items-center justify-center transition-colors">+</button>
                            <button onClick={() => { setEditingId(frame.id); setEditQty(String(frame.stock)); }}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => deleteFrame(frame.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* 2. LENSES TAB */}
      {activeView === "lenses" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Lens Product</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Type / Brand</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="text-center px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLenses.map(lens => (
                  <tr key={lens.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {lens.imageUrl && (
                          <img src={lens.imageUrl} alt={lens.name} className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border border-slate-100" />
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{lens.name}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{lens.material}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {lens.shape} · {lens.brand}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-700">LKR {lens.price.toLocaleString()}</td>
                    <td className="px-5 py-4 text-center">
                      {editingId === lens.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="number" min="0"
                            value={editQty}
                            onChange={e => setEditQty(e.target.value)}
                            className="w-16 text-center border border-blue-300 rounded-lg py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                          />
                          <button onClick={() => saveEdit(lens.id)} className="text-emerald-600 hover:text-emerald-700 font-bold text-xs">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
                        </div>
                      ) : (
                        <span className={`font-extrabold text-lg ${lens.stock === 0 ? "text-red-500" : lens.stock <= lens.threshold ? "text-amber-500" : "text-slate-800"}`}>
                          {lens.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusBadge(lens.status)}`}>
                        {lens.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => updateFrameStock(lens.id, -1)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors">−</button>
                        <button onClick={() => updateFrameStock(lens.id, +1)} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold flex items-center justify-center transition-colors">+</button>
                        <button onClick={() => { setEditingId(lens.id); setEditQty(String(lens.stock)); }}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => deleteFrame(lens.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Frame Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7">
            <h2 className="text-xl font-extrabold text-slate-900 mb-5">Add New Frame</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-600 mb-1 block">Frame Name *</label>
                <input
                  type="text" value={newItem.name}
                  onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  placeholder="e.g. Vintage Aviator"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Brand *</label>
                <input
                  type="text" value={newItem.brand}
                  onChange={e => setNewItem(p => ({ ...p, brand: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  placeholder="e.g. Ray-Ban"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Material *</label>
                <select
                  value={newItem.material}
                  onChange={e => setNewItem(p => ({ ...p, material: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                >
                  <option value="Acetate">Acetate</option>
                  <option value="Metal">Metal</option>
                  <option value="Titanium">Titanium</option>
                  <option value="Plastic">Plastic</option>
                  <option value="TR90">TR90</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Price (LKR) *</label>
                <input
                  type="number" min="0" value={newItem.price}
                  onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  placeholder="e.g. 15000"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Initial Stock *</label>
                <input
                  type="number" min="0" value={newItem.stock}
                  onChange={e => setNewItem(p => ({ ...p, stock: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  placeholder="e.g. 10"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Shape (For AI) *</label>
                <select
                  value={newItem.shape}
                  onChange={e => setNewItem(p => ({ ...p, shape: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                >
                  <option value="Square">Square</option>
                  <option value="Round">Round</option>
                  <option value="Aviator">Aviator</option>
                  <option value="Rectangle">Rectangle</option>
                  <option value="Cat-Eye">Cat-Eye</option>
                  <option value="Geometric">Geometric</option>
                  <option value="Wayfarer">Wayfarer</option>
                  <option value="Clubmaster">Clubmaster</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Gender *</label>
                <select
                  value={newItem.gender}
                  onChange={e => setNewItem(p => ({ ...p, gender: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                >
                  <option value="UNISEX">Unisex</option>
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-slate-600 mb-1 block">3D Model File (.glb) *</label>
                <input
                  type="file"
                  accept=".glb"
                  onChange={e => setNewItem(p => ({ ...p, file: e.target.files[0] }))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={addFrame}
                className="flex-1 py-2.5 bg-[#1b5e85] text-white rounded-xl font-bold text-sm hover:bg-[#154d70] transition-colors">Add Frame</button>
            </div>
          </div>
        </div>
      )}

      {calibratingFrame && (
        <FrameCalibratorModal
          frame={calibratingFrame}
          onClose={() => setCalibratingFrame(null)}
          onSaveSuccess={fetchProducts}
        />
      )}
    </div>
  );
}
