import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import { createShipment } from "../api/shipments";

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low",    icon: "🌿", desc: "3–5 days",  cost: 480  },
  { value: "medium", label: "Medium", icon: "⚡", desc: "1–2 days",  cost: 920  },
  { value: "high",   label: "High",   icon: "🚀", desc: "Same day",  cost: 1650 },
];

const CONSTRAINT_OPTIONS = [
  { value: "avoid_tolls",       label: "Avoid tolls",        sub: "Takes longer routes"  },
  { value: "avoid_highways",    label: "Avoid highways",     sub: "Uses state roads"     },
  { value: "no_night_delivery", label: "No night delivery",  sub: "6 AM – 9 PM only"    },
  { value: "signature_required",label: "Signature required", sub: "Recipient must sign"  },
];

const PACKAGE_TYPES = ["Box", "Pallet", "Envelope", "Fragile", "Hazardous"];
const TIME_WINDOWS  = [
  { value: "morning",   label: "Morning (8 AM – 12 PM)"  },
  { value: "afternoon", label: "Afternoon (12 PM – 5 PM)" },
  { value: "evening",   label: "Evening (5 PM – 9 PM)"   },
  { value: "flexible",  label: "Flexible"                 },
];

const STEPS = ["Route", "Priority", "Review"];

const initialForm = {
  origin:       { address: "", city: "", pin: "" },
  destination:  { address: "", city: "", pin: "" },
  weight:       "",
  packageType:  "",
  instructions: "",
  priority:     "low",
  constraints:  [],
  pickupDate:   "",
  timeWindow:   "morning",
};

