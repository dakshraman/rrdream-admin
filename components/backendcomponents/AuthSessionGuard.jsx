import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Pageloading from "@/app/Pageloading";
import { useCheckLoginQuery } from "@/store/backendSlice/authAPISlice";
import { apiAPISlice } from "@/store/backendSlice/apiAPISlice";
import { logout } from "@/store/backendSlice/authReducer";

const isPublicRoute = (pathname = "") => pathname.startsWith("/login");

export default function AuthSessionGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.token);
  const pathname = location.pathname;
  const onPublicRoute = isPublicRoute(pathname);

  const { isLoading, isSuccess, isError, error } =
    useCheckLoginQuery(undefined, {
      skip: !token,
      refetchOnMountOrArgChange: true,
      pollingInterval: 5 * 60_000, // every 5 min — 401s are caught per-request already
    });
  const authErrorStatus = error?.status;
  const hasAuthError =
    authErrorStatus === 401 ||
    authErrorStatus === 403 ||
    authErrorStatus === 422;

  useEffect(() => {
    if (onPublicRoute) return;
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [onPublicRoute, token, navigate]);

  useEffect(() => {
    if (!token || !onPublicRoute) return;
    if (isSuccess) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, onPublicRoute, isSuccess, navigate]);

  useEffect(() => {
    if (!token || !isError) return;

    if (hasAuthError) {
      dispatch(logout());
      dispatch(apiAPISlice.util.resetApiState());
      navigate("/login", { replace: true });
    }
  }, [token, isError, hasAuthError, dispatch, navigate]);

  if (!onPublicRoute) {
    if (!token) return null;
    // Only block UI on the initial auth check; background refetches should not flicker the page.
    if (isLoading) return <Pageloading />;
    if (hasAuthError) return null;
  }

  return <>{children}</>;
}
