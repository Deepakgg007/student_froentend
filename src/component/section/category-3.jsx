import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    emoji: "🎯",
    title: "Foundation",
    description:
      "Master the fundamentals. From zero coding experience to building your first applications with confidence.",
  },
  {
    number: "02",
    emoji: "�",
    title: "Acceleration",
    description:
      "Level up your skills. Build advanced projects, learn modern technologies, and solve real-world challenges.",
  },
  {
    number: "03",
    emoji: "🏆",
    title: "Transformation",
    description:
      "Become job-ready. Create a portfolio that stands out and launch your career in the tech industry.",
  },
];

const CategoryThree = () => {
  return (
    <div
      style={{
        backgroundColor: "#f8f8f8", // soft cream background like ref
        paddingTop: "50px",
        paddingBottom: "90px",
      }}
    >
      <div className="container text-center">
        {/* Section Title */}
        <h2
          style={{
            fontSize: "clamp(26px, 4vw, 36px)",
            fontWeight: "700",
            color: "#1b1b1d",
            marginBottom: "10px",
          }}
        >
          Go from Zero to One in tech
        </h2>

        <p
          style={{
            fontSize: "clamp(16px, 2vw, 18px)",
            color: "#3f3f46",
            marginBottom: "80px",
            maxWidth: "700px",
            margin: "0 auto",
            opacity: "0.85",
            lineHeight: "1.6"
          }}
        >
          Master development fundamentals, build real-world applications, and launch your tech career from scratch.
        </p>


        <h3
          style={{
            fontSize: "clamp(22px, 3vw, 28px)",
            fontWeight: "700",
            marginTop: "20px",
            marginBottom: "40px",
            color: "#1b1b1d",
          }}
        >
          Here's how you can get started
        </h3>

        {/* Cards */}
        <div className="row g-4 justify-content-center">
          {steps.map((step, index) => (
            <div className="col-lg-4 col-md-6 col-sm-12" key={index} style={{ display: "flex", justifyContent: "center" }}>
              <div
  className="step-card"
  style={{
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0px 8px 20px rgba(0,0,0,0.08)",
    textAlign: "left",
    height: "280px",
    // width: "400px",
    transition: "all 0.3s ease",
  }}
>
                {/* Number badge */}
                <div
                  style={{
                    backgroundColor: "#ede3ff",
                    display: "inline-block",
                    padding: "8px 18px",
                    borderRadius: "10px",
                    marginBottom: "20px",
                  }}
                >
                  <strong style={{ color: "#6d3fc0" }}>{step.number}</strong>
                </div>

                {/* Title */}
                <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontWeight: "800",
                    marginBottom: "10px",
                    fontSize: "clamp(18px, 2vw, 22px)",
                    whiteSpace: "wrap",
                }}
                >
  <span>{step.emoji} {step.title}</span>
</div>

                {/* Description */}
                <p
                  style={{
                    fontSize: "clamp(16px, 2vw, 18px)",
                    color: "black",
                    lineHeight: "1.6",
                    marginBottom: 0
                  }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryThree;
