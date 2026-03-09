import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import Header from "./Header";
import SideNav from "./SideNav";
import { useLocation } from 'react-router-dom';
export default function MainHeaderFooter() {
    const location = useLocation();
    const hideLayout = ['/login'];
    const shouldHideLayout = hideLayout.some(path => location.pathname.startsWith(path));
    return (_jsx(_Fragment, { children: !shouldHideLayout && (_jsxs(_Fragment, { children: [_jsx(Header, {}), _jsx(SideNav, {})] })) }));
}
