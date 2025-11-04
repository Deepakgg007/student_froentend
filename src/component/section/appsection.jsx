import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const btnText = "Sign up for Free";
const title = "Learn Anytime, Anywhere";
const desc =
  "Take courses on your any device with our app & learn all time what you want. Just download & install & start to learn";

const AppSection = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for login token or user info
    const token = localStorage.getItem("student_access_token");
    const user = localStorage.getItem("student_user");

    if (token && user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    // Listen to storage changes (helps when login/logout happens)
    const handleStorageChange = () => {
      const updatedToken = localStorage.getItem("student_access_token");
      const updatedUser = localStorage.getItem("student_user");
      setIsLoggedIn(updatedToken && updatedUser ? true : false);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // If logged in → don't show AppSection
  if (isLoggedIn) return null;

  return (
    <div className="app-section padding-tb">
      <div className="container">
        <div className="section-header text-center">
          <Link to="/signup" className="lab-btn mb-4">
            <span>{btnText}</span>
          </Link>
          <h2 className="title">{title}</h2>
          <p>{desc}</p>
        </div>
      </div>
    </div>
  );
};

export default AppSection;
