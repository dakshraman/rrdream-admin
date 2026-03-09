import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useGetConfigQuery, useUpdateConfigMutation, useClearDataMutation } from "@/store/backendSlice/apiAPISlice";
import Swal from "sweetalert2";
export default function Settings() {
    const { data: configResponse, isLoading, refetch } = useGetConfigQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const [updateConfig, { isLoading: updating }] = useUpdateConfigMutation();
    const [clearData, { isLoading: isClearing }] = useClearDataMutation();
    const [formData, setFormData] = useState({});
    const [activeSection, setActiveSection] = useState('contact');
    const [editingField, setEditingField] = useState(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const config = (configResponse === null || configResponse === void 0 ? void 0 : configResponse.config) || {};
    const activeUsersCount = (configResponse === null || configResponse === void 0 ? void 0 : configResponse.active_users_count) || 0;
    const inactiveUsersCount = (configResponse === null || configResponse === void 0 ? void 0 : configResponse.inactive_users_count) || 0;
    const normalizeUserStatus = (value) => value === true || value === 1 || value === "1" || value === "true";
    const isNewUserActive = normalizeUserStatus(formData.user_status);
    useEffect(() => {
        if (config && Object.keys(config).length > 0) {
            setFormData(Object.assign(Object.assign({}, config), { user_status: normalizeUserStatus(config.user_status) }));
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
        setFormData(prev => (Object.assign(Object.assign({}, prev), { [field]: value })));
    };
    const handleSaveField = async (field) => {
        var _a;
        try {
            await updateConfig({ email: config.email, [field]: formData[field] }).unwrap();
            setEditingField(null);
            Swal.fire('Success', `${fieldLabels[field]} updated successfully!`, 'success');
        }
        catch (err) {
            Swal.fire('Error', ((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || "Failed to update", 'error');
        }
    };
    const handleSaveSection = async () => {
        var _a;
        const sectionFields = sections[activeSection].fields;
        const updates = { email: config.email };
        sectionFields.forEach(field => {
            if (formData[field] !== config[field]) {
                updates[field] = formData[field];
            }
        });
        try {
            await updateConfig(updates).unwrap();
            Swal.fire('Success', "Settings updated successfully!", 'success');
            setEditingField(null);
            refetch();
        }
        catch (err) {
            Swal.fire('Error', ((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || "Failed to update settings", 'error');
        }
    };
    if (isLoading) {
        return (_jsxs("main", { style: {
                padding: isMobile ? "12px" : "16px",
                minHeight: "100vh",
                backgroundColor: theme.background,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }, children: [_jsxs("div", { style: { textAlign: "center" }, children: [_jsx("div", { style: {
                                width: "40px",
                                height: "40px",
                                border: `3px solid ${theme.border}`,
                                borderTopColor: theme.primary,
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite",
                                margin: "0 auto 16px"
                            } }), _jsx("p", { style: { color: theme.textMuted }, children: "Loading settings..." })] }), _jsx("style", { jsx: true, children: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` })] }));
    }
    return (_jsxs("main", { style: {
            padding: isMobile ? "12px" : "16px",
            // minHeight: "100vh",
            backgroundColor: theme.background
        }, children: [_jsxs("div", { style: { marginBottom: isMobile ? "16px" : "20px", height: 'max-content' }, children: [_jsx("h1", { style: {
                            fontSize: isMobile ? "18px" : "20px",
                            fontWeight: "600",
                            color: theme.text,
                            margin: "0 0 6px 0"
                        }, children: "App Settings" }), _jsx("p", { style: {
                            fontSize: isMobile ? "12px" : "13px",
                            color: theme.textMuted,
                            margin: 0
                        }, children: "Manage your application configuration" })] }), _jsxs("div", { style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: isMobile ? "8px" : "12px",
                    marginBottom: isMobile ? "16px" : "20px"
                }, children: [_jsxs("div", { style: {
                            backgroundColor: theme.card,
                            borderRadius: isMobile ? "8px" : "10px",
                            padding: isMobile ? "12px" : "16px",
                            borderLeft: `4px solid ${theme.success}`,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                        }, children: [_jsx("p", { style: {
                                    fontSize: isMobile ? "10px" : "11px",
                                    color: theme.textMuted,
                                    margin: "0 0 4px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px"
                                }, children: "Active Users" }), _jsx("p", { style: {
                                    fontSize: isMobile ? "20px" : "24px",
                                    fontWeight: "700",
                                    color: theme.success,
                                    margin: 0
                                }, children: activeUsersCount })] }), _jsxs("div", { style: {
                            backgroundColor: theme.card,
                            borderRadius: isMobile ? "8px" : "10px",
                            padding: isMobile ? "12px" : "16px",
                            borderLeft: `4px solid ${theme.danger}`,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                        }, children: [_jsx("p", { style: {
                                    fontSize: isMobile ? "10px" : "11px",
                                    color: theme.textMuted,
                                    margin: "0 0 4px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px"
                                }, children: "Inactive Users" }), _jsx("p", { style: {
                                    fontSize: isMobile ? "20px" : "24px",
                                    fontWeight: "700",
                                    color: theme.danger,
                                    margin: 0
                                }, children: inactiveUsersCount })] })] }), _jsx("div", { style: {
                    display: "flex",
                    gap: isMobile ? "6px" : "8px",
                    overflowX: "auto",
                    paddingBottom: "8px",
                    marginBottom: isMobile ? "12px" : "16px",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch"
                }, children: Object.entries(sections).map(([key, section]) => (_jsxs("button", { onClick: () => setActiveSection(key), style: {
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
                    }, children: [_jsx("span", { style: { fontSize: isMobile ? "12px" : "14px" }, children: section.icon }), isMobile ? section.shortTitle : section.title] }, key))) }), _jsxs("div", { style: {
                    backgroundColor: theme.card,
                    borderRadius: isMobile ? "10px" : "12px",
                    padding: isMobile ? "14px" : "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }, children: [_jsxs("div", { style: {
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                            alignItems: isMobile ? "flex-start" : "center",
                            justifyContent: "space-between",
                            marginBottom: isMobile ? "16px" : "20px",
                            paddingBottom: isMobile ? "12px" : "16px",
                            borderBottom: `1px solid ${theme.border}`,
                            gap: isMobile ? "12px" : "0"
                        }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: isMobile ? "8px" : "10px" }, children: [_jsx("span", { style: { fontSize: isMobile ? "20px" : "24px" }, children: sections[activeSection].icon }), _jsx("h2", { style: {
                                            fontSize: isMobile ? "14px" : "16px",
                                            fontWeight: "600",
                                            color: theme.text,
                                            margin: 0
                                        }, children: sections[activeSection].title })] }), _jsx("button", { onClick: handleSaveSection, disabled: updating, style: {
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
                                }, children: updating ? "Saving..." : "💾 Save Changes" })] }), _jsx("div", { style: {
                            display: "flex",
                            flexDirection: "column",
                            gap: isMobile ? "12px" : "16px"
                        }, children: sections[activeSection].fields.map((field) => {
                            const isTextarea = ['share_message', 'how_to_play'].includes(field);
                            const isNumber = ['phone', 'whatsapp', 'google_pay', 'phone_pay', 'paytm', 'min_bid', 'min_withdrawal', 'min_deposit', 'point_rates', 'referal_bonus', 'default_balance'].includes(field);
                            return (_jsxs("div", { children: [_jsx("label", { style: {
                                            display: "block",
                                            fontSize: isMobile ? "11px" : "12px",
                                            fontWeight: "600",
                                            color: theme.textMuted,
                                            marginBottom: isMobile ? "5px" : "6px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }, children: fieldLabels[field] || field }), isTextarea ? (_jsx("textarea", { value: formData[field] || '', onChange: (e) => handleInputChange(field, e.target.value), rows: isMobile ? 3 : 4, style: {
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
                                        }, onFocus: (e) => {
                                            e.target.style.borderColor = theme.primary;
                                            e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
                                        }, onBlur: (e) => {
                                            e.target.style.borderColor = theme.border;
                                            e.target.style.boxShadow = "none";
                                        } })) : (_jsx("input", { type: isNumber ? "number" : "text", value: formData[field] || '', onChange: (e) => handleInputChange(field, e.target.value), style: {
                                            width: "100%",
                                            padding: isMobile ? "10px 12px" : "12px 14px",
                                            border: `1px solid ${theme.border}`,
                                            borderRadius: "8px",
                                            fontSize: "14px",
                                            color: theme.text,
                                            outline: "none",
                                            transition: "border-color 0.2s, box-shadow 0.2s",
                                            boxSizing: "border-box"
                                        }, onFocus: (e) => {
                                            e.target.style.borderColor = theme.primary;
                                            e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
                                        }, onBlur: (e) => {
                                            e.target.style.borderColor = theme.border;
                                            e.target.style.boxShadow = "none";
                                        } }))] }, field));
                        }) })] }), _jsx("div", { style: {
                    backgroundColor: theme.card,
                    borderRadius: isMobile ? "10px" : "12px",
                    padding: isMobile ? "14px" : "20px",
                    marginTop: isMobile ? "12px" : "16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }, children: _jsxs("div", { style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px"
                    }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("h3", { style: {
                                        fontSize: isMobile ? "13px" : "14px",
                                        fontWeight: "600",
                                        color: theme.text,
                                        margin: "0 0 4px"
                                    }, children: "New User Default Status" }), _jsx("p", { style: {
                                        fontSize: isMobile ? "11px" : "12px",
                                        color: theme.textMuted,
                                        margin: 0,
                                        lineHeight: "1.4"
                                    }, children: isNewUserActive ? "New users will be active by default" : "New users will be inactive by default" })] }), _jsx("button", { disabled: updating, onClick: async () => {
                                const currentStatus = isNewUserActive;
                                const newStatus = !currentStatus;
                                handleInputChange('user_status', newStatus);
                                try {
                                    await updateConfig({
                                        email: config.email,
                                        user_status: newStatus ? 1 : 0,
                                    }).unwrap();
                                    refetch();
                                }
                                catch (err) {
                                    handleInputChange('user_status', currentStatus);
                                    Swal.fire('Error', "Failed to update", 'error');
                                }
                            }, style: {
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
                            }, children: _jsx("span", { style: {
                                    position: "absolute",
                                    top: "2px",
                                    left: isNewUserActive ? (isMobile ? "24px" : "26px") : "2px",
                                    width: isMobile ? "22px" : "24px",
                                    height: isMobile ? "22px" : "24px",
                                    borderRadius: "50%",
                                    backgroundColor: "#fff",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                    transition: "left 0.2s"
                                } }) })] }) }), _jsx("div", { style: {
                    backgroundColor: theme.card,
                    borderRadius: isMobile ? "10px" : "12px",
                    padding: isMobile ? "14px" : "20px",
                    marginTop: isMobile ? "12px" : "16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }, children: _jsxs("div", { style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px"
                    }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("h3", { style: {
                                        fontSize: isMobile ? "13px" : "14px",
                                        fontWeight: "600",
                                        color: theme.text,
                                        margin: "0 0 4px"
                                    }, children: "Server Cache" }), _jsx("p", { style: {
                                        fontSize: isMobile ? "11px" : "12px",
                                        color: theme.textMuted,
                                        margin: 0,
                                        lineHeight: "1.4"
                                    }, children: "Clear the server cache manually to resolve stale data issues." })] }), _jsx("button", { disabled: isClearing, onClick: async () => {
                                var _a;
                                try {
                                    const res = await clearData().unwrap();
                                    Swal.fire('Success', (res === null || res === void 0 ? void 0 : res.message) || "Server cache cleared successfully!", 'success');
                                }
                                catch (err) {
                                    Swal.fire('Error', ((_a = err === null || err === void 0 ? void 0 : err.data) === null || _a === void 0 ? void 0 : _a.message) || "Failed to clear cache", 'error');
                                }
                            }, style: {
                                padding: "8px 16px",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: theme.danger,
                                color: "#fff",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: isClearing ? "not-allowed" : "pointer",
                                opacity: isClearing ? 0.7 : 1,
                            }, children: isClearing ? "Clearing..." : "Clear Cache" })] }) }), "            ", _jsx("style", { jsx: true, children: `
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
            ` })] }));
}
