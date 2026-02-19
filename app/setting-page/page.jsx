'use client';
import { useState, useEffect } from "react";
import { useGetConfigQuery, useUpdateConfigMutation } from "@/store/backendSlice/apiAPISlice";

export default function Settings() {
    const { data: configResponse, isLoading, refetch } = useGetConfigQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const [updateConfig, { isLoading: updating }] = useUpdateConfigMutation();

    const [formData, setFormData] = useState({});
    const [activeSection, setActiveSection] = useState('contact');
    const [editingField, setEditingField] = useState(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    const config = configResponse?.config || {};
    const activeUsersCount = configResponse?.active_users_count || 0;
    const inactiveUsersCount = configResponse?.inactive_users_count || 0;
    const normalizeUserStatus = (value) =>
        value === true || value === 1 || value === "1" || value === "true";
    const isNewUserActive = normalizeUserStatus(formData.user_status);

    useEffect(() => {
        if (config && Object.keys(config).length > 0) {
            setFormData({
                ...config,
                user_status: normalizeUserStatus(config.user_status),
            });
        }
    }, [configResponse]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const theme = {
        primary: "#6366f1",
        primaryLight: "#eef2ff",
        primaryDark: "#4f46e5",
        text: "#1f2937",
        textMuted: "#6b7280",
        border: "#e5e7eb",
        success: "#22c55e",
        successLight: "#dcfce7",
        warning: "#f59e0b",
        warningLight: "#fef3c7",
        danger: "#ef4444",
        dangerLight: "#fee2e2",
        background: "#f8fafc",
        card: "#ffffff",
    };

    const sections = {
        contact: {
            title: "Contact Information",
            shortTitle: "Contact",
            icon: "📞",
            fields: ['email', 'phone', 'whatsapp']
        },
        payment: {
            title: "Payment Details",
            shortTitle: "Payment",
            icon: "💳",
            fields: ['upi', 'google_pay', 'phone_pay', 'paytm']
        },
        bank: {
            title: "Bank Account",
            shortTitle: "Bank",
            icon: "🏦",
            fields: ['account_number', 'ifsc', 'bank_name', 'account_holder_name']
        },
        limits: {
            title: "Limits & Rates",
            shortTitle: "Limits",
            icon: "⚙️",
            fields: ['min_bid', 'min_withdrawal', 'min_deposit', 'point_rates', 'referal_bonus', 'default_balance']
        },
        timing: {
            title: "Withdrawal Timing",
            shortTitle: "Timing",
            icon: "🕐",
            fields: ['withdrawal_open_timing', 'withdrawal_close_timing']
        },
        content: {
            title: "App Content",
            shortTitle: "Content",
            icon: "📝",
            fields: ['share_message', 'how_to_play', 'app_link']
        }
    };

    const fieldLabels = {
        email: "Admin Email",
        phone: "Phone Number",
        whatsapp: "WhatsApp Number",
        upi: "UPI ID",
        google_pay: "Google Pay",
        phone_pay: "PhonePe",
        paytm: "Paytm",
        account_number: "Account Number",
        ifsc: "IFSC Code",
        bank_name: "Bank Name",
        account_holder_name: "Account Holder",
        min_bid: "Minimum Bid",
        min_withdrawal: "Min Withdrawal",
        min_deposit: "Min Deposit",
        point_rates: "Point Rate",
        referal_bonus: "Referral Bonus",
        default_balance: "Default Balance",
        withdrawal_open_timing: "Opens At",
        withdrawal_close_timing: "Closes At",
        share_message: "Share Message",
        how_to_play: "How to Play",
        app_link: "App Link",
        user_status: "New User Status"
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveField = async (field) => {
        try {
            await updateConfig({ email: config.email, [field]: formData[field] }).unwrap();
            setEditingField(null);
            alert(`${fieldLabels[field]} updated successfully!`);
        } catch (err) {
            alert(err?.data?.message || "Failed to update");
        }
    };

    const handleSaveSection = async () => {
        const sectionFields = sections[activeSection].fields;
        const updates = { email: config.email };
        sectionFields.forEach(field => {
            if (formData[field] !== config[field]) {
                updates[field] = formData[field];
            }
        });
        try {
            await updateConfig(updates).unwrap();
            alert("Settings updated successfully!");
            refetch();
        } catch (err) {
            alert(err?.data?.message || "Failed to update settings");
        }
    };

    if (isLoading) {
        return (
            <main style={{
                padding: isMobile ? "12px" : "16px",
                minHeight: "100vh",
                backgroundColor: theme.background,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        width: "40px",
                        height: "40px",
                        border: `3px solid ${theme.border}`,
                        borderTopColor: theme.primary,
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto 16px"
                    }}></div>
                    <p style={{ color: theme.textMuted }}>Loading settings...</p>
                </div>
                <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </main>
        );
    }

    return (
        <main style={{
            padding: isMobile ? "12px" : "16px",
            // minHeight: "100vh",
            backgroundColor: theme.background
        }}>
            {/* Header */}
            <div style={{ marginBottom: isMobile ? "16px" : "20px", height: 'max-content' }}>
                <h1 style={{
                    fontSize: isMobile ? "18px" : "20px",
                    fontWeight: "600",
                    color: theme.text,
                    margin: "0 0 6px 0"
                }}>
                    App Settings
                </h1>
                <p style={{
                    fontSize: isMobile ? "12px" : "13px",
                    color: theme.textMuted,
                    margin: 0
                }}>
                    Manage your application configuration
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: isMobile ? "8px" : "12px",
                marginBottom: isMobile ? "16px" : "20px"
            }}>
                <div style={{
                    backgroundColor: theme.card,
                    borderRadius: isMobile ? "8px" : "10px",
                    padding: isMobile ? "12px" : "16px",
                    borderLeft: `4px solid ${theme.success}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}>
                    <p style={{
                        fontSize: isMobile ? "10px" : "11px",
                        color: theme.textMuted,
                        margin: "0 0 4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                    }}>Active Users</p>
                    <p style={{
                        fontSize: isMobile ? "20px" : "24px",
                        fontWeight: "700",
                        color: theme.success,
                        margin: 0
                    }}>{activeUsersCount}</p>
                </div>
                <div style={{
                    backgroundColor: theme.card,
                    borderRadius: isMobile ? "8px" : "10px",
                    padding: isMobile ? "12px" : "16px",
                    borderLeft: `4px solid ${theme.danger}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}>
                    <p style={{
                        fontSize: isMobile ? "10px" : "11px",
                        color: theme.textMuted,
                        margin: "0 0 4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                    }}>Inactive Users</p>
                    <p style={{
                        fontSize: isMobile ? "20px" : "24px",
                        fontWeight: "700",
                        color: theme.danger,
                        margin: 0
                    }}>{inactiveUsersCount}</p>
                </div>
            </div>

            {/* Section Tabs */}
            <div style={{
                display: "flex",
                gap: isMobile ? "6px" : "8px",
                overflowX: "auto",
                paddingBottom: "8px",
                marginBottom: isMobile ? "12px" : "16px",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch"
            }}>
                {Object.entries(sections).map(([key, section]) => (
                    <button
                        key={key}
                        onClick={() => setActiveSection(key)}
                        style={{
                            padding: isMobile ? "8px 10px" : "10px 16px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: activeSection === key ? theme.primary : theme.card,
                            color: activeSection === key ? "#fff" : theme.textMuted,
                            fontSize: isMobile ? "11px" : "13px",
                            fontWeight: "500",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            display: "flex",
                            alignItems: "center",
                            gap: isMobile ? "4px" : "6px",
                            boxShadow: activeSection === key ? "0 2px 8px rgba(99,102,241,0.3)" : "0 1px 2px rgba(0,0,0,0.05)",
                            transition: "all 0.2s",
                            flexShrink: 0
                        }}
                    >
                        <span style={{ fontSize: isMobile ? "12px" : "14px" }}>{section.icon}</span>
                        {isMobile ? section.shortTitle : section.title}
                    </button>
                ))}
            </div>

            {/* Active Section Form */}
            <div style={{
                backgroundColor: theme.card,
                borderRadius: isMobile ? "10px" : "12px",
                padding: isMobile ? "14px" : "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
                <div style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "flex-start" : "center",
                    justifyContent: "space-between",
                    marginBottom: isMobile ? "16px" : "20px",
                    paddingBottom: isMobile ? "12px" : "16px",
                    borderBottom: `1px solid ${theme.border}`,
                    gap: isMobile ? "12px" : "0"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "10px" }}>
                        <span style={{ fontSize: isMobile ? "20px" : "24px" }}>{sections[activeSection].icon}</span>
                        <h2 style={{
                            fontSize: isMobile ? "14px" : "16px",
                            fontWeight: "600",
                            color: theme.text,
                            margin: 0
                        }}>
                            {sections[activeSection].title}
                        </h2>
                    </div>
                    <button
                        onClick={handleSaveSection}
                        disabled={updating}
                        style={{
                            padding: isMobile ? "10px 14px" : "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: theme.primary,
                            color: "#fff",
                            fontSize: isMobile ? "12px" : "13px",
                            fontWeight: "600",
                            cursor: updating ? "not-allowed" : "pointer",
                            opacity: updating ? 0.7 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            width: isMobile ? "100%" : "auto"
                        }}
                    >
                        {updating ? "Saving..." : "💾 Save Changes"}
                    </button>
                </div>

                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: isMobile ? "12px" : "16px"
                }}>
                    {sections[activeSection].fields.map((field) => {
                        const isTextarea = ['share_message', 'how_to_play'].includes(field);
                        const isNumber = ['phone', 'whatsapp', 'google_pay', 'phone_pay', 'paytm', 'min_bid', 'min_withdrawal', 'min_deposit', 'point_rates', 'referal_bonus', 'default_balance'].includes(field);

                        return (
                            <div key={field}>
                                <label style={{
                                    display: "block",
                                    fontSize: isMobile ? "11px" : "12px",
                                    fontWeight: "600",
                                    color: theme.textMuted,
                                    marginBottom: isMobile ? "5px" : "6px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px"
                                }}>
                                    {fieldLabels[field] || field}
                                </label>
                                {isTextarea ? (
                                    <textarea
                                        value={formData[field] || ''}
                                        onChange={(e) => handleInputChange(field, e.target.value)}
                                        rows={isMobile ? 3 : 4}
                                        style={{
                                            width: "100%",
                                            padding: isMobile ? "10px 12px" : "12px 14px",
                                            border: `1px solid ${theme.border}`,
                                            borderRadius: "8px",
                                            fontSize: isMobile ? "14px" : "14px",
                                            color: theme.text,
                                            resize: "vertical",
                                            outline: "none",
                                            transition: "border-color 0.2s, box-shadow 0.2s",
                                            boxSizing: "border-box",
                                            fontFamily: "inherit"
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = theme.primary;
                                            e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = theme.border;
                                            e.target.style.boxShadow = "none";
                                        }}
                                    />
                                ) : (
                                    <input
                                        type={isNumber ? "number" : "text"}
                                        value={formData[field] || ''}
                                        onChange={(e) => handleInputChange(field, e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: isMobile ? "10px 12px" : "12px 14px",
                                            border: `1px solid ${theme.border}`,
                                            borderRadius: "8px",
                                            fontSize: "14px",
                                            color: theme.text,
                                            outline: "none",
                                            transition: "border-color 0.2s, box-shadow 0.2s",
                                            boxSizing: "border-box"
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = theme.primary;
                                            e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = theme.border;
                                            e.target.style.boxShadow = "none";
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* User Status Toggle - Special Section */}
            <div style={{
                backgroundColor: theme.card,
                borderRadius: isMobile ? "10px" : "12px",
                padding: isMobile ? "14px" : "20px",
                marginTop: isMobile ? "12px" : "16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px"
                }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            fontSize: isMobile ? "13px" : "14px",
                            fontWeight: "600",
                            color: theme.text,
                            margin: "0 0 4px"
                        }}>
                            New User Default Status
                        </h3>
                        <p style={{
                            fontSize: isMobile ? "11px" : "12px",
                            color: theme.textMuted,
                            margin: 0,
                            lineHeight: "1.4"
                        }}>
                            {isNewUserActive ? "New users will be active by default" : "New users will be inactive by default"}
                        </p>
                    </div>
                    <button
                        disabled={updating}
                        onClick={async () => {
                            const currentStatus = isNewUserActive;
                            const newStatus = !currentStatus;
                            handleInputChange('user_status', newStatus);
                            try {
                                await updateConfig({
                                    email: config.email,
                                    user_status: newStatus ? 1 : 0,
                                }).unwrap();
                                refetch();
                            } catch (err) {
                                handleInputChange('user_status', currentStatus);
                                alert("Failed to update");
                            }
                        }}
                        style={{
                            width: isMobile ? "48px" : "52px",
                            height: isMobile ? "26px" : "28px",
                            borderRadius: "14px",
                            border: "none",
                            backgroundColor: isNewUserActive ? theme.success : theme.border,
                            cursor: updating ? "not-allowed" : "pointer",
                            position: "relative",
                            transition: "background-color 0.2s",
                            flexShrink: 0,
                            opacity: updating ? 0.7 : 1,
                        }}
                    >
                        <span style={{
                            position: "absolute",
                            top: "2px",
                            left: isNewUserActive ? (isMobile ? "24px" : "26px") : "2px",
                            width: isMobile ? "22px" : "24px",
                            height: isMobile ? "22px" : "24px",
                            borderRadius: "50%",
                            backgroundColor: "#fff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            transition: "left 0.2s"
                        }}></span>
                    </button>
                </div>
            </div>



            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
                ::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </main>
    );
}
