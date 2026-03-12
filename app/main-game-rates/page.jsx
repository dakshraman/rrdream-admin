import { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
    useGetMainGameRatesQuery,
    useUpdateMainGameRatesMutation
} from "@/store/backendSlice/apiAPISlice";
import Swal from "sweetalert2";

export default function MainGameRates() {
    const { data: ratesData, isLoading, isError, error, refetch } = useGetMainGameRatesQuery(undefined);

    const [updateMainGameRates, { isLoading: isUpdating }] = useUpdateMainGameRatesMutation();

    const [formData, setFormData] = useState({
        singleDigitValue1: "", singleDigitValue2: "",
        jodiDigitValue1: "", jodiDigitValue2: "",
        singlePanaValue1: "", singlePanaValue2: "",
        doublePanaValue1: "", doublePanaValue2: "",
        triplePanaValue1: "", triplePanaValue2: "",
        halfSangamValue1: "", halfSangamValue2: "",
        fullSangamValue1: "", fullSangamValue2: "",
    });

    useEffect(() => {
        if (ratesData?.data && Array.isArray(ratesData.data)) {
            const rates = ratesData.data;
            const findRate = (name) => rates.find(rate => rate.name === name) || { base: "", rate: "" };

            setFormData({
                singleDigitValue1: findRate("SINGLE DIGIT").base.toString(),
                singleDigitValue2: findRate("SINGLE DIGIT").rate.toString(),
                jodiDigitValue1: findRate("DOUBLE DIGIT").base.toString(),
                jodiDigitValue2: findRate("DOUBLE DIGIT").rate.toString(),
                singlePanaValue1: findRate("SINGLE PANA").base.toString(),
                singlePanaValue2: findRate("SINGLE PANA").rate.toString(),
                doublePanaValue1: findRate("DOUBLE PANA").base.toString(),
                doublePanaValue2: findRate("DOUBLE PANA").rate.toString(),
                triplePanaValue1: findRate("TRIPLE PANA").base.toString(),
                triplePanaValue2: findRate("TRIPLE PANA").rate.toString(),
                halfSangamValue1: findRate("HALF SANGAM").base.toString(),
                halfSangamValue2: findRate("HALF SANGAM").rate.toString(),
                fullSangamValue1: findRate("FULL SANGAM").base.toString(),
                fullSangamValue2: findRate("FULL SANGAM").rate.toString(),
            });
        }
    }, [ratesData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const ratesToUpdate = [
                { id: 1, base: parseInt(formData.singleDigitValue1), rate: parseInt(formData.singleDigitValue2) },
                { id: 2, base: parseInt(formData.jodiDigitValue1), rate: parseInt(formData.jodiDigitValue2) },
                { id: 3, base: parseInt(formData.singlePanaValue1), rate: parseInt(formData.singlePanaValue2) },
                { id: 4, base: parseInt(formData.doublePanaValue1), rate: parseInt(formData.doublePanaValue2) },
                { id: 5, base: parseInt(formData.triplePanaValue1), rate: parseInt(formData.triplePanaValue2) },
                { id: 6, base: parseInt(formData.halfSangamValue1), rate: parseInt(formData.halfSangamValue2) },
                { id: 7, base: parseInt(formData.fullSangamValue1), rate: parseInt(formData.fullSangamValue2) },
            ];

            let hasError = false;
            for (const rate of ratesToUpdate) {
                if (isNaN(rate.base) || isNaN(rate.rate)) continue;
                try {
                    await updateMainGameRates(rate).unwrap();
                } catch (err) {
                    hasError = true;
                    console.error("Failed to update rate", rate, err);
                }
            }

            if (!hasError) {
                Swal.fire('Success', 'Rates updated successfully!', 'success');
                refetch();
            } else {
                Swal.fire('Warning', 'Some rates failed to update.', 'warning');
                refetch();
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update rates. Please try again.', 'error');
        }
    };

    if (isLoading) {
        return (
            <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <Skeleton height={50} count={8} style={{ marginBottom: 15 }} />
                </div>
            </main>
        );
    }

    if (isError) {
        return (
            <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 text-center">
                    <h3 className="text-lg font-semibold mb-2">Error loading rates</h3>
                    <p>{error?.data?.message || error?.message || "Something went wrong"}</p>
                    <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        Retry
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main style={{ padding: "16px", maxWidth: "1024px", margin: "0 auto", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
            <div style={{ marginBottom: "24px", marginTop: "69px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: "16px", backgroundColor: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #f3f4f6", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0", letterSpacing: "-0.025em" }}>Main Game Rates</h1>
                    <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Configure win multipliers and base values for standard games.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isUpdating}
                    style={{ width: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px 32px", backgroundColor: "#dc2626", color: "#fff", fontWeight: "600", borderRadius: "12px", border: "none", cursor: isUpdating ? "not-allowed" : "pointer", opacity: isUpdating ? 0.5 : 1, transition: "all 0.2s", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
                    onMouseOver={(e) => !isUpdating && (e.currentTarget.style.backgroundColor = "#b91c1c")}
                    onMouseOut={(e) => !isUpdating && (e.currentTarget.style.backgroundColor = "#dc2626")}
                >
                    {isUpdating ? (
                        <span style={{ width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span>
                    ) : (
                        <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    )}
                    Update Rates
                </button>
            </div>

            <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", border: "1px solid #f3f4f6", overflow: "hidden" }}>
                <form onSubmit={handleSubmit} style={{ padding: "32px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", columnGap: "32px", rowGap: "24px" }}>

                        {/* Single Digit */}
                        <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Single Digit</h3>
                            <div style={{ display: "flex", gap: "16px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Base Value</label>
                                    <input type="number" name="singleDigitValue1" value={formData.singleDigitValue1} onChange={handleInputChange} style={{ width: "100%", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Winning Rate</label>
                                    <input type="number" name="singleDigitValue2" value={formData.singleDigitValue2} onChange={handleInputChange} style={{ width: "100%", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                                </div>
                            </div>
                        </div>

                        {/* Jodi Digit */}
                        <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Jodi Digit</h3>
                            <div style={{ display: "flex", gap: "16px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Base Value</label>
                                    <input type="number" name="jodiDigitValue1" value={formData.jodiDigitValue1} onChange={handleInputChange} style={{ width: "100%", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Winning Rate</label>
                                    <input type="number" name="jodiDigitValue2" value={formData.jodiDigitValue2} onChange={handleInputChange} style={{ width: "100%", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                                </div>
                            </div>
                        </div>

                        {/* Single Pana */}
                        <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Single Pana</h3>
                            <div style={{ display: "flex", gap: "16px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Base Value</label>
                                    <input type="number" name="singlePanaValue1" value={formData.singlePanaValue1} onChange={handleInputChange} style={{ width: "100%", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Winning Rate</label>
                                    <input type="number" name="singlePanaValue2" value={formData.singlePanaValue2} onChange={handleInputChange} style={{ width: "100%", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                                </div>
                            </div>
                        </div>

                        {/* Double Pana */}
                        <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Double Pana</h3>
                            <div style={{ display: "flex", gap: "16px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Base Value</label>
                                    <input type="number" name="doublePanaValue1" value={formData.doublePanaValue1} onChange={handleInputChange} style={{ width: "100%", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Winning Rate</label>
                                    <input type="number" name="doublePanaValue2" value={formData.doublePanaValue2} onChange={handleInputChange} style={{ width: "100%", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                                </div>
                            </div>
                        </div>

                        {/* Triple Pana */}
                        <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Triple Pana</h3>
                            <div style={{ display: "flex", gap: "16px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Base Value</label>
                                    <input type="number" name="triplePanaValue1" value={formData.triplePanaValue1} onChange={handleInputChange} style={{ width: "100%", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Winning Rate</label>
                                    <input type="number" name="triplePanaValue2" value={formData.triplePanaValue2} onChange={handleInputChange} style={{ width: "100%", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                                </div>
                            </div>
                        </div>

                        {/* Half Sangam */}
                        <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Half Sangam</h3>
                            <div style={{ display: "flex", gap: "16px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Base Value</label>
                                    <input type="number" name="halfSangamValue1" value={formData.halfSangamValue1} onChange={handleInputChange} style={{ width: "100%", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Winning Rate</label>
                                    <input type="number" name="halfSangamValue2" value={formData.halfSangamValue2} onChange={handleInputChange} style={{ width: "100%", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                                </div>
                            </div>
                        </div>

                        {/* Full Sangam */}
                        <div style={{ gridColumn: "1 / -1", backgroundColor: "#f9fafb", padding: "16px", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Sangam</h3>
                            <div style={{ display: "flex", gap: "16px", maxWidth: "448px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Base Value</label>
                                    <input type="number" name="fullSangamValue1" value={formData.fullSangamValue1} onChange={handleInputChange} style={{ width: "100%", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Winning Rate</label>
                                    <input type="number" name="fullSangamValue2" value={formData.fullSangamValue2} onChange={handleInputChange} style={{ width: "100%", backgroundColor: "#fff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }} onFocus={(e) => { e.target.style.borderColor = "#dc2626"; e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)"; }} onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}

