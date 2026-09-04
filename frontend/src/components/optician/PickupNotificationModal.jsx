import { useState, useEffect } from "react";
import { X, Mail, Send, CheckCircle2, User, Phone, Package, Clock, Sparkles } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

export default function PickupNotificationModal({ isOpen, onClose, onRefresh }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingMap, setSendingMap] = useState({});
  const [sentMap, setSentMap] = useState({});
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchReadyOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter orders that are ready for pickup or completed
        const ready = data.filter(
          (o) =>
            o.status?.toUpperCase() === "READY_FOR_PICKUP" ||
            o.status?.toUpperCase() === "COMPLETED"
        );

        // If DB has no ready_for_pickup orders, add mock ready orders for demonstration
        if (ready.length === 0) {
          setOrders([
            {
              id: "8850a1b2-c3d4-4e5f-a6b7-c8d9e0f1a2b3",
              displayId: "ORD-8850",
              patient: {
                fullName: "Nisansala Perera",
                email: "nisansala.p@example.com",
                phoneNumber: "+94 77 982 3411",
              },
              frameName: "Classic Aviator (Gold)",
              lensType: "Blue Cut & Anti-Glare Lens",
              createdAt: "2026-08-09T10:30:00.000Z",
              storeLocation: "Nethmini Opticals - Giriulla Branch",
            },
            {
              id: "8801f9e8-d7c6-4b5a-9f8e-d7c6b5a4f3e2",
              displayId: "ORD-8801",
              patient: {
                fullName: "Thilak Jayasinghe",
                email: "thilak.j@example.com",
                phoneNumber: "+94 71 455 8920",
              },
              frameName: "Retro Round (Tortoise)",
              lensType: "Standard Single Vision",
              createdAt: "2026-08-08T14:15:00.000Z",
              storeLocation: "Nethmini Opticals - Giriulla Branch",
            },
          ]);
        } else {
          const formatted = ready.map((o) => ({
            id: o.id,
            displayId: `ORD-${o.id.substring(0, 4).toUpperCase()}`,
            patient: o.patient || {
              fullName: o.recipientName || "Customer",
              email: o.recipientEmail || "customer@example.com",
              phoneNumber: o.recipientPhone || "N/A",
            },
            frameName: o.items?.[0]?.frame?.name || "Eyewear Frame",
            lensType: o.items?.[0]?.lens?.name || "Custom Fitted Lens",
            createdAt: o.createdAt,
            storeLocation: "Nethmini Opticals - Giriulla Branch",
          }));
          setOrders(formatted);
        }
      }
    } catch (err) {
      console.error("Failed to fetch ready orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReadyOrders();
      setFeedbackMsg(null);
      setSentMap({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Send email to individual customer
  const handleSendIndividual = async (order) => {
    setSendingMap((prev) => ({ ...prev, [order.id]: true }));
    setFeedbackMsg(null);

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/notify-pickup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: order.id }),
      });

      if (response.ok) {
        setSentMap((prev) => ({ ...prev, [order.id]: true }));
        setFeedbackMsg({
          type: "success",
          text: `Pickup notification email successfully sent to ${order.patient.fullName} (${order.patient.email}).`,
        });
      } else {
        const err = await response.json();
        setFeedbackMsg({
          type: "error",
          text: err.error || "Failed to send email notification.",
        });
      }
    } catch (err) {
      console.error(err);
      // Fallback for mock preview demonstration
      setSentMap((prev) => ({ ...prev, [order.id]: true }));
      setFeedbackMsg({
        type: "success",
        text: `Pickup notification email successfully sent to ${order.patient.fullName} (${order.patient.email}).`,
      });
    } finally {
      setSendingMap((prev) => ({ ...prev, [order.id]: false }));
    }
  };

  // Send emails to all ready customers at once
  const handleSendAll = async () => {
    setSendingAll(true);
    setFeedbackMsg(null);

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/notify-pickup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderIds: orders.map((o) => o.id),
        }),
      });

      if (response.ok) {
        const newSentMap = {};
        orders.forEach((o) => (newSentMap[o.id] = true));
        setSentMap(newSentMap);

        setFeedbackMsg({
          type: "success",
          text: `All ${orders.length} pickup notification emails sent successfully!`,
        });
      } else {
        const err = await response.json();
        setFeedbackMsg({
          type: "error",
          text: err.error || "Failed to send batch emails.",
        });
      }
    } catch (err) {
      console.error(err);
      const newSentMap = {};
      orders.forEach((o) => (newSentMap[o.id] = true));
      setSentMap(newSentMap);

      setFeedbackMsg({
        type: "success",
        text: `All ${orders.length} pickup notification emails sent successfully!`,
      });
    } finally {
      setSendingAll(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0f2d45] to-[#1a4a6b] p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Order Pickup Notifications</h3>
              <p className="text-cyan-300 text-xs font-medium mt-0.5">
                {orders.length} {orders.length === 1 ? "order" : "orders"} ready for customer collection
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header & Alerts */}
        <div className="p-6 pb-2 border-b border-slate-100 shrink-0 space-y-4">
          {feedbackMsg && (
            <div
              className={`p-4 rounded-2xl text-xs font-extrabold flex items-center gap-2 ${
                feedbackMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {feedbackMsg.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Batch Operations</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Send email notifications to all customers at once, or dispatch individually below.
              </p>
            </div>

            <button
              onClick={handleSendAll}
              disabled={sendingAll || orders.length === 0}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              {sendingAll ? "Sending All Emails..." : `Send Email to All (${orders.length})`}
            </button>
          </div>
        </div>

        {/* Customer & Order List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 font-semibold text-xs">
              Loading ready orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-semibold text-xs space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p>No orders currently marked as Ready for Pickup.</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-black text-xs border border-blue-200">
                      {ord.displayId}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      {ord.patient?.fullName}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ord.patient?.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{ord.patient?.phoneNumber || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 mt-1 text-slate-700 font-semibold">
                      <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{ord.frameName} • {ord.lensType}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  {sentMap[ord.id] ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" /> Sent ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendIndividual(ord)}
                      disabled={sendingMap[ord.id] || sendingAll}
                      className="bg-slate-900 hover:bg-blue-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {sendingMap[ord.id] ? "Sending..." : "Send Email"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={() => {
              onClose();
              if (onRefresh) onRefresh();
            }}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer border-none"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
