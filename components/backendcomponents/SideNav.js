import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import AdminStaticData from "./AdminStaticData.json";
import parse from "html-react-parser";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { apiAPISlice, useBackendLogoutMutation } from "@/store/backendSlice/apiAPISlice";
import { logout } from "@/store/backendSlice/authReducer";
import "./SideNav.css";
export default function SideNav() {
    var _a;
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;
    const dispatch = useDispatch();
    const [openIndex, setOpenIndex] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const Menu = ((_a = AdminStaticData === null || AdminStaticData === void 0 ? void 0 : AdminStaticData.Menu) === null || _a === void 0 ? void 0 : _a.items) || [];
    const [backendLogout] = useBackendLogoutMutation();
    useEffect(() => {
        const hideBtn = document.querySelector(".hide_menu");
        const sideMenu = document.getElementsByTagName("aside");
        const menuToggle = () => {
            hideBtn === null || hideBtn === void 0 ? void 0 : hideBtn.classList.toggle("collapse");
            Array.from(sideMenu).forEach((item) => item.classList.toggle("collapse"));
        };
        hideBtn === null || hideBtn === void 0 ? void 0 : hideBtn.addEventListener("click", menuToggle);
        return () => hideBtn === null || hideBtn === void 0 ? void 0 : hideBtn.removeEventListener("click", menuToggle);
    }, []);
    // Auto-open dropdown if current path matches a sub-item
    useEffect(() => {
        Menu.filter(item => item.Show === "1").forEach((item, index) => {
            const subItems = item.MoreItem || [];
            const isSubActive = subItems.some(sub => pathname === sub.url);
            if (isSubActive)
                setOpenIndex(index);
        });
    }, [pathname]);
    const handleLogout = async () => {
        try {
            await backendLogout().unwrap();
        }
        catch (err) {
            console.error("Backend logout failed:", err);
        }
        dispatch(logout());
        dispatch(apiAPISlice.util.resetApiState());
        navigate("/login");
    };
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);
    return (_jsxs(_Fragment, { children: [_jsxs("button", { className: "mobile-menu-toggle", onClick: toggleMobileMenu, "aria-label": "Toggle menu", children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {})] }), isMobileMenuOpen && (_jsx("div", { className: "mobile-overlay", onClick: closeMobileMenu })), _jsxs("aside", { className: isMobileMenuOpen ? "mobile-open" : "", children: [_jsx("button", { className: "mobile-close-btn", onClick: closeMobileMenu, "aria-label": "Close menu", children: "\u00D7" }), _jsx("div", { className: "aside-wrap", children: _jsx("div", { className: "aside-col", children: _jsxs("ul", { className: "Header_nav_Active", children: [Menu.filter(item => item.Show === "1").map((item, index) => {
                                        // FIX 1: MoreItem entries don't always have Show field — treat missing Show as visible
                                        const subItems = (item.MoreItem || []).filter(sub => !sub.Show || sub.Show === "1");
                                        const isActive = pathname === item.url ||
                                            pathname === item.addurl ||
                                            subItems.some(sub => pathname === sub.url);
                                        const isOpen = openIndex === index;
                                        return (_jsxs("li", { className: isActive ? "li-active" : "", children: [_jsx("div", { className: `nav-item-wrap ${subItems.length ? "hasDropdown" : ""}`, children: subItems.length > 0 ? (_jsxs("button", { className: `nav-link-btn ${isActive ? "active" : ""}`, onClick: () => setOpenIndex(isOpen ? null : index), type: "button", children: [item.icon && parse(item.icon), _jsx("span", { children: item.title }), _jsx("svg", { className: `dropdown-arrow ${isOpen ? "open" : ""}`, xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("polyline", { points: "6 9 12 15 18 9" }) })] })) : (_jsxs(Link, { href: item.url || "#", className: isActive ? "active" : "", onClick: closeMobileMenu, children: [item.icon && parse(item.icon), _jsx("span", { children: item.title })] })) }), subItems.length > 0 && (_jsx("ul", { className: `aside-dropdown ${isOpen ? "open" : ""}`, style: { padding: "1px 0 10px 42px" }, children: subItems.map((sub, i) => (_jsx("li", { children: _jsxs(Link, { href: sub.url, className: pathname === sub.url ? "active" : "", onClick: closeMobileMenu, children: [sub.icon && parse(sub.icon), _jsx("span", { children: sub.title })] }) }, i))) }))] }, index));
                                    }), _jsx("li", { children: _jsxs("a", { onClick: handleLogout, style: { cursor: "pointer" }, children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "1em", height: "1em", viewBox: "0 0 24 24", children: _jsx("path", { fill: "none", stroke: "currentColor", strokeWidth: "1.5", d: "M7.023 5.5a9 9 0 1 0 9.953 0M12 2v8" }) }), _jsx("span", { children: "Log Out" })] }) })] }) }) })] })] }));
}
