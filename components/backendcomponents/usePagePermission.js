import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminStaticData from "@/components/backendcomponents/AdminStaticData.json";
import { useCheckLoginQuery } from "../../store/backendSlice/authAPISlice";
export function usePagePermission() {
    var _a;
    const location = useLocation();
    const pathname = location.pathname;
    const { data: checkData, isSuccess, refetch } = useCheckLoginQuery(undefined, {
        refetchOnMountOrArgChange: true,
        pollingInterval: 10000,
    });
    const [pagePermission, setPagePermission] = useState({
        PageID: 0,
        CanRead: 0,
        CanWrite: 0,
        CanDelete: 0,
        CanAdd: 0,
    });
    const getSlug = (url) => {
        if (!url)
            return "";
        const clean = url.split("?")[0].replace(/\/$/, "");
        return clean.split("/").pop() || "";
    };
    useEffect(() => {
        var _a, _b, _c, _d;
        if (!isSuccess || !(checkData === null || checkData === void 0 ? void 0 : checkData.user))
            return;
        const storedUser = checkData.user;
        const storedPermissions = [...(storedUser.permissions || [])];
        const Menu = AdminStaticData.Menu.items;
        const currentSlug = getSlug(pathname);
        const findPage = (items) => {
            for (const item of items) {
                const urlSlug = getSlug(item.url);
                const addUrlSlug = getSlug(item.addurl);
                if (urlSlug === currentSlug || addUrlSlug === currentSlug) {
                    return item;
                }
                if (item.MoreItem) {
                    const subPage = findPage(item.MoreItem);
                    if (subPage)
                        return subPage;
                }
            }
            return null;
        };
        const currentPage = findPage(Menu);
        if (currentPage) {
            if ((storedUser === null || storedUser === void 0 ? void 0 : storedUser.loginID) === 1) {
                setPagePermission({
                    PageID: currentPage.PageID,
                    CanRead: 1,
                    CanWrite: 1,
                    CanDelete: 1,
                    CanAdd: 1,
                });
            }
            else {
                const perm = storedPermissions.find((p) => Number(p.PageID) === Number(currentPage.PageID));
                setPagePermission({
                    PageID: currentPage.PageID,
                    CanRead: (_a = perm === null || perm === void 0 ? void 0 : perm.CanRead) !== null && _a !== void 0 ? _a : 0,
                    CanWrite: (_b = perm === null || perm === void 0 ? void 0 : perm.CanWrite) !== null && _b !== void 0 ? _b : 0,
                    CanDelete: (_c = perm === null || perm === void 0 ? void 0 : perm.CanDelete) !== null && _c !== void 0 ? _c : 0,
                    CanAdd: (_d = perm === null || perm === void 0 ? void 0 : perm.CanAdd) !== null && _d !== void 0 ? _d : 0,
                });
            }
        }
        else {
            console.warn("⚠️ No match found in AdminStaticData for slug:", currentSlug);
        }
    }, [pathname, checkData === null || checkData === void 0 ? void 0 : checkData.user, (_a = checkData === null || checkData === void 0 ? void 0 : checkData.user) === null || _a === void 0 ? void 0 : _a.permissions, isSuccess]);
    return { pagePermission, refetchCheckData: refetch };
}
