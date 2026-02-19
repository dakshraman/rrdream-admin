'use client';

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Pageloading from "@/app/Pageloading";
import { useCheckLoginQuery } from "@/store/backendSlice/authAPISlice";
import { apiAPISlice } from "@/store/backendSlice/apiAPISlice";
import { logout } from "@/store/backendSlice/authReducer";

const isPublicRoute = (pathname = "") => pathname.startsWith("/login");

export default function AuthSessionGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.token);
  const onPublicRoute = isPublicRoute(pathname);

  const { isLoading, isFetching, isSuccess, isError, error } =
    useCheckLoginQuery(undefined, {
      skip: !token,
      refetchOnMountOrArgChange: true,
      pollingInterval: 30000,
    });
  const authErrorStatus = error?.status;
  const hasAuthError =
    authErrorStatus === 401 ||
    authErrorStatus === 403 ||
    authErrorStatus === 422;

  useEffect(() => {
    if (onPublicRoute) return;
    if (!token) {
      router.replace("/login");
    }
  }, [onPublicRoute, token, router]);

  useEffect(() => {
    if (!token || !onPublicRoute) return;
    if (isSuccess) {
      router.replace("/dashboard");
    }
  }, [token, onPublicRoute, isSuccess, router]);

  useEffect(() => {
    if (!token || !isError) return;

    if (hasAuthError) {
      dispatch(logout());
      dispatch(apiAPISlice.util.resetApiState());
      router.replace("/login");
    }
  }, [token, isError, hasAuthError, dispatch, router]);

  if (!onPublicRoute) {
    if (!token) return null;
    if (isLoading || isFetching) return <Pageloading />;
    if (hasAuthError) return null;
  }

  return <>{children}</>;
}
