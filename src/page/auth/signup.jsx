import { Fragment, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const title = "Register Now";
const btnText = "Get Started Now";

/* Inline icons to avoid external dependency */
const EyeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const EyeOffIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.584 10.587a2 2 0 0 0 2.828 2.826" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.363 5.363a9.656 9.656 0 0 1 10.477 4.27 9.656 9.656 0 0 1-1.67 1.908" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    date_of_birth: "",
    usn: "",
    college: "",
    college_name: "",
    profile_picture: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await api.get("/colleges/");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || response.data.data || [];
      setColleges([...data, { id: "other", name: "Other" }]);
    } catch (err) {
      console.error("Failed to fetch colleges:", err);
      setColleges([{ id: "other", name: "Other" }]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Create preview image
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setError("");
  };

  const validateForm = () => {
    const {
      email,
      password,
      password2,
      first_name,
      last_name,
      phone_number,
      date_of_birth,
      usn,
      college,
      college_name,
    } = formData;

    if (
      !email ||
      !password ||
      !password2 ||
      !first_name ||
      !last_name ||
      !phone_number ||
      !date_of_birth ||
      !usn
    ) {
      setError("Please fill in all required fields.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone_number)) {
      setError("Phone number must be 10 digits and start with 6, 7, 8, or 9.");
      return false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return false;
    }

    if (password !== password2) {
      setError("Passwords do not match.");
      return false;
    }

    const usnRegex = /^[A-Za-z0-9]+$/;
    if (!usnRegex.test(usn)) {
      setError("USN should contain only letters and numbers.");
      return false;
    }

    if (!college) {
      setError("Please select your college.");
      return false;
    }

    if (college === "other" && !college_name.trim()) {
      setError("Please enter your college name if 'Other' is selected.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formDataWithFile = new FormData();
      formDataWithFile.append("username", formData.email); // Use email as username
      formDataWithFile.append("email", formData.email);
      formDataWithFile.append("password", formData.password);
      formDataWithFile.append("password2", formData.password2);
      formDataWithFile.append("first_name", formData.first_name);
      formDataWithFile.append("last_name", formData.last_name);
      formDataWithFile.append("phone_number", formData.phone_number);
      formDataWithFile.append("date_of_birth", formData.date_of_birth || "");
      formDataWithFile.append("usn", formData.usn);
      formDataWithFile.append(
        "college",
        formData.college !== "other" ? formData.college : ""
      );
      formDataWithFile.append(
        "college_name",
        formData.college === "other" ? formData.college_name : ""
      );

      // Add profile picture if selected
      if (formData.profile_picture) {
        formDataWithFile.append("profile_picture", formData.profile_picture);
      }

      await api.post("/auth/register/", formDataWithFile, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(
        "Registration successful! Please check your email to verify your account."
      );

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === "object") {
          const errorMessages = Object.entries(errorData)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
            )
            .join("\n");
          setError(errorMessages);
        } else {
          setError(errorData.message || "Registration failed.");
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <div className="login-section padding-tb section-bg">
        <div className="container">
          <div className="account-wrapper" style={{ maxWidth: 650, margin: "0 auto" }}>
            <h3 className="title text-center mb-4">{title}</h3>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error.split("\n").map((msg, idx) => (
                  <div key={idx}>{msg}</div>
                ))}
              </div>
            )}

            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}

            <form className="account-form" onSubmit={handleSubmit}>
              {/* Rows with left labels and inputs on right (responsive) */}
              {[
                { label: "First Name", name: "first_name", type: "text", required: true, placeholder: "Enter your first name" },
                { label: "Last Name", name: "last_name", type: "text", required: true, placeholder: "Enter your last name" },
                { label: "Email", name: "email", type: "email", required: true, placeholder: "Enter your email" },
                { label: "Phone Number", name: "phone_number", type: "tel", required: true, placeholder: "Enter 10-digit number" },
                { label: "Date of Birth", name: "date_of_birth", type: "date", required: true, placeholder: "dd-mm-yyyy" },
                { label: "USN", name: "usn", type: "text", required: true, placeholder: "Enter your USN" },
              ].map((field) => (
                <div key={field.name} className="form-row">
                  <label className="form-label">
                    {field.label} {field.required && <span className="required">*</span>}
                  </label>
                  <div className="form-control-wrap">
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="text-input"
                    />
                  </div>
                </div>
              ))}

              {/* College - FIXED DROPDOWN */}
              <div className="form-row">
                <label className="form-label">
                  College <span className="required">*</span>
                </label>
                <div className="form-control-wrap">
                  <div className="select-wrapper" style={{ position: 'relative' }}>
                    <select
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      required
                      className="text-input"
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">Select College</option>
                      {colleges.map((college) => (
                        <option key={college.id} value={college.id}>
                          {college.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* College name shown only for 'other' */}
              {formData.college === "other" && (
                <div className="form-row">
                  <label className="form-label">
                    Enter Your College Name <span className="required">*</span>
                  </label>
                  <div className="form-control-wrap">
                    <input
                      type="text"
                      name="college_name"
                      value={formData.college_name}
                      onChange={handleChange}
                      placeholder="Enter your college name"
                      required
                      className="text-input"
                    />
                  </div>
                </div>
              )}

              {/* Profile Picture Upload */}
              <div className="form-row">
                <label className="form-label">
                  Profile Picture <span className="optional">(Optional)</span>
                </label>
                <div className="form-control-wrap">
                  <div className="file-upload-wrapper">
                    <label className="file-input-label">
                      <input
                        type="file"
                        name="profile_picture"
                        onChange={handleChange}
                        accept="image/*"
                        className="file-input"
                      />
                      <span className="file-label-text">
                        {previewImage ? "Change Photo" : "Upload Photo"}
                      </span>
                    </label>
                    {previewImage && (
                      <div className="preview-image-container">
                        <img src={previewImage} alt="Profile preview" className="preview-image" />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null);
                            setFormData((prev) => ({
                              ...prev,
                              profile_picture: null,
                            }));
                          }}
                          className="remove-preview-btn"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Password with aligned eye */}
              <div className="form-row">
                <label className="form-label">
                  Password <span className="required">*</span>
                </label>
                <div className="form-control-wrap">
                  <div className="pw-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      required
                      className="text-input input-with-icon"
                      aria-label="Password"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((s) => !s)}
                      className="icon-btn"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm password (no eye) */}
              <div className="form-row">
                <label className="form-label">
                  Confirm Password <span className="required">*</span>
                </label>
                <div className="form-control-wrap">
                  <input
                    type="password"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                    className="text-input"
                    aria-label="Confirm password"
                  />
                </div>
              </div>

              <div className="form-row submit-row">
                <div />
                <div className="form-control-wrap">
                  <button type="submit" className="lab-btn" disabled={loading}>
                    <span>{loading ? "Registering..." : btnText}</span>
                  </button>
                </div>
              </div>
            </form>

            <div className="account-bottom text-center pt-3">
              <span className="d-block cate">
                Already have an account? <Link to="/login">Login</Link>
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Enhanced styles with modern design - FIXED DROPDOWN STYLES */}
      <style>{`
        /* Layout with gradient background */
        .login-section {
          background: #FFF9F1;
          min-height: 100vh;
          padding: 120px 20px 60px 20px;
        }
        
        .account-wrapper { 
          padding: 40px; 
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          border-radius: 20px; 
          box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5);
          animation: slideUp 0.5s ease-out;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .title {
          font-size: 32px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 30px;
          letter-spacing: -0.5px;
        }
        
        .form-row { 
          display: flex; 
          align-items: center; 
          gap: 24px; 
          margin-bottom: 20px;
          animation: fadeIn 0.6s ease-out backwards;
        }
        
        .form-row:nth-child(1) { animation-delay: 0.1s; }
        .form-row:nth-child(2) { animation-delay: 0.15s; }
        .form-row:nth-child(3) { animation-delay: 0.2s; }
        .form-row:nth-child(4) { animation-delay: 0.25s; }
        .form-row:nth-child(5) { animation-delay: 0.3s; }
        .form-row:nth-child(6) { animation-delay: 0.35s; }
        .form-row:nth-child(7) { animation-delay: 0.4s; }
        .form-row:nth-child(8) { animation-delay: 0.45s; }
        .form-row:nth-child(9) { animation-delay: 0.5s; }
        .form-row:nth-child(10) { animation-delay: 0.55s; }
        .form-row:nth-child(11) { animation-delay: 0.6s; }
        .form-row:nth-child(12) { animation-delay: 0.65s; }
        .form-row:nth-child(13) { animation-delay: 0.7s; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .form-label { 
          width: 220px; 
          text-align: left; 
          font-weight: 600; 
          padding-left: 4px;
          color: #1a202c;
          font-size: 15px;
        }
        
        .form-control-wrap { 
          flex: 1;
          min-width: 0; /* Important for preventing overflow */
        }

        /* Enhanced Inputs with gradient borders */
        .text-input { 
          width: 100%; 
          padding: 13px 16px; 
          border: 2px solid #e2e8f0;
          border-radius: 12px; 
          font-size: 15px; 
          outline: none;
          background: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Satoshi', Verdana, sans-serif;
          box-sizing: border-box; /* Important for width calculation */
          max-width: 100%; /* Prevent overflow */
        }
        
        .text-input:hover {
          border-color: #cbd5e0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        .text-input:focus { 
          border-color: transparent;
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(135deg, #667eea, #764ba2) border-box;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
          transform: translateY(-1px);
        }

        /* FIXED SELECT DROPDOWN STYLES */
        .select-wrapper {
          position: relative;
          width: 100%;
        }

        select.text-input {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23667eea' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 44px;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        /* Ensure dropdown options don't overflow */
        select.text-input option {
          max-width: 100%;
          word-wrap: break-word;
          white-space: normal;
          padding: 8px 12px;
        }

        /* Password wrapper + icon */
        .pw-wrapper { 
          position: relative; 
          display: flex; 
          align-items: center; 
        }
        
        .input-with-icon { 
          padding-right: 48px; 
        }
        
        .icon-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          padding: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #667eea;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        
        .icon-btn:hover { 
          background: rgba(102, 126, 234, 0.1);
          transform: translateY(-50%) scale(1.1);
        }
        
        .icon-btn:active {
          transform: translateY(-50%) scale(0.95);
        }

        /* Enhanced submit button */
        .submit-row { 
          margin-top: 30px; 
        }
        
        .lab-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          padding: 14px 32px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 16px;
          letter-spacing: 0.3px;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .lab-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
        }
        
        .lab-btn:hover::before {
          left: 100%;
        }
        
        .lab-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(102, 126, 234, 0.4);
        }
        
        .lab-btn:active {
          transform: translateY(0);
        }
        
        .lab-btn:disabled { 
          opacity: 0.6; 
          cursor: not-allowed;
          transform: none;
        }

        /* Required star */
        .required { 
          color: #f56565; 
          margin-left: 4px;
          font-size: 16px;
        }

        /* Alert styles */
        .alert {
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-size: 14px;
          line-height: 1.6;
          animation: slideDown 0.4s ease-out;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .alert-danger {
          background: linear-gradient(135deg, #fee 0%, #fdd 100%);
          color: #c53030;
          border: 2px solid #fc8181;
        }
        
        .alert-success {
          background: linear-gradient(135deg, #def7ec 0%, #bcf0da 100%);
          color: #22543d;
          border: 2px solid #68d391;
        }
        
        /* Account bottom link */
        .account-bottom {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 2px solid #e2e8f0;
        }
        
        .account-bottom .cate {
          color: #4a5568;
          font-size: 15px;
        }
        
        .account-bottom a {
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .account-bottom a::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transition: width 0.3s ease;
        }
        
        .account-bottom a:hover::after {
          width: 100%;
        }

        /* Profile Picture Upload Styles */
        .file-upload-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .file-input {
          display: none;
        }

        .file-input-label {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
        }

        .file-input-label:hover {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .file-label-text {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: #667eea;
          font-size: 15px;
          letter-spacing: 0.3px;
        }

        .file-label-text::before {
          content: '📸';
          font-size: 20px;
        }

        .preview-image-container {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }

        .preview-image {
          width: 120px;
          height: 120px;
          border-radius: 12px;
          object-fit: cover;
          border: 3px solid #e2e8f0;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          animation: imageAppear 0.3s ease-out;
        }

        @keyframes imageAppear {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .remove-preview-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(245, 101, 101, 0.3);
        }

        .remove-preview-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(245, 101, 101, 0.4);
        }

        .remove-preview-btn:active {
          transform: translateY(0);
        }

        .optional {
          color: #a0aec0;
          font-size: 13px;
          font-weight: 500;
          margin-left: 4px;
        }

        /* CRITICAL: Responsive fixes for dropdown overflow */
        @media (max-width: 700px) {
          .account-wrapper {
            padding: 28px 20px;
            margin: 20px;
            width: calc(100% - 40px);
            box-sizing: border-box;
          }

          .title {
            font-size: 26px;
          }

          .form-row {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .form-label {
            width: 100%;
            margin-bottom: 4px;
            text-align: left;
          }

          .form-control-wrap {
            width: 100%;
          }

          .text-input {
            width: 100% !important;
            max-width: 100% !important;
          }

          /* Ensure select dropdown fits on mobile */
          select.text-input {
            width: 100% !important;
            max-width: 100% !important;
          }

          .submit-row {
            display: flex;
            justify-content: center;
            flex-direction: column;
          }

          .lab-btn {
            width: 100%;
          }

          .file-input-label {
            padding: 16px;
          }

          .preview-image {
            width: 100px;
            height: 100px;
          }

          .file-label-text {
            font-size: 14px;
          }

          .file-label-text::before {
            font-size: 18px;
          }
        }

        /* Additional overflow protection */
        .container {
          overflow: visible !important;
        }
        
        .account-form {
          overflow: visible !important;
        }
        
        /* Smooth scrolling */
        * {
          scroll-behavior: smooth;
        }
      `}</style>
    </Fragment>
  );
};

export default SignupPage;