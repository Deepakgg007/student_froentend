import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";
import "swiper/css";
import api from "../../services/api";

const Sponsor = () => {
  const [companies, setCompanies] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 🟠 Check if user is logged in (same as InstructorTwo)
  useEffect(() => {
    const checkUser = async () => {
      try {
        const cachedUser = localStorage.getItem("student_user");

        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setLoadingUser(false);
          return;
        }

        const token =
          localStorage.getItem("student_access_token") ||
          localStorage.getItem("token");

        if (!token) {
          setUser(null);
          setLoadingUser(false);
          return;
        }

        const response = await api.get("/auth/me");
        const userData = response.data.data || response.data.user || response.data;

        setUser(userData);
        localStorage.setItem("student_user", JSON.stringify(userData));
      } catch (err) {
        setUser(null);
        localStorage.removeItem("student_user");
      } finally {
        setLoadingUser(false);
      }
    };

    checkUser();
  }, []);

  // 🟢 Fetch sponsor logos (colleges)
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        // Try colleges endpoint first, fallback to companies
        let response;
        try {
          response = await api.get("/colleges");
        } catch {
          response = await api.get("/companies");
        }

        const data = response.data.results || response.data.data || response.data || [];
        // Ensure we have an array
        const collegelist = Array.isArray(data) ? data : [];
        setCompanies(collegelist);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
        setCompanies([]); // Set empty array on error
      }
    };

    fetchSponsors();
  }, []);

  // 🟣 Do not flash this section while checking login status
  if (loadingUser) return null;

  // 🔴 Hide sponsor section if user is logged in
  if (user) return null;

  // 🟢 User NOT logged in → show sponsor section
  return (
    <div className="sponsor-section section-bg py-5">
      <div className="container">
        <div className="section-header text-center mb-5">
          <h2 style={{ fontSize: "50px", fontWeight: "bold", color: "#333", marginBottom: "10px" }}>
            Our Clients
          </h2>
          <p style={{ fontSize: "20px", color: "#666" }}>
            Trusted by leading educational institutions
          </p>
        </div>
        <div className="section-wrapper">
          <div className="sponsor-slider">
            <Swiper
              spaceBetween={30}
              slidesPerView={2}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              modules={[Autoplay]}
              breakpoints={{
                0: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
              }}
            >
              {companies.length > 0 ? (
                companies.map((company, index) => {
                  // Handle multiple logo field names (colleges vs companies)
                  let imageUrl =
                    company.logo ||
                    company.image ||
                    company.logo_url ||
                    company.logoUrl ||
                    company.college_logo ||
                    company.company_logo ||
                    "";

                  // If URL is relative, prepend API base URL
                  if (imageUrl && !imageUrl.startsWith("http")) {
                    imageUrl = `http://16.16.76.74:8000${imageUrl}`;
                  }

                  const displayName = company.name || company.college_name || "Organization";

                  return (
                    <SwiperSlide key={index}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={displayName}
                          style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "contain",
                            transition: "transform 0.3s ease",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          className="d-flex justify-content-center align-items-center"
                          style={{
                            width: "100%",
                            height: "100px",
                          }}
                        >
                          <i className="fas fa-building text-muted fa-2x"></i>
                        </div>
                      )}
                    </SwiperSlide>
                  );
                })
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="fas fa-spinner fa-spin me-2"></i> Loading sponsors...
                </div>
              )}
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sponsor;
