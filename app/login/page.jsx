'use client';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useLoginMutation } from "../../store/backendSlice/authAPISlice";
import { useDispatch } from "react-redux";
import { login } from "../../store/backendSlice/authReducer";
import Pageloading from '../Pageloading';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMutation, { isLoading }] = useLoginMutation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await loginMutation({ username, password }).unwrap();
      console.log("Login Result:", result);
      if (result.token) {
        dispatch(login({
          admin: result.Admin || result.admin,
          token: result.token,
        }));

        toast.success(result.message || "Login successful", { duration: 800 });
        window.location.href = "/dashboard";
      } else {
        toast.error(result.message || "Invalid credentials", { duration: 1500 });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Please try again.", { duration: 1500 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-wrapper">
        <div className="form-wrap">
          <div className="login-form" data-tab="login-form">
            <form className="model-body" onSubmit={handleLogin}>
              <div className="logo">
                <img src="/admin-assets/img/logo.png" alt="Logo" style={{ width: "123px" }} />
              </div>
              <div className="form">
                <div className="form-group">
                  <label htmlFor="txtusername">User Name*</label>
                  <input
                    type="text"
                    id="txtusername"
                    className="form-control"
                    placeholder="Enter user name"
                    value={username}
                    onChange={(e) => setusername(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="txtpassword">Password*</label>
                  <div className="password-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="txtpassword"
                      className="form-control login-password"
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => setpassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "24px",
                        height: "24px"
                      }}
                      dangerouslySetInnerHTML={{
                        __html: showPassword
                          ? `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                                                        <path fill="#666" d="M10.94 6.08A7 7 0 0 1 12 6c3.18 0 6.17 2.29 7.91 6a15 15 0 0 1-.9 1.64a1 1 0 0 0-.16.55a1 1 0 0 0 1.86.5a16 16 0 0 0 1.21-2.3a1 1 0 0 0 0-.79C19.9 6.91 16.1 4 12 4a8 8 0 0 0-1.4.12a1 1 0 1 0 .34 2ZM3.71 2.29a1 1 0 0 0-1.42 1.42l3.1 3.09a14.6 14.6 0 0 0-3.31 4.8a1 1 0 0 0 0 .8C4.1 17.09 7.9 20 12 20a9.26 9.26 0 0 0 5.05-1.54l3.24 3.25a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42Zm6.36 9.19l2.45 2.45A1.8 1.8 0 0 1 12 14a2 2 0 0 1-2-2a1.8 1.8 0 0 1 .07-.52M12 18c-3.18 0-6.17-2.29-7.9-6a12.1 12.1 0 0 1 2.7-3.79L8.57 10A4 4 0 0 0 14 15.43L15.59 17A7.24 7.24 0 0 1 12 18" />
                                                    </svg>`
                          : `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                                                        <g fill="none" stroke="#666" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                                                            <path d="M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0" />
                                                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7s-8.268-2.943-9.542-7" />
                                                        </g>
                                                    </svg>`
                      }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="form-group btn w-100"
                  disabled={isLoading || loading}
                >
                  {isLoading || loading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {loading && <Pageloading />}
    </>
  );
}