import { useState, useEffect } from "react";
import PublicHeader from "./public-header";
import AuthenticatedHeader from "./authenticated-header";

const Header = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("student_access_token") || localStorage.getItem("token");
        setIsAuthenticated(!!token);
        setLoading(false);
    }, []);

    // If still loading auth status, show public header by default
    if (loading) {
        return <PublicHeader />;
    }

    // Show authenticated header if user is logged in, otherwise show public header
    return isAuthenticated ? <AuthenticatedHeader /> : <PublicHeader />;
};

export default Header;
