//sponser.jsx

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";
import "swiper/css";
import api from "../../services/api";

const Sponsor = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const response = await api.get("/companies"); // Adjust endpoint if needed
        console.log("Sponsor API response:", response.data);

        // ✅ Extract data from results
        const data = response.data.results || [];
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching sponsor logos:", error);
      }
    };

    fetchSponsors();
  }, []);

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
                          backgroundColor: "#f5f5f5", // light gray background
                          borderRadius: "12px",
                          padding: "20px",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.08)", // subtle outer shade
                          transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={company.name || "Company"}
                            title={company.name || ""}
                            style={{
                              width: "120px",
                              height: "80px",
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
                  <i className="fas fa-spinner fa-spin me-2"></i> Loading sponsor logos...
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