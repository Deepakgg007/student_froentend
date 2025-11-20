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

  // 🟢 Fetch sponsor logos
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await api.get("/companies");
        const data = response.data.results || [];
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
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
                  const imageUrl =
                    company.image ||
                    company.logo ||
                    company.logo_url ||
                    company.logoUrl ||
                    "";

                  return (
                    <SwiperSlide key={index}>
                      <div
                        className="sponsor-item d-flex justify-content-center align-items-center"
                        style={{
                          backgroundColor: "#f5f5f5",
                          borderRadius: "12px",
                          padding: "20px",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                          transition: "transform 0.3s ease",
                        }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={company.name || "Company"}
                            style={{
                              width: "120px",
                              height: "80px",
                              objectFit: "contain",
                              background: "#fff",
                              padding: "10px",
                              borderRadius: "8px",
                              border: "1px solid #ddd",
                            }}
                          />
                        ) : (
                          <div
                            className="bg-light rounded d-flex justify-content-center align-items-center"
                            style={{
                              width: "120px",
                              height: "80px",
                            }}
                          >
                            <i className="fas fa-building text-muted fa-2x"></i>
                          </div>
                        )}
                      </div>
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
