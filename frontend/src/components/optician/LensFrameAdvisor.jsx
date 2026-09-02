import { useState } from "react";

const FACE_SHAPES = ["Oval", "Round", "Square", "Heart", "Diamond", "Oblong"];
const PRESCRIPTION_TYPES = ["Single Vision (Myopia)", "Single Vision (Hyperopia)", "Progressive", "Bifocal", "No Prescription (Plano)"];
const LIFESTYLES = ["Office / Screen Work", "Outdoor / Sports", "Mixed / All-Day Use", "Reading Only", "Driving"];

const FRAME_RECOMMENDATIONS = {
  Oval: ["Square", "Rectangle", "Aviator", "Geometric"],
  Round: ["Square", "Rectangle", "Wayfarer", "Browline"],
  Square: ["Round", "Oval", "Aviator", "Cat Eye"],
  Heart: ["Round", "Aviator", "Light Rimless", "Oval"],
  Diamond: ["Cat Eye", "Oval", "Rimless", "Browline"],
  Oblong: ["Aviator", "Round", "Wayfarer", "Wraparound"],
};

const LENS_RECOMMENDATIONS = {
  "Single Vision (Myopia)": {
    "Office / Screen Work": { type: "Single Vision", material: "Polycarbonate", coating: "Blue Light Filter + AR Coat", notes: "Reduces digital eye strain for extended screen use." },
    "Outdoor / Sports": { type: "Single Vision", material: "Trivex", coating: "UV 400 + Polarised", notes: "Impact-resistant and lightweight for active use." },
    "Mixed / All-Day Use": { type: "Single Vision", material: "Hi-Index 1.60", coating: "AR + UV + Scratch Resistant", notes: "Thin, light, and suitable for all environments." },
    "Reading Only": { type: "Single Vision", material: "CR-39", coating: "Anti-Reflective", notes: "Cost-effective for near-vision correction." },
    "Driving": { type: "Single Vision", material: "Polycarbonate", coating: "Polarised + UV 400", notes: "Reduces road glare and UV exposure." },
  },
  "Progressive": {
    "Office / Screen Work": { type: "Progressive (Office)", material: "Hi-Index 1.67", coating: "Blue Cut + AR + Premium Coat", notes: "Wide intermediate zone optimized for screen + desk use." },
    "Mixed / All-Day Use": { type: "Progressive (Premium)", material: "Hi-Index 1.67", coating: "AR + UV + Hard Coat", notes: "Wide corridor design for comfortable all-day wear." },
    "Outdoor / Sports": { type: "Progressive (Polarised)", material: "Trivex", coating: "Polarised + UV400", notes: "Outdoor-optimized with minimal peripheral distortion." },
    "Driving": { type: "Progressive", material: "Hi-Index 1.67", coating: "Polarised + Hard Coat", notes: "Enhanced distance vision with comfortable near zone." },
    "Reading Only": { type: "Progressive", material: "CR-39", coating: "Anti-Reflective", notes: "Standard progressive for reading and mid-range tasks." },
  },
};

const MOCK_FRAMES_CATALOG = [
  { id: "F001", name: "Urban Tech Square", type: "Square", brand: "Ray-Ban", material: "Acetate", weight: "Light", price: "$120", suitableFor: ["Oval", "Round", "Heart"] },
  { id: "F002", name: "Classic Aviator", type: "Aviator", brand: "Oakley", material: "Metal", weight: "Medium", price: "$145", suitableFor: ["Oval", "Heart", "Diamond", "Oblong"] },
  { id: "F003", name: "Retro Round", type: "Round", brand: "Persol", material: "Acetate", weight: "Light", price: "$110", suitableFor: ["Square", "Oblong", "Diamond"] },
  { id: "F004", name: "Slim Rectangle", type: "Rectangle", brand: "Lindberg", material: "Titanium", weight: "Ultra Light", price: "$220", suitableFor: ["Oval", "Round"] },
  { id: "F005", name: "Cat Eye Classic", type: "Cat Eye", brand: "Gucci", material: "Acetate", weight: "Medium", price: "$195", suitableFor: ["Square", "Diamond", "Oblong"] },
  { id: "F006", name: "Geometric Hex", type: "Geometric", brand: "Tom Ford", material: "Metal+Acetate", weight: "Medium", price: "$130", suitableFor: ["Oval", "Round"] },
];

