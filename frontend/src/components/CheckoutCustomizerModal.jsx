import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  Glasses, 
  Truck, 
  CreditCard, 
  Banknote, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';

const DEFAULT_REAL_LENSES = [
  { id: "lens-1", type: "Lens 1 - BlueCut Precision Optical Lens", brand: "Essilor Crizal", price: 8500, description: "UV420 Blue-light blocker with ultra-clear anti-glare coating" },
  { id: "lens-2", type: "Crizal Anti-Reflective Hydrophobic Lens", brand: "Essilor", price: 6500, description: "Hydrophobic, smudge-resistant anti-glare coating" },
  { id: "lens-3", type: "Essilor Transitions Gen 8 Photochromic Lens", brand: "Essilor", price: 14000, description: "Auto-darkening UV responsive light intelligent lenses" },
  { id: "lens-4", type: "Carl Zeiss Progressive Digital HD Lens", brand: "Carl Zeiss", price: 18500, description: "Precision progressive multi-focal lens for smooth distance to near vision" },
  { id: "lens-5", type: "1.67 Ultra-Thin High-Index Lens", brand: "Hoya", price: 11500, description: "High-index ultra slim lightweight lens for higher prescription powers" },
  { id: "lens-6", type: "Standard Hard-Coated Scratch Resistant Lens", brand: "Standard", price: 3500, description: "Durable daily optical lens with scratch resistant hard coating" }
];

