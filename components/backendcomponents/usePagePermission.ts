import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AdminStaticData from "@/components/backendcomponents/AdminStaticData.json";
import { useCheckLoginQuery } from "../../store/backendSlice/authAPISlice";

type Permission = {
  PageID: number;
  CanRead: number;
  CanWrite: number;
  CanDelete: number;
  CanAdd: number;
};

export function usePagePermission() {
  const pathname = usePathname();
  const { data: checkData, isSuccess, refetch } = useCheckLoginQuery(undefined, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 10000,
  });

  const [pagePermission, setPagePermission] = useState<Permission>({
    PageID: 0,
    CanRead: 0,
    CanWrite: 0,
    CanDelete: 0,
    CanAdd: 0,
  });
  const getSlug = (url: string): string => {
    if (!url) return "";
    const clean = url.split("?")[0].replace(/\/$/, "");
    return clean.split("/").pop() || "";
  };

  useEffect(() => {
    if (!isSuccess || !checkData?.user) return;

    const storedUser = checkData.user;
    const storedPermissions = [...(storedUser.permissions || [])];
    const Menu = AdminStaticData.Menu.items;

    const currentSlug = getSlug(pathname);

    const findPage = (items: any[]): any => {
      for (const item of items) {
        const urlSlug = getSlug(item.url);
        const addUrlSlug = getSlug(item.addurl);

        if (urlSlug === currentSlug || addUrlSlug === currentSlug) {
          return item;
        }

        if (item.MoreItem) {
          const subPage = findPage(item.MoreItem);
          if (subPage) return subPage;
        }
      }
      return null;
    };

    const currentPage = findPage(Menu);

    if (currentPage) {
      if (storedUser?.loginID === 1) {
        setPagePermission({
          PageID: currentPage.PageID,
          CanRead: 1,
          CanWrite: 1,
          CanDelete: 1,
          CanAdd: 1,
        });
      } else {
        const perm = storedPermissions.find(
          (p: any) => Number(p.PageID) === Number(currentPage.PageID)
        );

        setPagePermission({
          PageID: currentPage.PageID,
          CanRead: perm?.CanRead ?? 0,
          CanWrite: perm?.CanWrite ?? 0,
          CanDelete: perm?.CanDelete ?? 0,
          CanAdd: perm?.CanAdd ?? 0,
        });
      }
    } else {
      console.warn("⚠️ No match found in AdminStaticData for slug:", currentSlug);
    }
  }, [pathname, checkData?.user, checkData?.user?.permissions, isSuccess]);

  return { pagePermission, refetchCheckData: refetch };
}
