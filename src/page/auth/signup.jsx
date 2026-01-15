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
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    fetchColleges();

    // Load saved form data from localStorage on mount
    const savedFormData = localStorage.getItem('signup_form_data');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(prev => ({
          ...prev,
          ...parsedData,
          profile_picture: null, // Don't restore file
        }));
      } catch (err) {
        console.error('Failed to load saved form data:', err);
      }
    }
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

  // Validate individual field
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "first_name":
      case "last_name":
        if (!value.trim()) {
          error = `${name === "first_name" ? "First" : "Last"} name is required.`;
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email is required.";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = "Please enter a valid email address.";
          }
        }
        break;

      case "phone_number":
        if (!value.trim()) {
          error = "Phone number is required.";
        } else {
          const phoneRegex = /^[6-9]\d{9}$/;
          if (!phoneRegex.test(value)) {
            error = "Phone must be 10 digits starting with 6, 7, 8, or 9.";
          }
        }
        break;

      case "usn":
        if (!value.trim()) {
          error = "USN is required.";
        } else {
          const usnRegex = /^[A-Za-z0-9]+$/;
          if (!usnRegex.test(value)) {
            error = "USN should contain only letters and numbers.";
          }
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required.";
        } else {
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
          if (!passwordRegex.test(value)) {
            error = "Password: 8+ chars, uppercase, lowercase, number, special char.";
          }
        }
        break;

      case "password2":
        if (!value) {
          error = "Please confirm your password.";
        } else if (value !== formData.password) {
          error = "Passwords do not match.";
        }
        break;

      case "date_of_birth":
        if (!value) {
          error = "Date of birth is required.";
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset time to compare only dates

          if (selectedDate >= today) {
            error = "Date of birth cannot be today or in the future.";
          }

          // Optional: Check if age is reasonable (e.g., at least 10 years old)
          const minDate = new Date();
          minDate.setFullYear(minDate.getFullYear() - 10);
          if (selectedDate > minDate) {
            error = "You must be at least 10 years old.";
          }
        }
        break;

      case "college":
        if (!value) {
          error = "Please select your college.";
        }
        break;

      case "college_name":
        if (formData.college === "other" && !value.trim()) {
          error = "Please enter your college name.";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
  const { name, value, type, files } = e.target;

  if (type === "file") {
    const file = files[0];

    // Validate profile picture immediately
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setFieldErrors(prev => ({ ...prev, profile_picture: "Profile picture must be JPG, JPEG, or PNG format." }));
        return;
      }

      if (file.size > maxSize) {
        setFieldErrors(prev => ({ ...prev, profile_picture: "Profile picture must be less than 5MB." }));
        return;
      }

      // Clear error if valid
      setFieldErrors(prev => ({ ...prev, profile_picture: "" }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  } else {
    // Restrict only letters for first_name and last_name
    if ((name === "first_name" || name === "last_name") && /[^a-zA-Z]/.test(value)) {
      return; // ignore non-letter input
    }

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedFormData);

    // Validate field in real-time if already touched
    if (touchedFields[name]) {
      const error = validateField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }

    // Save to localStorage (exclude profile_picture file object)
    const dataToSave = {
      ...updatedFormData,
      profile_picture: null,
    };
    localStorage.setItem('signup_form_data', JSON.stringify(dataToSave));
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone_number)) {
      setError("Phone number must be 10 digits and start with 6, 7, 8, or 9.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password: 8+ chars, uppercase, lowercase, number, special char."
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    if (password !== password2) {
      setError("Passwords do not match.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    const usnRegex = /^[A-Za-z0-9]+$/;
    if (!usnRegex.test(usn)) {
      setError("USN should contain only letters and numbers.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    if (!college) {
      setError("Please select your college.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    if (college === "other" && !college_name.trim()) {
      setError("Please enter your college name if 'Other' is selected.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate profile picture first
    if (!formData.profile_picture) {
      setError("Please upload your profile picture.");
      // Scroll to error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!validateForm()) {
      // Scroll to error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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

      // Add profile picture (already validated)
      formDataWithFile.append("profile_picture", formData.profile_picture);

      await api.post("/auth/register/", formDataWithFile, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(
        "Registration successful! Please check your email to verify your account."
      );

      // Clear saved form data on successful registration
      localStorage.removeItem('signup_form_data');

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.response?.data) {
        const errorData = err.response.data;

        // Handle field-specific backend errors
        if (typeof errorData === "object" && !errorData.message) {
          const backendFieldErrors = {};
          let hasFieldErrors = false;

          Object.entries(errorData).forEach(([key, value]) => {
            const errorMessage = Array.isArray(value) ? value.join(", ") : value;

            // Map backend field names to frontend field names
            const fieldMapping = {
              username: "email",
              email: "email",
              password: "password",
              password2: "password2",
              first_name: "first_name",
              last_name: "last_name",
              phone_number: "phone_number",
              usn: "usn",
              college: "college",
              college_name: "college_name",
              profile_picture: "profile_picture"
            };

            const mappedField = fieldMapping[key] || key;

            if (mappedField in formData || mappedField === "profile_picture") {
              backendFieldErrors[mappedField] = errorMessage;
              hasFieldErrors = true;
            }
          });

          if (hasFieldErrors) {
            setFieldErrors(prev => ({ ...prev, ...backendFieldErrors }));
            setError("Please fix the errors below.");
          } else {
            // General error
            const errorMessages = Object.entries(errorData)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
              .join("\n");
            setError(errorMessages);
          }
        } else {
          setError(errorData.message || "Registration failed.");
        }
      } else {
        setError("Registration failed. Please try again.");
      }

      // Scroll to error
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                { label: "First Name", name: "first_name", type: "text", required: true, placeholder: "Enter your first name", maxLength: 50 },
                { label: "Last Name", name: "last_name", type: "text", required: true, placeholder: "Enter your last name", maxLength: 50 },
                { label: "Email", name: "email", type: "email", required: true, placeholder: "Enter your email", maxLength: 254 },
                { label: "Phone Number", name: "phone_number", type: "tel", required: true, placeholder: "Enter 10-digit number", maxLength: 10 },
                { label: "Date of Birth", name: "date_of_birth", type: "date", required: true, placeholder: "dd-mm-yyyy", max: new Date().toISOString().split('T')[0] },
                { label: "USN", name: "usn", type: "text", required: true, placeholder: "Enter your USN", maxLength: 20 },
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
                      onBlur={handleBlur}
                      placeholder={field.placeholder}
                      required={field.required}
                      maxLength={field.maxLength}
                      max={field.max}
                      className={`text-input ${fieldErrors[field.name] ? 'is-invalid' : ''}`}
                    />
                    {fieldErrors[field.name] && (
                      <div className="invalid-feedback" style={{ display: 'block' }}>
                        {fieldErrors[field.name]}
                      </div>
                    )}
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
                      onBlur={handleBlur}
                      required
                      className={`text-input ${fieldErrors.college ? 'is-invalid' : ''}`}
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
                  {fieldErrors.college && (
                    <div className="invalid-feedback" style={{ display: 'block' }}>
                      {fieldErrors.college}
                    </div>
                  )}
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
                      onBlur={handleBlur}
                      placeholder="Enter your college name"
                      required
                      maxLength={200}
                      className={`text-input ${fieldErrors.college_name ? 'is-invalid' : ''}`}
                    />
                    {fieldErrors.college_name && (
                      <div className="invalid-feedback" style={{ display: 'block' }}>
                        {fieldErrors.college_name}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Profile Picture Upload */}
              <div className="form-row">
                <label className="form-label">
  Profile Picture <span className="required">*</span>
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
                  {fieldErrors.profile_picture && (
                    <div className="invalid-feedback" style={{ display: 'block' }}>
                      {fieldErrors.profile_picture}
                    </div>
                  )}
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
                      onBlur={handleBlur}
                      placeholder="Enter password"
                      required
                      maxLength={128}
                      className={`text-input input-with-icon ${fieldErrors.password ? 'is-invalid' : ''}`}
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
                  {fieldErrors.password && (
                    <div className="invalid-feedback" style={{ display: 'block' }}>
                      {fieldErrors.password}
                    </div>
                  )}
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
                    onBlur={handleBlur}
                    placeholder="Re-enter password"
                    required
                    maxLength={128}
                    className={`text-input ${fieldErrors.password2 ? 'is-invalid' : ''}`}
                    aria-label="Confirm password"
                  />
                  {fieldErrors.password2 && (
                    <div className="invalid-feedback" style={{ display: 'block' }}>
                      {fieldErrors.password2}
                    </div>
                  )}
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
          min-height: 100vh;
          padding: 140px 20px 60px 20px;
          position: relative;
          overflow: hidden;
        }

        .login-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .account-wrapper {
          padding: 48px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          z-index: 1;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .title {
          font-size: 36px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 40px;
          letter-spacing: -1px;
          text-align: center;
          position: relative;
        }

        .title::after {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
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
          padding: 14px 18px;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          font-size: 15px;
          outline: none;
          background: #ffffff;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
          max-width: 100%;
          color: #2d3748;
        }

        .text-input::placeholder {
          color: #a0aec0;
        }

        .text-input:hover {
          border-color: #cbd5e0;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.08);
          transform: translateY(-1px);
        }

        .text-input:focus {
          border-color: #667eea;
          background: #ffffff;
          box-shadow:
            0 0 0 4px rgba(102, 126, 234, 0.1),
            0 8px 24px rgba(102, 126, 234, 0.15);
          transform: translateY(-2px);
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
          margin-top: 40px;
        }

        .lab-btn {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          padding: 16px 32px;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font-weight: 700;
          font-size: 17px;
          letter-spacing: 0.5px;
          box-shadow:
            0 10px 30px rgba(102, 126, 234, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.2) inset;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
        }

        .lab-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: left 0.6s ease;
        }

        .lab-btn:hover::before {
          left: 100%;
        }

        .lab-btn:hover {
          transform: translateY(-3px) scale(1.01);
          box-shadow:
            0 15px 40px rgba(102, 126, 234, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.3) inset;
        }

        .lab-btn:active {
          transform: translateY(-1px) scale(0.99);
        }

        .lab-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
        }

        /* Required star */
        .required { 
          color: #f56565; 
          margin-left: 4px;
          font-size: 16px;
        }

        /* Alert styles */
        .alert {
          padding: 18px 24px;
          border-radius: 14px;
          margin-bottom: 28px;
          font-size: 14px;
          line-height: 1.6;
          animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          font-weight: 500;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .alert-danger {
          background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
          color: #c53030;
          border: 2px solid #fc8181;
          box-shadow: 0 4px 12px rgba(252, 129, 129, 0.2);
        }

        .alert-success {
          background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
          color: #22543d;
          border: 2px solid #68d391;
          box-shadow: 0 4px 12px rgba(104, 211, 145, 0.2);
        }

        /* Field validation error styles */
        .text-input.is-invalid {
          border-color: #fc8181;
          background-color: #fff5f5;
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }

        .text-input.is-invalid:focus {
          border-color: #f56565;
          box-shadow:
            0 0 0 4px rgba(245, 101, 101, 0.15),
            0 4px 12px rgba(245, 101, 101, 0.2);
        }

        .invalid-feedback {
          color: #e53e3e;
          font-size: 13px;
          margin-top: 8px;
          display: flex;
          align-items: flex-start;
          line-height: 1.4;
          font-weight: 500;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .invalid-feedback::before {
          content: '⚠';
          margin-right: 8px;
          font-size: 15px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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
          padding: 24px;
          border: 3px dashed #cbd5e0;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
        }

        .file-input-label:hover {
          border-color: #667eea;
          border-style: dashed;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.2);
          transform: translateY(-2px);
        }

        .file-label-text {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          color: #667eea;
          font-size: 16px;
          letter-spacing: 0.3px;
        }

        .file-label-text::before {
          content: '📸';
          font-size: 24px;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .preview-image-container {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 14px;
          align-items: center;
        }

        .preview-image {
          width: 140px;
          height: 140px;
          border-radius: 16px;
          object-fit: cover;
          border: 4px solid #667eea;
          box-shadow:
            0 12px 24px rgba(102, 126, 234, 0.3),
            0 0 0 4px rgba(102, 126, 234, 0.1);
          animation: imageAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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
          padding: 10px 20px;
          background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:
            0 6px 16px rgba(245, 101, 101, 0.35),
            0 0 0 1px rgba(255, 255, 255, 0.2) inset;
          letter-spacing: 0.3px;
        }

        .remove-preview-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow:
            0 8px 20px rgba(245, 101, 101, 0.45),
            0 0 0 1px rgba(255, 255, 255, 0.3) inset;
        }

        .remove-preview-btn:active {
          transform: translateY(-1px) scale(0.98);
        }

        .optional {
          color: #a0aec0;
          font-size: 13px;
          font-weight: 500;
          margin-left: 4px;
        }

        /* CRITICAL: Responsive fixes for dropdown overflow */
        @media (max-width: 768px) {
          .login-section {
            padding: 100px 15px 40px 15px;
          }

          .account-wrapper {
            padding: 32px 24px;
            margin: 0 10px;
            width: calc(100% - 20px);
            border-radius: 20px;
          }

          .title {
            font-size: 28px;
            margin-bottom: 32px;
          }

          .title::after {
            width: 50px;
            height: 3px;
          }

          .form-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            margin-bottom: 18px;
          }

          .form-label {
            width: 100%;
            text-align: left;
            font-size: 14px;
          }

          .form-control-wrap {
            width: 100%;
          }

          .text-input {
            width: 100% !important;
            max-width: 100% !important;
            padding: 12px 16px;
            font-size: 14px;
          }

          /* Ensure select dropdown fits on mobile */
          select.text-input {
            width: 100% !important;
            max-width: 100% !important;
            padding-right: 40px;
          }

          .submit-row {
            margin-top: 32px;
          }

          .lab-btn {
            width: 100%;
            padding: 14px 24px;
            font-size: 16px;
          }

          .preview-image {
            width: 100px;
            height: 100px;
          }

          .file-input-label {
            padding: 20px;
          }
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