import { Link, useLocation } from "react-router-dom";

const Footer = () => {
    const location = useLocation();
    const isAuthPage =
        location.pathname === "/login" ||
        location.pathname === "/signup" ||
        location.pathname === "/forgetpass";

    const linkStyle = { color: "#fff" }; // <-- Uniform white color for all links

    return (
        <div className="news-footer-wrap">

            {!isAuthPage && (
                <div className="footer-top padding-tb pt-0">
                    <div className="container">
                        <div className="row g-4 d-flex align-items-start">

                            {/* LEFT SIDE - 40% */}
                            <div className="col-lg-5 col-md-12">
                                <div className="footer-item">
                                    <div className="footer-inner">
                                        <div className="footer-content">

                                            {/* Add your LOGO */}
                                            <div className="mb-3">
                                                <img
                                                    src="/assets/images/z1logo.png"
                                                    alt="Z1 Logo"
                                                    style={{ width: "160px" }}
                                                />
                                            </div>

                                            {/* Short about text */}
                                            <p style={{ color: "#fff", fontSize: "15px", lineHeight: "1.6" }}>
                                                Z1   Empowers students and developers with structured learning,
                                                real-world challenges, jobs, and achievements — all in one
                                                platform.
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT SIDE - 60% */}
                            <div className="col-lg-7 col-md-12">
                                <div className="row g-4">

                                    {/* Quick Links */}
                                    <div className="col-sm-6">
                                        <div className="footer-item">
                                            <div className="footer-inner">
                                                <div className="footer-content">
                                                    <div className="title"><h4 style={{ color: "#fff" }}>Quick Links</h4></div>
                                                    <ul className="lab-ul">
                                                        <li><Link to="/course" style={linkStyle}>Courses</Link></li>
                                                        <li><Link to="/challenges" style={linkStyle}>Challenges</Link></li>
                                                        <li><Link to="/jobs" style={linkStyle}>Jobs</Link></li>
                                                        <li><Link to="/leaderboard" style={linkStyle}>Leaderboard</Link></li>
                                                        <li><Link to="/companies" style={linkStyle}>Companies</Link></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Student Resources */}
                                    <div className="col-sm-6">
                                        <div className="footer-item">
                                            <div className="footer-inner">
                                                <div className="footer-content">
                                                    <div className="title"><h4 style={{ color: "#fff" }}>Student Resources</h4></div>
                                                    <ul className="lab-ul">
                                                        <li><Link to="/profile/learning" style={linkStyle}>My Learning</Link></li>
                                                        <li><Link to="/profile" style={linkStyle}>My Profile</Link></li>
                                                        <li><Link to="/profile/certificates" style={linkStyle}>Certificates</Link></li>
                                                        <li><Link to="/profile/achievements" style={linkStyle}>Achievements</Link></li>
                                                        <li><Link to="/profile/saved" style={linkStyle}>Saved Courses</Link></li>
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

            {/* Always show bottom bar */} 
            <div className="footer-bottom style-2 pt-2"> 
                <div className="container"> 
                    <div className="section-wrapper pt-1"> 
                        <p> &copy; 2025 <Link to="/">Z1</Link> Designed by{" "} 
                            <a href="#" target="_blank" rel="noreferrer">Haegl</a> 
                        </p> 
                    </div> 
                </div> 
            </div> 
        </div> 
    ); 
}; 

export default Footer;