export default function LensFrameAdvisor() {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ faceShape: "", prescription: "", lifestyle: "", budget: "", notes: "" });
  const [recommendations, setRecommendations] = useState(null);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [notification, setNotification] = useState(null);

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const generateRecommendations = () => {
    const frameTypes = FRAME_RECOMMENDATIONS[profile.faceShape] || [];
    const lensData = (LENS_RECOMMENDATIONS[profile.prescription] || {})[profile.lifestyle] || {
      type: "Single Vision Standard", material: "CR-39", coating: "Anti-Reflective",
      notes: "General purpose lens recommendation based on your inputs.",
    };
    const matchedFrames = MOCK_FRAMES_CATALOG.filter(f =>
      f.suitableFor.includes(profile.faceShape) || frameTypes.includes(f.type)
    );
    setRecommendations({ frameTypes, lensData, matchedFrames });
    setStep(4);
  };

  const saveProfile = () => {
    setSavedProfiles(prev => [...prev, { ...profile, id: Date.now(), date: new Date().toLocaleDateString() }]);
    notify("Customer profile saved");
  };

  const reset = () => { setStep(1); setProfile({ faceShape: "", prescription: "", lifestyle: "", budget: "", notes: "" }); setRecommendations(null); };

  const stepTitles = ["", "Face Shape", "Prescription", "Lifestyle", "Recommendations"];

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      {notification && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 bg-emerald-500 text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {notification}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lens & Frame Advisor</h1>
        <p className="text-slate-500 text-sm font-medium mt-0.5">Help customers find the perfect frame and lens based on their profile</p>
      </div>

      {/* Progress stepper */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 transition-all
              ${step >= s ? "bg-[#1b5e85] text-white" : "bg-slate-100 text-slate-400"}`}>
              {step > s ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              ) : s}
            </div>
            <span className={`text-xs font-bold hidden sm:block ${step >= s ? "text-[#1b5e85]" : "text-slate-400"}`}>{stepTitles[s]}</span>
            {s < 4 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s ? "bg-[#1b5e85]" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 min-h-[400px]">
        {/* Step 1: Face Shape */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">What is the customer's face shape?</h2>
            <p className="text-slate-500 text-sm mb-6">Face shape determines the best frame styles</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FACE_SHAPES.map(shape => (
                <button key={shape} onClick={() => setProfile(p => ({ ...p, faceShape: shape }))}
                  className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all
                    ${profile.faceShape === shape ? "border-[#1b5e85] bg-blue-50 text-[#1b5e85]" : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}>
                  <div className="text-2xl mb-2">
                    {shape === "Oval" ? "🥚" : shape === "Round" ? "⭕" : shape === "Square" ? "⬛" : shape === "Heart" ? "❤️" : shape === "Diamond" ? "💎" : "📏"}
                  </div>
                  {shape}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-8">
              <button onClick={() => profile.faceShape && setStep(2)} disabled={!profile.faceShape}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                  ${profile.faceShape ? "bg-[#1b5e85] text-white hover:bg-[#154d70]" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Prescription */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">What is the prescription type?</h2>
            <p className="text-slate-500 text-sm mb-6">This guides lens material and type selection</p>
            <div className="space-y-2.5">
              {PRESCRIPTION_TYPES.map(pt => (
                <button key={pt} onClick={() => setProfile(p => ({ ...p, prescription: pt }))}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl border-2 text-sm font-bold transition-all
                    ${profile.prescription === pt ? "border-[#1b5e85] bg-blue-50 text-[#1b5e85]" : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}>
                  {pt}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">← Back</button>
              <button onClick={() => profile.prescription && setStep(3)} disabled={!profile.prescription}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                  ${profile.prescription ? "bg-[#1b5e85] text-white hover:bg-[#154d70]" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Lifestyle */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">What is the customer's primary lifestyle?</h2>
            <p className="text-slate-500 text-sm mb-6">Lifestyle determines the ideal lens coating and material</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LIFESTYLES.map(ls => (
                <button key={ls} onClick={() => setProfile(p => ({ ...p, lifestyle: ls }))}
                  className={`text-left px-5 py-4 rounded-2xl border-2 text-sm font-bold transition-all
                    ${profile.lifestyle === ls ? "border-[#1b5e85] bg-blue-50 text-[#1b5e85]" : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}>
                  {ls}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mt-5 mb-1.5">Additional Notes (optional)</label>
              <textarea rows={2} value={profile.notes} onChange={e => setProfile(p => ({ ...p, notes: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400"
                placeholder="e.g., customer prefers lightweight frames, sensitive to nose pads..." />
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">← Back</button>
              <button onClick={generateRecommendations} disabled={!profile.lifestyle}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                  ${profile.lifestyle ? "bg-[#1b5e85] text-white hover:bg-[#154d70]" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                Generate Recommendations ✨
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && recommendations && (
          <div>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="text-lg font-extrabold text-slate-900">Personalized Recommendations</h2>
              <div className="flex gap-2">
                <button onClick={saveProfile} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors">Save Profile</button>
                <button onClick={reset} className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors">Start New</button>
              </div>
            </div>

            {/* Summary pill */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3.5 flex flex-wrap gap-3 mb-6 text-sm">
              <span className="font-semibold text-blue-700">Face: <strong>{profile.faceShape}</strong></span>
              <span className="text-blue-300">·</span>
              <span className="font-semibold text-blue-700">Rx: <strong>{profile.prescription}</strong></span>
              <span className="text-blue-300">·</span>
              <span className="font-semibold text-blue-700">Lifestyle: <strong>{profile.lifestyle}</strong></span>
            </div>

            {/* Lens recommendation */}
            <div className="bg-gradient-to-br from-[#0f2d45] to-[#1a4a6b] rounded-2xl p-5 text-white mb-5">
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">Recommended Lens</p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[
                  { label: "Type", value: recommendations.lensData.type },
                  { label: "Material", value: recommendations.lensData.material },
                  { label: "Coating", value: recommendations.lensData.coating },
                ].map((f, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-3">
                    <p className="text-white/50 text-[10px] font-bold uppercase">{f.label}</p>
                    <p className="text-white font-bold text-sm mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/70 text-sm italic">{recommendations.lensData.notes}</p>
            </div>

            {/* Recommended frame types */}
            <div className="mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Best Frame Styles for {profile.faceShape} Face</p>
              <div className="flex flex-wrap gap-2">
                {recommendations.frameTypes.map((ft, i) => (
                  <span key={i} className="px-4 py-2 bg-[#1b5e85]/10 border border-[#1b5e85]/20 text-[#1b5e85] text-sm font-bold rounded-xl">{ft}</span>
                ))}
              </div>
            </div>

            {/* Matching frames from catalog */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Matching Frames from Inventory</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendations.matchedFrames.slice(0, 4).map(f => (
                  <div key={f.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{f.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{f.brand} · {f.type}</p>
                        <p className="text-slate-400 text-xs">{f.material} · {f.weight}</p>
                      </div>
                      <span className="font-extrabold text-[#1b5e85] text-lg">{f.price}</span>
                    </div>
                  </div>
                ))}
                {recommendations.matchedFrames.length === 0 && (
                  <p className="text-slate-400 text-sm col-span-2">No direct matches. Consider {recommendations.frameTypes[0]} or {recommendations.frameTypes[1]} frame styles.</p>
                )}
              </div>
            </div>

            {profile.notes && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Customer Notes</p>
                <p className="text-amber-800 text-sm font-medium">{profile.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Saved profiles */}
      {savedProfiles.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-bold text-slate-600 mb-3">Saved Customer Profiles ({savedProfiles.length})</p>
          <div className="space-y-2">
            {savedProfiles.map(p => (
              <div key={p.id} className="bg-white border border-slate-100 rounded-2xl px-5 py-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">{p.faceShape} · {p.prescription} · {p.lifestyle}</span>
                <span className="text-slate-400 text-xs">{p.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
