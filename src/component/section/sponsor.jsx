//sponser.jsx

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";
import "swiper/css";
import api from "../../services/api";

const Sponsor = () => {
  const [colleges, setColleges] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('student_access_token');
    setIsLoggedIn(!!token);

    // Only fetch colleges if user is NOT logged in
    if (!token) {
      const fetchColleges = async () => {
        try {
          const response = await api.get("/colleges/");

          // ✅ Extract data from results
          const data = response.data.results || response.data || [];
          setColleges(data);
        } catch (error) {
          console.error("Error fetching college logos:", error);
        }
      };

      fetchColleges();
    }
  }, []);

  // Don't render if user is logged in
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="sponsor-section section-bg py-5">
      <div className="container">
        <div className="section-wrapper">
            <Swiper
              spaceBetween={20}
              loop={colleges.length > 5}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              modules={[Autoplay]}
              breakpoints={{
                0: { slidesPerView: 2, spaceBetween: 15 },
                576: { slidesPerView: 3, spaceBetween: 20 },
                768: { slidesPerView: 4, spaceBetween: 25 },
                1024: { slidesPerView: 5, spaceBetween: 30 },
              }}
            >
              {colleges.length > 0 ? (
                colleges.map((college, index) => {
                  const imageUrl =
                    college.logo ||
                    college.image ||
                    college.logo_url ||
                    "";

                  return (
                    <SwiperSlide key={college.id || index}>
                      <div
                        className="sponsor-item d-flex justify-content-center align-items-center"
                        style={{
                          backgroundColor: "#f8f8f8", // light gray background
                          borderRadius: "12px",
                          padding: "15px",
                          transition: "transform 0.3s ease, box-shadow 0.3s ease"
                        }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={college.name || "College"}
                            title={college.name || ""}
                            style={{
                              width: "100%",
                              height: "120px",
                              objectFit: "contain",
                              borderRadius: "8px",
                              background: "#fff",
                              padding: "10px",
                              border: "1px solid #ddd", // thin inner border
                              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            }}
                          />
                        ) : (
                          <div
                            className="bg-light d-flex justify-content-center align-items-center rounded"
                            style={{
                              width: "100%",
                              maxWidth: "120px",
                              height: "80px",
                            }}
                          >
                            <i className="fas fa-university text-muted fa-2x"></i>
                          </div>
                        )}
                      </div>
                    </SwiperSlide>
                  );
                })
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="fas fa-spinner fa-spin me-2"></i> Loading colleges...
                </div>
              )}
            </Swiper>
        </div>
      </div>
    </div>
  );
};

export default Sponsor;
