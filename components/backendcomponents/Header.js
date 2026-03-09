import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
// import { useCheckLoginQuery } from "../../store/backendSlice/authAPISlice";
export default function Header() {
    const [userName, setUserName] = useState("");
    const [userRole, setUserRole] = useState("");
    const [profileImage, setProfileImage] = useState("");
    // const { data: checkData, isSuccess, refetch } = useCheckLoginQuery(undefined, {
    //     refetchOnMountOrArgChange: true,
    //     pollingInterval: 10000,
    // });
    // useEffect(() => {
    //     const user = checkData?.user;
    //     if (user) {
    //         setUserName(user.FullName || "");
    //         setUserRole(user.Role || "");
    //         setProfileImage(user.ProfileImage || "");
    //     }
    // }, [checkData]);
    const getInitials = (name) => {
        if (!name)
            return "U";
        const words = name.trim().split(" ");
        if (words.length === 1)
            return words[0][0].toUpperCase();
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };
    return (_jsxs(_Fragment, { children: [_jsx("link", { rel: "stylesheet", href: "/admin-assets/fonts/font.css" }), _jsx("header", { children: _jsxs("div", { className: "header-wrapper", children: [_jsx("div", { className: "colA", children: _jsx("a", { href: "/dashboard", className: "logo", children: _jsx("img", { src: "/admin-assets/img/logo.png", alt: "UB", style: { width: "64px", marginLeft: "39px" } }) }) }), _jsx("div", { className: "colB", children: _jsx("ul", { children: _jsx("li", { children: _jsxs("div", { className: "dropdown-wrap inline-flex align-center", children: [_jsx("div", { className: "user-ico", children: _jsx("div", { className: "user-ico", children: _jsx("span", { children: getInitials(userName) }) }) }), _jsxs("div", { "data-dropdown": true, className: "admin_de", children: [_jsx("span", { className: "title", children: userName || "Guest" }), _jsx("span", { className: "design-ekgrgb", children: userRole || "Role" })] })] }) }) }) })] }) })] }));
}
