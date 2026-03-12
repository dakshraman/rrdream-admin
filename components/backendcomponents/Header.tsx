import { useDispatch } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { apiAPISlice, useBackendLogoutMutation } from "@/store/backendSlice/apiAPISlice"
import { logout } from "@/store/backendSlice/authReducer"

export default function Header() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [backendLogout] = useBackendLogoutMutation() as [(...args: any[]) => Promise<any>, any]

    const handleLogout = async () => {
        try {
            await backendLogout()
        } catch {
            // ignore backend logout errors; local logout always proceeds
        }
        ;(dispatch as any)(logout())
        ;(dispatch as any)(apiAPISlice.util.resetApiState())
        navigate("/login")
    }

    return (
        <>
            <link rel="stylesheet" href="/admin-assets/fonts/font.css" />
            <header>
                <div className="header-wrapper">
                    <div className="colA">
                        <Link to="/dashboard" className="logo">
                            <img src="/admin-assets/img/logo.png" alt="UB" style={{ width: "64px", marginLeft: "39px" }} />
                        </Link>
                    </div>
                    <div className="colB">
                        <ul>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        background: "#dc2626",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "8px 18px",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "background 0.2s",
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "#b91c1c")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "#dc2626")}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </header>
        </>
    )
}