function Badge({ priority }) {
  const colors = {
    low:    "bg-emerald-100 text-emerald-800",
    medium: "bg-amber-100   text-amber-800",
    high:   "bg-red-100     text-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function useFormValidation() {
  const [errors, setErrors] = useState({});

  const setError = (key, msg) =>
    setErrors((prev) => ({ ...prev, [key]: msg }));
  const clearError = (key) =>
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

  const validateStep1 = (form) => {
    const newErrors = {};
    if (!form.origin.address.trim())       newErrors["origin.address"]      = "Required";
    if (!form.origin.city.trim())          newErrors["origin.city"]         = "Required";
    if (!/^\d{6}$/.test(form.origin.pin)) newErrors["origin.pin"]          = "Enter a valid 6-digit PIN";
    if (!form.destination.address.trim())  newErrors["destination.address"] = "Required";
    if (!form.destination.city.trim())     newErrors["destination.city"]    = "Required";
    if (!/^\d{6}$/.test(form.destination.pin)) newErrors["destination.pin"] = "Enter a valid 6-digit PIN";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, setError, clearError, validateStep1 };
}

export default function CreateShipment() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(0);
  const [doneSteps, setDoneSteps] = useState(new Set());
  const [form, setForm]       = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const { errors, validateStep1 } = useFormValidation();

  // ── field helpers ───────────────────────────────────────────────
  const setNested = (path, value) =>
    setForm((prev) => {
      const [a, b] = path.split(".");
      return b
        ? { ...prev, [a]: { ...prev[a], [b]: value } }
        : { ...prev, [a]: value };
    });

  const toggleConstraint = useCallback((value) => {
    setForm((prev) => ({
      ...prev,
      constraints: prev.constraints.includes(value)
        ? prev.constraints.filter((c) => c !== value)
        : [...prev.constraints, value],
    }));
  }, []);

  // ── navigation ──────────────────────────────────────────────────
  const goToStep = (n) => {
    if (n < step || doneSteps.has(n)) setStep(n);
  };

  const markDone = (n) => setDoneSteps((prev) => new Set([...prev, n]));

  const handleNext = () => {
    if (step === 0 && !validateStep1(form)) return;
    markDone(step);
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  // ── submit ──────────────────────────────────────────────────────
  const onSubmit = async () => {
    setSubmitting(true);

    try {
      const payload = {
        origin: {
          address: `${form.origin.address}, ${form.origin.city} ${form.origin.pin}`,
          lat: 19.07,
          lng: 72.87,
        },
        destination: {
          address: `${form.destination.address}, ${form.destination.city} ${form.destination.pin}`,
          lat: 28.7,
          lng: 77.1,
        },
        weight:       parseFloat(form.weight) || null,
        packageType:  form.packageType,
        instructions: form.instructions,
        priority:     form.priority,
        constraints:  form.constraints,
        pickupDate:   form.pickupDate,
        timeWindow:   form.timeWindow,
      };

      await createShipment(payload);
      toast.success("Shipment created!");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      toast.error(error.message || "Could not create shipment");
    } finally {
      setSubmitting(false);
    }
  };

  // ── derived ─────────────────────────────────────────────────────
  const selectedPriority = PRIORITY_OPTIONS.find((p) => p.value === form.priority);

  const tomorrowISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  // ── render ──────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <Toaster />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">New shipment</h1>
        <p className="text-sm text-gray-500 mb-6">Fill in route, priority, and delivery constraints</p>

        {/* ── Stepper ── */}
        <div className="flex overflow-hidden rounded-xl border border-gray-200 mb-6">
          {STEPS.map((label, i) => (
            <button
              key={i}
              onClick={() => goToStep(i)}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition
                ${i === step ? "bg-white text-gray-900"
                  : doneSteps.has(i) ? "bg-white text-emerald-600"
                  : "bg-gray-50 text-gray-400 cursor-default"}
                ${i < STEPS.length - 1 ? "border-r border-gray-200" : ""}`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border
                ${doneSteps.has(i) ? "bg-emerald-50 border-emerald-400 text-emerald-600"
                  : i === step ? "border-gray-400 text-gray-600"
                  : "border-gray-200 text-gray-300"}`}>
                {doneSteps.has(i) ? "✓" : i + 1}
              </span>
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            STEP 0 — Route
        ══════════════════════════════════════ */}
        {step === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
            {/* Origin */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Origin</p>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Street address"
                    value={form.origin.address}
                    onChange={(e) => setNested("origin.address", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <FieldError message={errors["origin.address"]} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="City"
                      value={form.origin.city}
                      onChange={(e) => setNested("origin.city", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <FieldError message={errors["origin.city"]} />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="PIN code"
                      maxLength={6}
                      value={form.origin.pin}
                      onChange={(e) => setNested("origin.pin", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <FieldError message={errors["origin.pin"]} />
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* Destination */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Destination</p>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Street address"
                    value={form.destination.address}
                    onChange={(e) => setNested("destination.address", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <FieldError message={errors["destination.address"]} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="City"
                      value={form.destination.city}
                      onChange={(e) => setNested("destination.city", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <FieldError message={errors["destination.city"]} />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="PIN code"
                      maxLength={6}
                      value={form.destination.pin}
                      onChange={(e) => setNested("destination.pin", e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <FieldError message={errors["destination.pin"]} />
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* Cargo */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Cargo</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  min="0.1"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) => setNested("weight", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <select
                  value={form.packageType}
                  onChange={(e) => setNested("packageType", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">Package type</option>
                  {PACKAGE_TYPES.map((t) => (
                    <option key={t} value={t.toLowerCase()}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <textarea
                  placeholder="Special instructions (optional)"
                  maxLength={200}
                  rows={3}
                  value={form.instructions}
                  onChange={(e) => setNested("instructions", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">
                  {form.instructions.length}/200
                </p>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="bg-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            STEP 1 — Priority & Constraints
        ══════════════════════════════════════ */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
            {/* Priority cards */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Delivery priority
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {PRIORITY_OPTIONS.map((opt) => {
                  const isSelected = form.priority === opt.value;
                  const accent = {
                    low:    isSelected ? "border-emerald-400 bg-emerald-50" : "border-gray-200",
                    medium: isSelected ? "border-amber-400  bg-amber-50"   : "border-gray-200",
                    high:   isSelected ? "border-red-400    bg-red-50"     : "border-gray-200",
                  }[opt.value];
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setNested("priority", opt.value)}
                      className={`border rounded-xl p-3 text-center transition ${accent}`}
                    >
                      <div className="text-xl mb-1">{opt.icon}</div>
                      <div className="text-sm font-semibold text-gray-800">{opt.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Estimates */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Est. delivery", value: selectedPriority.desc       },
                  { label: "Est. cost",     value: `₹ ${selectedPriority.cost.toLocaleString("en-IN")}` },
                  { label: "Distance",      value: "1,388 km"                   },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className="text-base font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* Constraints */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Route constraints
              </p>
              <div className="grid grid-cols-2 gap-3">
                {CONSTRAINT_OPTIONS.map((opt) => {
                  const checked = form.constraints.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleConstraint(opt.value)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition
                        ${checked ? "border-gray-400 bg-gray-50" : "border-gray-200 bg-white"}`}
                    >
                      <span className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 text-xs transition
                        ${checked ? "bg-gray-800 border-gray-800 text-white" : "border-gray-300"}`}>
                        {checked && "✓"}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-gray-800">{opt.label}</span>
                        <span className="block text-xs text-gray-500">{opt.sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <hr className="border-gray-100" />

            {/* Pickup schedule */}
            <section>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Pickup schedule
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  min={tomorrowISO()}
                  value={form.pickupDate}
                  onChange={(e) => setNested("pickupDate", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <select
                  value={form.timeWindow}
                  onChange={(e) => setNested("timeWindow", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {TIME_WINDOWS.map((w) => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
            </section>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="border border-gray-200 text-gray-600 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                className="bg-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition"
              >
                Review →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            STEP 2 — Review & Confirm
        ══════════════════════════════════════ */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
            {/* Route preview */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 text-sm">
              <span className="w-2 h-2 rounded-full bg-gray-800 flex-shrink-0" />
              <span className="font-medium text-gray-800 truncate">
                {form.origin.address}, {form.origin.city}
              </span>
              <span className="flex-1 border-t border-dashed border-gray-300" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="font-medium text-gray-800 truncate">
                {form.destination.address}, {form.destination.city}
              </span>
            </div>

            {/* Summary table */}
            <div className="divide-y divide-gray-100 text-sm">
              {[
                { label: "Priority",  value: <Badge priority={form.priority} />            },
                { label: "Delivery",  value: selectedPriority.desc                          },
                { label: "Est. cost", value: `₹ ${selectedPriority.cost.toLocaleString("en-IN")}` },
                { label: "Package",   value: form.packageType || "—"                        },
                { label: "Weight",    value: form.weight ? `${form.weight} kg` : "—"        },
                { label: "Pickup",    value: `${form.pickupDate || "—"} · ${form.timeWindow}` },
                {
                  label: "Constraints",
                  value: form.constraints.length
                    ? form.constraints.map((c) => c.replace(/_/g, " ")).join(", ")
                    : "None",
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2.5">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800 text-right">{value}</span>
                </div>
              ))}
            </div>

            {form.instructions && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                <span className="font-medium text-gray-700 block mb-1">Instructions</span>
                {form.instructions}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="border border-gray-200 text-gray-600 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition"
              >
                ← Edit
              </button>
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="bg-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {submitting ? "Creating…" : "Confirm shipment"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
