import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const features = [
  {
    id: 1,
    title: "Course Certification",
    description: "Earn industry-recognized certificates that validate your skills and boost your career.",
    media: "/video/screen.mp4",
    type: "video",
  },
  {
    id: 2,
    title: "Company Specific Challenges",
    description: "Solve real-world problems from leading companies and showcase your skills to potential employers.",
    media: "/video/screen1.mp4",
    type: "video",
  },
  {
    id: 3,
    title: "Internships & Job Opportunities",
    description: "Connect with top companies and launch your career through exclusive internships and job placements.",
    media: "/video/screen2.mp4",
    type: "video",
  },
  {
    id: 4,
    title: "AI Mentor (sensAI)",
    description: "Get instant AI-powered guidance while coding.",
    media: "/video/screen3.mp4",
    type: "video",
  },
];

const FeatureSection = () => {
  const [active, setActive] = useState(features[0]);

  return (
    <div style={{ backgroundColor: "#f8f8f8", padding: "20px 0" }}>
      <div className="container">
        <h2
          style={{
            textAlign: "center",
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: "550",
            marginBottom: "40px",
            color: "#1b1b1d",
            marginTop: "40px",
          }}
        >
          Everything you need to build in one place
        </h2>

        <div className="row d-flex justify-content-center">

          {/* LEFT SIDE */}
          <div className="col-lg-4 col-md-12 mb-4">
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {features.map((item, index) => (
                <div key={item.id}>
                  <li
                    onClick={() => setActive(item)}
                    style={{
                      cursor: "pointer",
                      padding: "12px 0",
                      // marginLeft: "10px",
                      display: "flex",
                      flexDirection: "column",
                      transition: "0.3s",
                    }}
                  >
                    {/* Title + Bullet Row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          fontSize: "26px",
                          color: item.id === active.id ? "#1b1b1d" : "transparent",
                          transition: "0.3s",
                        }}
                      >
                        ●
                      </span>

                      <span
                        style={{
                          fontSize: item.id === active.id ? "24px" : "20px",
                          fontWeight: "700",
                          color: item.id === active.id ? "#1b1b1d" : "#6c6c6c",
                          transition: "0.3s",
                        }}
                      >
                        {item.title}
                      </span>
                    </div>

                    {/* EXPANDING DESCRIPTION */}
                    <div
                      style={{
                        maxHeight: item.id === active.id ? "200px" : "0",
                        overflow: "hidden",
                        opacity: item.id === active.id ? 1 : 0,
                        transition: "all 0.4s ease",
                        marginLeft: "38px",
                        color: "#4a4a4a",
                        fontSize: "16px",
                        lineHeight: "1.5",
                      }}
                    >
                      {item.description}
                    </div>
                  </li>

                  {/* Divider */}
                  {index < features.length - 1 && (
                    <hr
                      style={{
                        border: "0",
                        borderBottom: "1px solid #706c68ff",
                        margin: "0 0 0 20px",
                      }}
                    />
                  )}
                </div>
              ))}
            </ul>
          </div>

          {/* RIGHT SIDE MEDIA */}
          <div className="col-lg-6 col-md-12 d-flex justify-content-center">
  <div
    style={{
      padding: "15px",
      borderRadius: "12px",
      width: "100%",
      maxWidth: "650px",
    }}
  >
    <video
      src={active.media}
      autoPlay
      muted
      loop
      playsInline
      controls={false}
      controlsList="nodownload nofullscreen noremoteplayback"
      style={{
        width: "100%",
        height: "auto",
        aspectRatio: "16/9",
        borderRadius: "10px",
        background: "#000",
        pointerEvents: "none", // prevents clicking the video
      }}
    />
  </div>
</div>

          {/* CTA BUTTON */}
          {/* <div className="text-center">
            <Link
              to="/signup"
              style={{
                backgroundColor: "#f9d523ff",
                color: "Black",
                padding: "18px 40px",
                borderRadius: "8px",
                fontSize: "22px",
                fontWeight: "700",
                textDecoration: "none",
                display: "inline-block",
                marginTop: "40px",
                marginBottom: "40px",
              }}
            >
            Get Started →
          </Link>
        </div> */}

        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
