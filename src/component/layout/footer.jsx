import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Footer = () => {
    const location = useLocation();
    const isAuthPage =
        location.pathname === "/login" ||
        location.pathname === "/signup" ||
        location.pathname === "/forgetpass";

    // Hide footer on solve-challenge pages and company challenge pages
    const isSolveChallengePage =
        (location.pathname.includes("/challenge/") && !location.pathname.includes("/challenges")) ||
        location.pathname.includes("/challenges/") && location.pathname.includes("/solve");

    // Hide footer on course-view pages (quiz and course content)
    const isCourseViewPage = location.pathname.includes("/course-view/");

    // Hide footer on certification pages (quiz)
    const isCertificationPage = location.pathname.includes("/certification/");

    const [collegeData, setCollegeData] = useState(null);
    const [description, setDescription] = useState("");
    const [logo, setLogo] = useState("/assets/images/z1logo.png"); // default logo
    const linkStyle = { color: "#fff" };

    const { isAuthenticated } = useAuth();

    // Load authenticated college logo + fetch description
    useEffect(() => {
        const storedUser = localStorage.getItem("student_user");

        if (!storedUser) {
            // Reset to default when logged out
            setLogo("/assets/images/z1logo.png");
            setDescription("Z1 empowers students with structured learning, real-world challenges, jobs, and achievements — all in one platform.");
            setCollegeData(null);
            return;
        }

        try {
            const user = JSON.parse(storedUser);
            const college = user.college_details;

            if (college?.logo) {
                setLogo(
                    college.logo.startsWith("http")
                        ? college.logo
                        : `${API_BASE_URL}${college.logo}`
                );
            } else {
                setLogo("/assets/images/z1logo.png");
            }

            fetchCollegeDescription(college?.name);
        } catch (err) {
            console.error("Error loading college data:", err);
            // Reset to default on error
            setLogo("/assets/images/z1logo.png");
            setDescription("Z1 empowers students with structured learning, real-world challenges, jobs, and achievements — all in one platform.");
        }
    }, [isAuthenticated]); // Add isAuthenticated as dependency

    // Fetch description from public API
    const fetchCollegeDescription = async (collegeName) => {
        if (!collegeName) return;

        try {
            const response = await api.get("/colleges/");
            const list = response.data?.data || [];

            const matched = list.find(
                (c) => c.name.toLowerCase() === collegeName.toLowerCase()
            );

            if (matched) {
                setCollegeData(matched);
                setDescription(
                    matched.description?.trim()
                        ? matched.description
                        : "Welcome to our college. We provide quality education and continuous learning opportunities."
                );
            }
        } catch (error) {
            console.error("Error fetching description:", error);
        }
    };

    // Don't render footer at all on solve-challenge pages, course-view pages, or certification pages
    if (isSolveChallengePage || isCourseViewPage || isCertificationPage) {
        return null;
    }

    return (
        <div className="news-footer-wrap">

            {/* TOP FOOTER - HIDDEN ON AUTH PAGES */}
            {!isAuthPage && (
                <div className="footer-top padding-tb pt-0">
                    <div className="container">
                        <div className="row g-4 d-flex align-items-start">

                            {/* LEFT SIDE */}
                            <div className="col-lg-5 col-md-12">
                                <div className="footer-item">
                                    <div className="footer-inner">
                                        <div className="footer-content">

                                            {/* Dynamic Logo */}
                                            <div className="mb-3">
                                                 <img
                                                    src={logo}
                                                    alt="College Logo"
                                                    style={{ width: "160px", height: "auto" }}
                                                />
                                            </div>

                                            {/* Dynamic Description */}
                                            <p style={{ color: "#fff", fontSize: "15px", lineHeight: "1.6" }}>
                                                {description ||
                                                    "Z1 empowers students with structured learning, real-world challenges, jobs, and achievements — all in one platform."}
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT SIDE */}
                            <div className="col-lg-7 col-md-12">
                                <div className="row g-4">

                                    {/* Quick Links */}
                                    <div className="col-sm-6">
                                        <div className="footer-item">
                                            <div className="footer-inner">
                                                <div className="footer-content">
                                                    <div className="title">
                                                        <h4 style={{ color: "#fff" }}>Quick Links</h4>
                                                    </div>
                                                    <ul className="lab-ul">
                                                        <li><Link to="/course" style={linkStyle}>Courses</Link></li>
                                                        <li><Link to="/challenges" style={linkStyle}>Challenges</Link></li>
                                                        <li><Link to="/jobs" style={linkStyle}>Jobs</Link></li>
                                                        <li><Link to="/leaderboard" style={linkStyle}>Leaderboard</Link></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Support Links */}
                                    <div className="col-sm-6">
                                        <div className="footer-item">
                                            <div className="footer-inner">
                                                <div className="footer-content">
                                                    <div className="title">
                                                        <h4 style={{ color: "#fff" }}>Support</h4>
                                                    </div>
                                                    <ul className="lab-ul">
                                                        <li><Link to="/about" style={linkStyle}>About</Link></li>
                                                        <li><Link to="/contact" style={linkStyle}>Contact</Link></li>
                                                        <li><Link to="/privacy" style={linkStyle}>Privacy Policy</Link></li>
                                                        <li><Link to="/terms" style={linkStyle}>Terms of Service</Link></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* ✅ ALWAYS VISIBLE BOTTOM BAR */}
            <div className="footer-bottom style-2 pt-2">
                <div className="container">
                    <div className="section-wrapper pt-1 text-center">
                        <p>
                            &copy; 2025 <Link to="/">Z1</Link> Designed by{" "}
                            <a href="https://haegl.in/" target="_blank" rel="noreferrer">Haegl</a>
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Footer;