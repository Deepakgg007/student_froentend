import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api"; // Adjust path if needed

const Header = () => {
    const [menuToggle, setMenuToggle] = useState(false);
    const [socialToggle, setSocialToggle] = useState(false);
    const [headerFiexd, setHeaderFiexd] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Detect active route
    const currentPath = location.pathname;

    // Fixed header on scroll
    useEffect(() => {
        const handleScroll = () => {
            setHeaderFiexd(window.scrollY > 200);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Check authentication
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem("student_access_token") || localStorage.getItem("token");
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await api.get("/auth/me");
            if (response.data) {
                setUser(response.data.user || response.data);
            }
        } catch (error) {
            console.log("User not logged in or token expired");
            setUser(null);
            localStorage.removeItem("student_access_token");
            localStorage.removeItem("token");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        try {
            setUser(null);
            localStorage.clear();
            console.log("✅ Logged out successfully");
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 100);
        } catch (error) {
            console.error("Logout error:", error);
            window.location.href = "/login";
        }
    };

    if (loading) {
        return (
            <header className="header-section style-4">
                <div className="header-bottom">
                    <div className="container">
                        <div className="header-wrapper">
                            <div className="logo">
                                <Link to="/">
                                    <img src="assets/images/logo/01.png" alt="logo" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <>
            {/* 🔸 Inline CSS for active menu styling */}
            <style>{`
                .active-link {
                    color: #ff6600 !important;
                    font-weight: 600;
                    border-bottom: 2px solid #ff6600;
                    transition: all 0.3s ease;
                }
                .menu a {
                    text-decoration: none;
                    color: #333;
                    transition: color 0.3s ease;
                }
                .menu a:hover {
                    color: #ff6600;
                }
                .menu-item-has-children.active-parent > a {
                    color: #ff6600 !important;
                    font-weight: 600;
                    border-bottom: 2px solid #ff6600;
                }
                .logout-btn {
                    color: #e63946;
                    font-weight: 500;
                }
                .logout-btn:hover {
                    color: #ff0000;
                }
            `}</style>

            <header className={`header-section style-4 ${headerFiexd ? "header-fixed fadeInUp" : ""}`}>
                <div className="header-bottom">
                    <div className="container">
                        <div className="header-wrapper">
                            {/* Logo */}
                            <div className="logo">
                                <Link to="/">
                                    <img src="assets/images/logo/01.png" alt="logo" />
                                </Link>
                            </div>

                            {/* Menu */}
                            <div className="menu-area">
                                <div className="menu">
                                    <ul className={`lab-ul ${menuToggle ? "active" : ""}`}>
                                        {/* Home */}
                                        <li>
                                            <NavLink
                                                to="/"
                                                className={({ isActive }) =>
                                                    isActive ? "active-link" : ""
                                                }
                                            >
                                                <i className="icofont-home"></i> Home
                                            </NavLink>
                                        </li>

                                        {/* Practice */}
                                        <li
                                            className={`menu-item-has-children ${
                                                ["/challenges", "/companies", "/jobs"].includes(currentPath)
                                                    ? "active-parent"
                                                    : ""
                                            }`}
                                        >
                                            <a href="#">
                                                <i className="icofont-code"></i> Practice
                                            </a>
                                            <ul className="lab-ul dropdown-menu">
                                                <li>
                                                    <NavLink
                                                        to="/challenges"
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-puzzle"></i> Coding Challenges
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        to="/companies"
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-building"></i> Company Challenges
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        to="/jobs"
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-briefcase"></i> Job Listings
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </li>

                                        {/* Learn */}
                                        <li
                                            className={`menu-item-has-children ${
                                                ["/course"].includes(currentPath)
                                                    ? "active-parent"
                                                    : ""
                                            }`}
                                        >
                                            <a href="#">
                                                <i className="icofont-book-alt"></i> Learn
                                            </a>
                                            <ul className="lab-ul dropdown-menu">
                                                <li>
                                                    <NavLink
                                                        to="/course"
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-read-book"></i> All Courses
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </li>

                                        {/* Progress */}
                                        <li
                                            className={`menu-item-has-children ${
                                                ["/profile", "/leaderboard"].includes(currentPath)
                                                    ? "active-parent"
                                                    : ""
                                            }`}
                                        >
                                            <a href="#">
                                                <i className="icofont-trophy"></i> Progress
                                            </a>
                                            <ul className="lab-ul dropdown-menu">
                                                <li>
                                                    <NavLink
                                                        to="/profile"
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-user-alt-3"></i> My Profile
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        to="/leaderboard"
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-trophy-alt"></i> Leaderboard
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </li>

                                        {/* Pages */}
                                        <li
                                            className={`menu-item-has-children ${
                                                ["/about", "/team", "/instructor", "/contact"].includes(currentPath)
                                                    ? "active-parent"
                                                    : ""
                                            }`}
                                        >
                                            <a href="#">Pages</a>
                                            <ul className="lab-ul dropdown-menu">
                                                <li>
                                                    <NavLink
                                                        to="/about"
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-info-circle"></i> About
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        to="/team"
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-users-social"></i> Team
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        to="/instructor"
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-teacher"></i> Instructor
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        to="/contact"
                                                        className={({ isActive }) =>
                                                            isActive ? "active-link" : ""
                                                        }
                                                    >
                                                        <i className="icofont-phone"></i> Contact
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>

                                {/* Auth Section */}
                                <div className="auth-section d-flex align-items-center gap-2">
                                    {user ? (
                                        <Link
                                            to="#"
                                            className="logout-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleLogout();
                                            }}
                                            title="Logout"
                                        >
                                            <i className="icofont-logout"></i>
                                            <span className="d-none d-md-inline ms-1">LOGOUT</span>
                                        </Link>
                                    ) : (
                                        <>
                                            <Link to="/login" className="login">
                                                <i className="icofont-user"></i>
                                                <span className="d-none d-md-inline ms-1">LOG IN</span>
                                            </Link>
                                            <Link to="/signup" className="signup">
                                                <i className="icofont-users"></i>
                                                <span className="d-none d-md-inline ms-1">SIGN UP</span>
                                            </Link>
                                        </>
                                    )}
                                </div>

                                {/* Mobile Menu Toggle */}
                                <div
                                    className={`header-bar d-lg-none ${menuToggle ? "active" : ""}`}
                                    onClick={() => setMenuToggle(!menuToggle)}
                                >
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>

                                {/* Mobile Social Toggle */}
                                <div
                                    className="ellepsis-bar d-lg-none"
                                    onClick={() => setSocialToggle(!socialToggle)}
                                >
                                    <i className="icofont-info-square"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
