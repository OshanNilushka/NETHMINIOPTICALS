import { useState, useEffect } from "react";

const API = "http://localhost:3000";

const STATUS_COLORS = {
  PENDING:          "bg-amber-50 text-amber-700 border-amber-200",
  PROCESSING:       "bg-blue-50 text-blue-700 border-blue-200",
  READY_FOR_PICKUP: "bg-violet-50 text-violet-700 border-violet-200",
  COMPLETED:        "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED:        "bg-red-50 text-red-600 border-red-200",
};

function downloadCSV(data) {
  const { recentOrders, topProducts, monthly, totalRevenue } = data;

  let csv = "INSIGHT OPTICALS - REVENUE REPORT\n";
  csv += `Generated: ${new Date().toLocaleString()}\n\n`;
  csv += `Total Revenue,Rs. ${Number(totalRevenue).toLocaleString()}\n\n`;

  csv += "MONTHLY BREAKDOWN\n";
  csv += "Month,Revenue (Rs.)\n";
  monthly.forEach(m => { csv += `${m.month},${m.revenue.toFixed(2)}\n`; });

  csv += "\nTOP PRODUCTS BY REVENUE\n";
  csv += "Product,Brand,Units Sold,Revenue (Rs.)\n";
  topProducts.forEach(p => {
    csv += `"${p.name}","${p.brand}",${p.count},${p.revenue.toFixed(2)}\n`;
  });

  csv += "\nRECENT ORDERS\n";
  csv += "Order ID,Patient,Amount (Rs.),Status,Date\n";
  recentOrders.forEach(o => {
    csv += `"${o.id.slice(0, 8)}...","${o.patientName}",${o.totalAmount.toFixed(2)},${o.status},"${new Date(o.createdAt).toLocaleDateString()}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `revenue-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RevenueReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/api/admin/revenue`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed to load revenue data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-slate-400 font-semibold">
      Loading revenue data...
    </div>
  );

  if (error) return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm font-semibold">{error}</div>
    </div>
  );

  const maxMonthly = Math.max(...(data.monthly.map(m => m.revenue) || [1]), 1);
  const maxProduct = Math.max(...(data.topProducts.map(p => p.revenue) || [1]), 1);

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Revenue Reports</h2>
          <p className="text-slate-500 text-sm mt-0.5">Income breakdown — where the money comes from</p>
        </div>
        <button
          onClick={() => downloadCSV(data)}
          className="flex items-center gap-2 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #059669, #34d399)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download CSV Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5">
          <p className="text-3xl font-black text-amber-600">Rs. {Number(data.totalRevenue).toLocaleString()}</p>
          <p className="font-bold text-slate-700 text-sm mt-1">Total Revenue</p>
          <p className="text-slate-400 text-xs">From all completed orders</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5">
          <p className="text-3xl font-black text-emerald-600">{data.totalOrders}</p>
          <p className="font-bold text-slate-700 text-sm mt-1">Paid Orders</p>
          <p className="text-slate-400 text-xs">Non-cancelled orders</p>
        </div>
        <div className="bg-violet-50 border border-violet-100 rounded-3xl p-5">
          <p className="text-3xl font-black text-violet-600">
            Rs. {data.totalOrders > 0 ? (data.totalRevenue / data.totalOrders).toFixed(0) : "0"}
          </p>
          <p className="font-bold text-slate-700 text-sm mt-1">Avg. Order Value</p>
          <p className="text-slate-400 text-xs">Revenue per order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <p className="font-extrabold text-slate-800 text-sm mb-4">📅 Monthly Revenue</p>
          {data.monthly.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No monthly data yet</p>
          ) : (
            <div className="space-y-3">
              {data.monthly.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <p className="text-xs font-bold text-slate-500 w-16 shrink-0">{m.month}</p>
                  <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                      style={{
                        width: `${Math.max((m.revenue / maxMonthly) * 100, 4)}%`,
                        background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                      }}
                    >
                      <span className="text-[10px] font-bold text-white whitespace-nowrap">
                        Rs. {m.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <p className="font-extrabold text-slate-800 text-sm mb-4">🏆 Top Products by Revenue</p>
          {data.topProducts.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No product revenue data yet</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                    style={{ background: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : "#7c3aed" }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                      <p className="text-xs font-bold text-violet-600 ml-2 shrink-0">Rs. {p.revenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-100 rounded-full h-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(p.revenue / maxProduct) * 100}%`,
                          background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.brand} · {p.count} unit(s) sold</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="font-extrabold text-slate-800 text-sm">🧾 Recent Orders</p>
          <p className="text-slate-400 text-xs font-medium">Last {data.recentOrders.length} orders</p>
        </div>
        {data.recentOrders.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm font-semibold">No orders found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Order</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Status & Action</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.recentOrders.map((o) => {
                const isPaid = o.paymentStatus === "PAID";
                const isCard = o.paymentMethod === "CARD";
                const isFailed = o.paymentStatus === "FAILED";

                let badgeCls = "bg-amber-50 text-amber-700 border-amber-200";
                let actionText = "";
                let methodLabel = "";

                if (isCard) {
                  methodLabel = "💳 CARD";
                  if (isPaid) {
                    badgeCls = "bg-green-50 text-green-700 border-green-200";
                    actionText = "✓ Verified (PayHere)";
                  } else if (isFailed) {
                    badgeCls = "bg-red-50 text-red-700 border-red-200";
                    actionText = "✗ Payment Failed";
                  } else {
                    actionText = "⌛ Pending Gateway";
                  }
                } else {
                  methodLabel = "💵 COD";
                  if (isPaid) {
                    badgeCls = "bg-green-50 text-green-700 border-green-200";
                    actionText = "✓ Cash Collected";
                  } else {
                    actionText = "👋 Collect Cash on Delivery";
                  }
                }

                return (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <p className="text-slate-800 font-bold text-xs font-mono">{o.id.slice(0, 8).toUpperCase()}...</p>
                      <p className="text-slate-400 text-[10px]">{o.itemCount} item(s)</p>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="text-slate-700 font-semibold text-sm">{o.patientName}</p>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="text-emerald-700 font-extrabold text-sm">Rs. {Number(o.totalAmount).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[o.status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border self-start ${badgeCls}`}>
                          {methodLabel} : {o.paymentStatus}
                        </span>
                        <span className="text-[10px] text-slate-450 font-medium italic">
                          {actionText}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 hidden sm:table-cell text-slate-500 text-xs">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
