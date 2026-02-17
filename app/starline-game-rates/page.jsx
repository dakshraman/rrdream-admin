'use client';
import { Fragment, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
    useGetStarlineRatesQuery,
    useUpdateStarlineRateMutation,
} from "@/store/backendSlice/apiAPISlice";

const RATE_CONFIG = {
    "SINGLE DIGIT": { col1: "Single Digit Value 1", col2: "Single Digit Value 2" },
    "SINGLE PANA": { col1: "Single Pana Value 1", col2: "Single Pana Value 2" },
    "DOUBLE PANA": { col1: "Double Pana Value 1", col2: "Double Pana Value 2" },
    "TRIPLE PANA": { col1: "Triple Pana Value 1", col2: "Triple Pana Value 2" },
};

export default function StarlineGameRates() {
    const [formValues, setFormValues] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const { data: ratesData, isLoading, isError, error } = useGetStarlineRatesQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const [updateStarlineRate] = useUpdateStarlineRateMutation();

    const rates = ratesData?.data || (Array.isArray(ratesData) ? ratesData : []);

    useEffect(() => {
        if(Array.isArray(rates) && rates.length > 0) {
            const initial = {};
            rates.forEach((r) => {
                initial[r.id] = {
                    base: String(r.base ?? ""),
                    rate: String(r.rate ?? ""),
                };
            });
            setFormValues(initial);
        }
    }, [ratesData]);

    const handleChange = (id, field, val) => {
        setFormValues((prev) => ({
            ...prev,
            [id]: { ...prev[id], [field]: val },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        for(const r of rates) {
            const v = formValues[r.id];
            if(!v?.base || !v?.rate) {
                toast.error(`Please fill all fields for ${r.name}`);
                return;
            }
            if(isNaN(Number(v.base)) || isNaN(Number(v.rate))) {
                toast.error(`Only numbers allowed for ${r.name}`);
                return;
            }
        }
        setSubmitting(true);
        try {
            await Promise.all(
                rates.map((r) =>
                    updateStarlineRate({
                        id: r.id,
                        base: formValues[r.id].base,
                        rate: formValues[r.id].rate,
                    }).unwrap()
                )
            );
            toast.success("All rates updated successfully!");
        } catch(err) {
            toast.error(err?.data?.message || err?.message || "Update failed");
        } finally {
            setSubmitting(false);
        }
    };

    if(isError) {
        return (
            <main style={{ padding: "20px" }}>
                <div style={{
                    color: "#dc2626", padding: "40px", textAlign: "center",
                    background: "#fef2f2", borderRadius: "12px", border: "1px solid #fecaca",
                }}>
                    <h3 style={{ marginBottom: "10px" }}>Error loading rates</h3>
                    <p>{error?.data?.message || error?.message || "Something went wrong"}</p>
                    <button onClick={() => window.location.reload()} style={{
                        marginTop: "15px", padding: "10px 20px", background: "#dc2626",
                        color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer",
                    }}>Retry</button>
                </div>
            </main>
        );
    }

    return (
        <>
            <style jsx global>{`
                @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
                .rate-input { transition: border-color 0.2s, box-shadow 0.2s; }
                .rate-input::-webkit-outer-spin-button,
                .rate-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                .rate-input[type=number] { -moz-appearance: textfield; }
                .submit-btn:hover:not(:disabled) {
                    background: #dc2626 !important;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(239,68,68,0.4) !important;
                }
                .submit-btn { transition: all 0.2s ease !important; }
                @media (max-width: 640px) {
                    .rates-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <main style={{ padding: "9px", minHeight: "100vh", overflow: "auto" }}>
                <div style={{
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    padding: "24px 20px 28px",
                }}>
                    {/* Title */}
                    <h2 style={{
                        textAlign: "center",
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#ef4444",
                        margin: "0 0 28px",
                    }}>
                        Add Games Rate
                    </h2>

                    {isLoading ? (
                        <SkeletonForm />
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {/*
                              KEY FIX: use React.Fragment with key prop so we can
                              render two sibling inputs per row without extra wrapper divs.
                              The grid sees 8 direct children (2 per rate × 4 rates)
                              and pairs them into rows automatically.
                            */}
                            <div className="rates-grid" style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "20px 24px",
                            }}>
                                {rates.map((r) => {
                                    const cfg = RATE_CONFIG[r.name] || {
                                        col1: `${r.name} Value 1`,
                                        col2: `${r.name} Value 2`,
                                    };
                                    const vals = formValues[r.id] || { base: "", rate: "" };
                                    return (
                                        <Fragment key={r.id}>
                                            <FloatingInput
                                                label={cfg.col1}
                                                value={vals.base}
                                                onChange={(v) => handleChange(r.id, "base", v)}
                                            />
                                            <FloatingInput
                                                label={cfg.col2}
                                                value={vals.rate}
                                                onChange={(v) => handleChange(r.id, "rate", v)}
                                            />
                                        </Fragment>
                                    );
                                })}
                            </div>

                            {/* Submit — red theme */}
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={submitting || isLoading}
                                style={{
                                    marginTop: "28px",
                                    width: "100%",
                                    padding: "14px",
                                    background: "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "15px",
                                    fontWeight: 600,
                                    cursor: submitting ? "not-allowed" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
                                    opacity: submitting ? 0.8 : 1,
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <span style={{
                                            width: 16, height: 16,
                                            border: "2px solid #fff", borderTopColor: "transparent",
                                            borderRadius: "50%", display: "inline-block",
                                            animation: "spin 0.8s linear infinite",
                                        }} />
                                        Saving...
                                    </>
                                ) : "Submit"}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </>
    );
}

// ─── Floating label input — red accent ───────────────────────────────────────
function FloatingInput({ label, value, onChange }) {
    const [focused, setFocused] = useState(false);
    const floated = focused || (value !== "" && value !== undefined);

    return (
        <div style={{ position: "relative" }}>
            <label style={{
                position: "absolute",
                left: "12px",
                top: floated ? "-9px" : "50%",
                transform: floated ? "none" : "translateY(-50%)",
                fontSize: floated ? "11px" : "13px",
                color: focused ? "#ef4444" : "#9ca3af",
                background: "#fff",
                padding: "0 4px",
                pointerEvents: "none",
                transition: "all 0.18s ease",
                zIndex: 1,
                fontWeight: floated ? 600 : 400,
                whiteSpace: "nowrap",
            }}>
                {label}
            </label>
            <input
                className="rate-input"
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    width: "100%",
                    padding: "14px 12px 12px",
                    border: `1px solid ${focused ? "#ef4444" : "#d1d5db"}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "#1f2937",
                    background: "#fff",
                    boxSizing: "border-box",
                    outline: "none",
                    boxShadow: focused ? "0 0 0 3px rgba(239,68,68,0.12)" : "none",
                }}
            />
        </div>
    );
}

// ─── Skeleton while loading ───────────────────────────────────────────────────
function SkeletonForm() {
    return (
        <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px" }}>
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} height={52} borderRadius={6} />
                ))}
            </div>
            <Skeleton height={50} borderRadius={8} style={{ marginTop: "28px" }} />
        </div>
    );
}