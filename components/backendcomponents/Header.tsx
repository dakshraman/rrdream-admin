"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
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
    const getInitials = (name: any) => {
        if (!name) return "U";
        const words = name.trim().split(" ");
        if (words.length === 1) return words[0][0].toUpperCase();
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };
    return (
        <>
            <link rel="stylesheet" href="/admin-assets/fonts/font.css" />
            <header>
                <div className="header-wrapper">
                    <div className="colA">
                        <a href="/dashboard" className="logo">
                            <img src="/admin-assets/img/logo.png" alt="UB" style={{ width: "64px",marginLeft:"39px" }} />
                        </a>
                    </div>
                    <div className="colB">
                        <ul>
                            <li>
                                <div className="dropdown-wrap inline-flex align-center">
                                    <div className="user-ico">
                                        {/* {profileImage ? (
                                            <img src={`/OnlineImages/AuthImages/${profileImage}`} alt={userName || "User"} className="user-image" />
                                        ) : (
                                            <div className="user-ico"><span>{getInitials(userName)}</span></div>
                                        )} */}
                                        <div className="user-ico"><span>{getInitials(userName)}</span></div>
                                    </div>
                                    <div data-dropdown className="admin_de">
                                        <span className="title">{userName || "Guest"}</span>
                                        <span className="design-ekgrgb">{userRole || "Role"}</span>
                                    </div>
                                </div>
                            </li>
                            {/* <li><a href="https://www.prettifycreative.com" data-dialog="byokkl" className="logo" target="_blank"><img src="/admin-assets/img/realtydigi-logo.png" alt="" /></a></li> */}
                        </ul>
                    </div>
                </div>
            </header>
            {/* <Overlay /> */}
        </>
    )
}
