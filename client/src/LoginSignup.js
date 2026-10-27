import React, {useState} from "react";
import { FaArrowLeft, FaBuilding, FaUserTie, FaEye, FaEyeSlash } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
import  "./App.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

//loginsignup ab props nhi lega, ye state ko useLocation se padega 
function LoginSignup(props){
    const { onBack, onLoginSuccess } = props; // onBack को props से निकाला
 //activeTab kebal 'login' ke liye use hoga, 'signup' per click krte hi Navigation start ho jayega 
    const [activeTab,setActiveTab] = useState("login");
    const location = useLocation();
    const navigate = useNavigate();

    const [successMessage, setSuccessMessage] = useState("");

 // userType ko state se nikalna 
 // default: 'chef' set kiya gya hai, lakin LandingPage se bheji gyi value phele apply hogi 
    const userTypeFromState = location.state?.userType || 'chef'

// Form State 
    const [loginForm, setLoginForm] = useState({
        identifier: "",
        password: "",
    });


    const [showPassword, setShowPassword] = useState(false);
    // const [showconfirmPassword, setShowConfirmPassword ] = useState(false);
    const [error, setError] = useState("");

// Back button functionality 
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/')
        }
    };


//  userTypeConfig ko userTypeFromState ke saat use kruga 
    const userTypeConfig = {
        owner: {
            title: "Bakery Owner",
            desc: "Discover and connect with talented bakery professionals",
            color: "#2d7dff",
            icon: <FaBuilding size={28} color="#fff"/>,
    // App.js route use kiya yha ab signup click going OwnerInformation page: /ownerinfo (OwnerInformation)
            signupPath: "/ownerinfo",
        },

        chef: {
            title: "Bakery Chef",
            desc: "Connect with bakery owners and showcase your expertise",
            color: "#ff7d47",
            icon: <FaUserTie size={28} color="#fff" />,
    // App.js route use kiya yha ab signup click going BasicInformation page: /basicinfo (BasicInformation)
            signupPath: "/basicinfo",
        },
    };

    const config = userTypeConfig[userTypeFromState];

    // ---------------- LOGIN SUBMIT ---------------
    // Identifier Logic->hum input field ka naam Email se badalker Email or Phone kr dege 
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginForm.identifier || !loginForm.password) {
            return setError("Please fill all fields");
        }
        setError("");
        setSuccessMessage("");

        try{
            // बैकएंड को डेटा भेजें
            const response = await fetch(`${API_BASE_URL}/api/chef/login`, {
             method: "POST",
             headers: {"Content-Type": "application/json"},
             body: JSON.stringify({
                identifier: loginForm.identifier,
                password: loginForm.password,
                // userTypeFromState ye btata hai ki user kis page per hai chef  ya owner 
                expectedRole: userTypeFromState // 'chef' ya 'owner' // jab me login kru to owner ke data se owner pe or chef ke data se chef per login 
             }),
         });

        const data = await response.json();
       if (response.ok) {
        // 1. Backend se mile user type ko pehchanein
        const userType = data.type; //Backend se 'chef' ya 'owner' aayega
        const userData = data.chef;//Hamara backend 'chef' key mein hi user bhej raha hai filhal
        // अगर लॉगिन सफल रहा
        setSuccessMessage(`Login Successful as ${userType}! Redirecting...`);
          
        const storageIdentifier = userData.phone || userData.email;
        // डेटा को LocalStorage(memory) में डाल दें ताकि रिफ्रेश वाली समस्या खत्म हो जाए
        // 2. LocalStorage mein data aur TYPE save karein
       localStorage.setItem("userPhone", storageIdentifier);
       localStorage.setItem("userType", userType); // Ye line zaroori hai

        // App.js की स्टेट अपडेट करने का काम यहाँ होगा (अगर आप Props यूज़ कर रहे हैं)
        // 3. App.js ki state ko user type ke saath update karein
        if (props.onLoginSuccess) {
        props.onLoginSuccess(userData, userType);
        }
        
        // 4. 🔥 REDIRECT LOGIC FIX: Type ke hisaab se redirect karein
        setTimeout(() => {
            if (userType === 'owner') {
                navigate('/ownerdashboard'); // Owner ke liye alag page
            } else {
            navigate('/chefdashboard'); // Chef ke liye purana page
            }
        }, 1500);
       } else {
        // अगर सर्वर ने एरर दी (जैसे Wrong Password)
        setError(data.message || "Login failed");
       }
      } catch (err) {
        // अगर नेटवर्क या सर्वर बंद होने की एरर है
        console.error("Login Error:", err);
        setError("Network error! Is your server running?");
      }
    };

    // ----------------  DIRECT SIGNUP NAVIGATION ---------------
    // Sign Up tab per click krte hi ye function aagle page per bhej dega  
    const handleSignupNavigation = () => {
        setError("");
        setSuccessMessage("");
        navigate(config.signupPath, { state: { userType: userTypeFromState } });
    };


    return (
        <div className="ls-container">

             {/* === HEADER === */}
             <div className="ls-header">
                 <button className="ls-back-btn" onClick={handleBack}>
                     <FaArrowLeft /> Back
                 </button>
             </div>

              {/* === MAIN CARD === */}
              <div className="ls-box">
                 {/* USER TYPE ICON */}
                 <div className="ls-user-type-icon" style={{background: config.color}}>
                    {config.icon}
                 </div>
                 <h2 className="ls-title">{config.title}</h2>
                 <p className="ls-desc">{config.desc}</p>

                 {/* TABS */}
                 <div className="ls-tabs">
                    <button className={activeTab === "login" ? "active" : ""}
                     onClick={()=> {
                        setActiveTab("login"); 
                        setError(""); 
                        setSuccessMessage("");}}>
                        Login
                    </button>

                    <button 
                    // important: Sign Up per click krte hi Navigation function ko call krta hai
                    onClick = {handleSignupNavigation}>
                        Sign Up
                    </button>
                 </div>

                 {/* ERROR / SUCCESS BOX */}
                 {error && <div className="ls-error">{error}</div>}
                 {successMessage && <div className="ls-success">{successMessage}</div>}
                 {/* ===== SIGN IN FORM ===== */}
                 {activeTab === "login" && (
                    <form className="ls-form" onSubmit={handleLogin}>
                        <label>Email or Phone Number</label>
                        <input
                        type="text" // 'email' की जगह 'text' करें ताकि फोन नंबर भी डल सके
                        placeholder="Enter your email or phone"
                         value= {loginForm.identifier || ""} // यहाँ || "" जोड़ें
                         onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value})}
                         />
                          <label>Password</label>     
                          <div className="ls-password-box">
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={loginForm.password || ""} // यहाँ || "" जोड़ें
                              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value})}
                              autoComplete="current-password"/>
                            <span onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>    
                        <button className="ls-submit-btn">Login</button>           
                    </form>
                 )}

                
              </div>

        </div>
    );
}

export default LoginSignup;