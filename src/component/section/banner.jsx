import Typewriter from "typewriter-effect";

const Banner = () => {
    return (
        <section 
            className="banner-section py-5"
            style={{ 
                background: "#f8f8f8",
                fontFamily: "Satoshi, Verdana, sans-serif"
            }}
        >
            <div className="container">
                <div 
                    className="text-center mx-auto"
                    style={{ 
                        maxWidth: "1440px",
                        marginTop: "80px",
                        padding: "0 16px"
                    }}
                >

                    {/* Responsive Title */}
                    <h1
                        style={{
                            fontSize: "clamp(32px, 6vw, 80px)",   // responsive
                            lineHeight: "1.2",
                            color: "#0c0c0d",
                            fontWeight: "100",
                            fontFamily: "Satoshi, Verdana, sans-serif",
                            marginBottom: "10px"
                        }}
                    >
                        <span
                            style={{
                                display: "inline-flex",
                                whiteSpace: "nowrap",
                                alignItems: "center"
                            }}
                        >
                            <span style={{ color: "#1d61bf" }}>
                                <Typewriter
                                    options={{
                                        // strings: ["Upskill", "Become", "Hire"],
                                        strings: ["Learn", "Build", "Grow"],
                                        autoStart: true,
                                        loop: true,
                                        delay: 80,
                                        deleteSpeed: 50,
                                        cursor: "",
                                    }}
                                />
                            </span>
                            <span style={{ marginLeft: "10px" }}>Your</span>
                        </span>
                        <br />
                        Developer Journey
                    </h1>

                    {/* Responsive Description */}
                    <p 
                        className="mt-4"
                        style={{
                            fontSize: "clamp(14px, 2vw, 20px)",
                            color: "#6c6c6c",
                            maxWidth: "700px",
                            margin: "20px auto 40px auto",
                            lineHeight: "1.6",
                        }}
                    >
                        Empowering learners with industry-ready skills and guiding them to become confident, future-ready developers.
                    </p>

                    {/* Buttons */}
                    <div 
                        className="d-flex flex-wrap justify-content-center gap-3"
                        style={{ marginBottom: "60px" }}
                    >
                        <a 
                            href="#" 
                            className="btn px-4 py-2"
                            style={{
                                background: "#1d61bf",
                                color: "#fff",
                                fontSize: "clamp(14px, 1.6vw, 18px)",
                                borderRadius: "8px",
                                fontWeight: "400"
                            }}
                        >
                            Get Started Now
                        </a>

                        {/* <a 
                            href="#" 
                            className="btn px-4 py-2"
                            style={{
                                background: "#fff",
                                color: "#000",
                                fontSize: "clamp(14px, 1.6vw, 18px)",
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                fontWeight: "400"
                            }}
                        >
                            For developers
                        </a> */}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Banner;