export default function CheckoutCustomizerModal({
  isOpen,
  onClose,
  cart,
  onOrderSuccess,
  onClearCart
}) {
  // Modal Local States — isolated to ensure 60fps instant typing speed
  const [lenses, setLenses] = useState(DEFAULT_REAL_LENSES);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedLenses, setSelectedLenses] = useState({});
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real lenses and prescriptions on open
  useEffect(() => {
    if (!isOpen) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // 1. Fetch real lenses from API
    fetch(`${API_BASE_URL}/api/products/lenses`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setLenses(data);
        }
      })
      .catch(err => console.error("Error loading lenses:", err));

    // 2. Fetch validated prescriptions
    fetch(`${API_BASE_URL}/api/prescriptions`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const validatedOnly = data.filter(rx => rx.isValidated || rx.status === "VALIDATED");
        setPrescriptions(validatedOnly);
        if (validatedOnly.length > 0) {
          setSelectedPrescriptionId(validatedOnly[0].id);
        }
      })
      .catch(err => console.error("Error loading prescriptions:", err));

    // 3. Auto-pair if customer has both frame and standalone lens in cart
    const standaloneLensInCart = cart.find(i => 
      (i.shape && i.shape.toLowerCase().includes('optical')) || 
      (i.name && i.name.toLowerCase().includes('lens 1'))
    );

    const initialLensSelection = {};
    cart.forEach(item => {
      const isContact = (item.shape && item.shape.toLowerCase().includes('contact')) || 
                        (item.imageUrl && item.imageUrl.toLowerCase().includes('contact'));
      const isLensItem = (item.shape && item.shape.toLowerCase().includes('lens'));

      if (!isContact && !isLensItem && standaloneLensInCart) {
        initialLensSelection[item.id] = {
          id: standaloneLensInCart.id,
          type: standaloneLensInCart.name,
          brand: standaloneLensInCart.brand || "Essilor",
          price: standaloneLensInCart.price || 8500
        };
      }
    });
    setSelectedLenses(initialLensSelection);

  }, [isOpen, cart]);

  if (!isOpen) return null;

  // Cost calculations
  const totalItemsAmount = cart.reduce((total, item) => {
    const lensPrice = selectedLenses[item.id]?.price || 0;
    return total + (item.price + lensPrice) * item.quantity;
  }, 0);

  const isFreeShipping = totalItemsAmount >= 10000;
  const shippingCost = isFreeShipping ? 0 : 350;
  const grandTotal = totalItemsAmount + shippingCost;

  // Check if any frame requires prescription
  const hasPrescriptionLensesSelected = Object.values(selectedLenses).some(
    lens => lens && lens.price > 0
  );

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to complete your checkout.");
      return;
    }

    if (!recipientName.trim() || !recipientPhone.trim() || !shippingAddress.trim()) {
      alert("Please fill in all shipping details (Recipient Name, Phone Number, and Delivery Address).");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        items: cart.map((item) => ({
          frameId: item.id,
          lensId: selectedLenses[item.id]?.id || null,
          quantity: item.quantity,
        })),
        prescriptionId: selectedPrescriptionId || null,
        shippingAddress,
        recipientName,
        recipientPhone,
        shippingCost,
        paymentMethod
      };

      // Step 1: Create Order in Backend DB
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to place order.");
      }

      const order = await response.json();

      // Step 2: Handle Online Card Payment (PayHere Sandbox)
      if (paymentMethod === "CARD") {
        const payRes = await fetch(`${API_BASE_URL}/api/orders/payhere-hash`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            amount: grandTotal,
            currency: "LKR"
          })
        });

        if (!payRes.ok) {
          throw new Error("Could not initialize PayHere payment gateway.");
        }

        const payData = await payRes.json();

        // Submit form directly to PayHere Sandbox
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://sandbox.payhere.lk/pay/checkout";

        const fields = {
          merchant_id: payData.merchant_id,
          return_url: payData.return_url,
          cancel_url: payData.cancel_url,
          notify_url: payData.notify_url,
          order_id: payData.order_id,
          items: cart.map(i => i.name || "Optical Item").join(", "),
          currency: payData.currency,
          amount: payData.amount,
          first_name: recipientName.split(" ")[0] || recipientName,
          last_name: recipientName.split(" ").slice(1).join(" ") || ".",
          email: localStorage.getItem("user_email") || "customer@insightopticals.lk",
          phone: recipientPhone,
          address: shippingAddress,
          city: "Colombo",
          country: "Sri Lanka",
          hash: payData.hash,
        };

        Object.entries(fields).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      // Step 3: Cash on Delivery (COD) Success
      if (onClearCart) onClearCart();
      if (onOrderSuccess) onOrderSuccess();
      onClose();
      alert("🎉 Order placed successfully! You can track real-time lens fitting & delivery status in your Customer Dashboard.");

    } catch (err) {
      console.error(err);
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease]">
      <div 
        className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl p-6 md:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.18)] space-y-6 text-slate-800 text-left max-h-[92vh] overflow-y-auto font-sans relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-150 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Optical Order Customizer
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 pt-1">
              Customize Lenses & Checkout
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Pair precision lenses, link doctor prescription, and enter express delivery details.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-9 h-9 rounded-2xl flex items-center justify-center transition-all cursor-pointer border border-slate-200 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="space-y-6">
          
          {/* STEP 1: Select Lenses For Each Item */}
          <div className="space-y-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                Select Lenses for Each Item
              </h4>
              <span className="text-[11px] text-slate-500 font-bold">{cart.length} item{cart.length > 1 ? 's' : ''} in cart</span>
            </div>

            <div className="space-y-3">
              {cart.map((item) => {
                const shapeStr = (item.shape || '').toLowerCase();
                const nameStr = (item.name || '').toLowerCase();
                const imgStr = (item.imageUrl || '').toLowerCase();

                const isContactLens = shapeStr.includes('contact') || imgStr.includes('contact') || nameStr.includes('contact');
                const isOpticalLens = shapeStr.includes('optical') || imgStr.includes('lens 1') || nameStr.includes('lens 1');
                const isDirectProduct = isContactLens || isOpticalLens;

                const currentLens = selectedLenses[item.id];
                const lensExtraPrice = currentLens?.price || 0;
                const itemSubtotal = (item.price + lensExtraPrice) * item.quantity;

                return (
                  <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-400 hover:shadow-md transition-all">
                    {/* Item Details */}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {isContactLens ? (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-black uppercase tracking-wider">
                            👁️ Contact Lens Pack
                          </span>
                        ) : isOpticalLens ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black uppercase tracking-wider">
                            🔬 Optical Lens
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider">
                            👓 Eyeglass Frame
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-semibold">Qty: {item.quantity}</span>
                      </div>
                      <p className="font-extrabold text-sm text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500 font-medium">Base Price: LKR {item.price.toLocaleString()}</p>
                    </div>

                    {/* Lens Selector (Frames Only) */}
                    <div className="w-full md:w-64 space-y-1">
                      {isDirectProduct ? (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Direct Fitting Product
                          </span>
                        </div>
                      ) : (
                        <>
                          <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">
                            Choose Optical Lens:
                          </label>
                          <select
                            value={currentLens?.id || ""}
                            onChange={(e) => {
                              const lensId = e.target.value;
                              const selectedObj = lenses.find(l => l.id === lensId);
                              setSelectedLenses(prev => ({ ...prev, [item.id]: selectedObj || null }));
                            }}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm"
                          >
                            <option value="">Frame Only (No Lens Added) — LKR 0</option>
                            {lenses.map((lens) => (
                              <option key={lens.id} value={lens.id}>
                                {lens.type} (+LKR {lens.price.toLocaleString()})
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>

                    {/* Item Subtotal */}
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Subtotal</span>
                      <span className="text-base font-black text-blue-600">LKR {itemSubtotal.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Attach Doctor Prescription */}
          <div className="space-y-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                Attach Doctor Prescription
              </h4>
              {!hasPrescriptionLensesSelected && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                  ✓ Optional for Frame Only
                </span>
              )}
            </div>

            {prescriptions.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs space-y-1.5 leading-relaxed">
                <p className="font-extrabold flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" /> No Validated Prescriptions Found
                </p>
                <p className="text-amber-800/90 text-xs font-medium">
                  {hasPrescriptionLensesSelected 
                    ? "You selected prescription lenses, but don't have a verified optical slip yet. You can still order as 'Frame Only', or upload your slip in the Customer Dashboard for doctor validation."
                    : "No doctor prescription required for 'Frame Only' orders. We will deliver your frames directly!"}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <select
                  value={selectedPrescriptionId}
                  onChange={(e) => setSelectedPrescriptionId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm"
                >
                  <option value="">Do not attach prescription (Frame Only / Direct)</option>
                  {prescriptions.map((rx) => (
                    <option key={rx.id} value={rx.id}>
                      Doctor Rx ({rx.createdAt.split('T')[0]}) — OD: {rx.odSph?.toFixed(2) || "0.00"} | OS: {rx.osSph?.toFixed(2) || "0.00"}
                    </option>
                  ))}
                </select>

                {selectedPrescriptionId && (
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1 font-mono">
                    {(() => {
                      const activeRx = prescriptions.find(r => r.id === selectedPrescriptionId);
                      if (!activeRx) return null;
                      return (
                        <>
                          <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider font-sans">
                            Linked Clinical Prescription Metrics:
                          </p>
                          <p>OD (Right Eye): SPH {activeRx.odSph?.toFixed(2) || "0.00"} | CYL {activeRx.odCyl?.toFixed(2) || "0.00"} | AXIS {activeRx.odAxis || "0"}°</p>
                          <p>OS (Left Eye):  SPH {activeRx.osSph?.toFixed(2) || "0.00"} | CYL {activeRx.osCyl?.toFixed(2) || "0.00"} | AXIS {activeRx.osAxis || "0"}°</p>
                          <p>Pupillary Distance (PD): {activeRx.pd ? `${activeRx.pd} mm` : "Standard"}</p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 3: Shipping Details (Instant 60fps Input) */}
          <div className="space-y-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
              Shipping & Delivery Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Recipient Full Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tharindu Madhushanka"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" /> Contact Phone Number:
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +94 77 123 4567"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Full Delivery Address:
              </label>
              <textarea
                required
                rows={2}
                placeholder="Street address, City, District / Province"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none shadow-sm"
              />
            </div>
          </div>

          {/* STEP 4: Payment Method */}
          <div className="space-y-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">4</span>
              Payment Option
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                paymentMethod === "COD" 
                  ? "bg-blue-50 border-blue-500 text-blue-900 shadow-sm" 
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="text-blue-600 focus:ring-0"
                />
                <Banknote className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Cash on Delivery (COD)</p>
                  <p className="text-[10px] text-slate-500">Pay when package arrives at your door</p>
                </div>
              </label>

              <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                paymentMethod === "CARD" 
                  ? "bg-blue-50 border-blue-500 text-blue-900 shadow-sm" 
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === "CARD"}
                  onChange={() => setPaymentMethod("CARD")}
                  className="text-blue-600 focus:ring-0"
                />
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Pay Online (PayHere Card)</p>
                  <p className="text-[10px] text-slate-500">Visa, MasterCard, Amex via PayHere</p>
                </div>
              </label>
            </div>
          </div>

          {/* Grand Total & Action Buttons */}
          <div className="pt-4 border-t border-slate-150 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold uppercase">Shipping:</span>
                <span className="text-xs font-extrabold text-emerald-600">
                  {isFreeShipping ? "FREE (Orders over LKR 10K)" : "LKR 350"}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xs text-slate-500 font-bold uppercase">Grand Total:</span>
                <span className="text-2xl font-black text-blue-600">
                  LKR {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing Order...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Confirm & Place Order
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
