import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
const ServiceSkeleton = () => {
    const skeletonStyle = {
        backgroundColor: "#e2e2e2",
        borderRadius: "4px",
        animation: "pulse 1.5s infinite",
    };
    return (_jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            width: "80vw",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #ddd",
            minHeight: "70px"
        }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "16px", flex: 1 }, children: [_jsx("div", { style: Object.assign(Object.assign({}, skeletonStyle), { height: "50px", width: "50px", borderRadius: "8px" }) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: Object.assign(Object.assign({}, skeletonStyle), { height: "16px", width: "150px", marginBottom: "10px" }) }), _jsx("div", { style: Object.assign(Object.assign({}, skeletonStyle), { height: "16px", width: "120px" }) })] })] }), _jsx("div", { style: Object.assign(Object.assign({}, skeletonStyle), { height: "36px", width: "60px", borderRadius: "6px", marginRight: "20px" }) }), " ", _jsxs("div", { style: { display: "flex", alignItems: "center", gap: "16px" }, children: [_jsx("div", { style: Object.assign(Object.assign({}, skeletonStyle), { height: "20px", width: "60px" }) }), " ", _jsx("div", { style: Object.assign(Object.assign({}, skeletonStyle), { height: "24px", width: "24px", borderRadius: "4px" }) }), " ", _jsx("div", { style: Object.assign(Object.assign({}, skeletonStyle), { height: "24px", width: "24px", borderRadius: "4px" }) }), " "] }), _jsx("style", { children: `
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        ` })] }));
};
export default ServiceSkeleton;
