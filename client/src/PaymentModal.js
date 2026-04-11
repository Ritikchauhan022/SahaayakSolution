import React, {useState, useEffect} from "react";
import  "./App.css";
import {
  FaTimes,
  FaCreditCard,
  FaLock,
  FaStar,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaExclamationCircle,
} from "react-icons/fa";
import { getAvatarColor } from "./AvatarColor";
import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CONTACT_UNLOCK_AMOUNT = "₹500.00";

const PaymentModal = ({professional, onClose, onPaymentSuccess}) => {
    const [paymentStep, setPaymentStep] = useState("details"); // details | processing | success | error
    const [error, setError] = useState(null);

// 1. Razorpay ka script clean load karne ke liye
useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: Jab modal band ho, toh script hata do taaki requests band ho jayein
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      // Check karein ki script hai aur uska parent 'body' hi hai
      if (existingScript && existingScript.parentNode === document.body) {
        document.body.removeChild(existingScript);
      }
      };
 }, []);

// --- ASLI RAZORPAY LOGIC START ---
const handlePayment = async() => {
    // 🛑 MAINTENANCE ALERT START: Bas ye lines add kardo
    alert("Payments are currently under maintenance!");
    return; // Ye line niche wale kisi bhi code ko chalne nahi degi
    // 🛑 MAINTENANCE ALERT END
    const userData = JSON.parse(localStorage.getItem("user"));
    // Debugging ke liye pura userData print kiya mene 
    console.log("LocalStorage User Data:", userData);

    // Ye line ensure karegi ki ID mile, chahe wo 'data' ke andar ho ya seedha
    const currentOwnerId = userData?._id || userData?.data?._id || userData?.id;
    console.log("Owner ki ID ye rahi:", currentOwnerId);
    setError(null);
    setPaymentStep("processing");
    

 try {
    // 1. Backend se Order ID mangwana
   // Humne backend mein jo /api/payment/create-order banaya tha, use hit karenge
    const { data } = await axios.post(`${API_BASE_URL}/api/payment/create-order`, {
        amount: 500, // Amount fix hai
        chefId: professional._id // Kise unlock kar rahe hain
      });

  // 2. Razorpay ka Modal Setup karna
  const options = {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Yahan apni wali key paste karna (jo terminal mein mili thi)
    amount: data.amount,
    currency: data.currency,
    name: "Bakery Marketplace",
    description: `Unlock contact for ${professional.name}`,
    order_id: data.id, // Ye ID backend se aayi hai
    
    handler: async function (response) {
  // 1. Loader ko active rakho/karo
   setPaymentStep("processing");
 // 3. Payment verify karna (Jab user pay kar dega) 
    try {
     console.log("Payment Success! Verification shuru...");

     // 1. Phone number nikal lo safety ke liye
     const ownerPhone = userData?.phone || userData?.data?.phone;

     // 2. Backend ko hit karo (Ab hum ID aur Phone dono bhej rahe hain)
     const verifyRes = await axios.post(`${API_BASE_URL}/api/payment/verify`, { 
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        chefId: professional._id,
        // 🔥 YAHAN BADLAV HAI: 
       // Ensure karo ki professional._id exist karta hai
        chefId: professional._id || professional.id,
        ownerId: currentOwnerId, // Agar ID hai toh ye kaam karega
        ownerPhone: ownerPhone  // Agar ID missing hai toh phone kaam karega (Backup)  
     });

     console.log("Backend Response:", verifyRes.data);

    if (verifyRes.data.status === "success") {
        setPaymentStep("success");
        // 🔥 Backend se jo 'unlockedChefs' ki nayi list aayi hai,
        // use hum App.js ko bhej rahe hain taaki screen turant update ho jaye.
        const updatedList = verifyRes.data.unlockedChefs;
        console.log("Sending to App.js:", updatedList);

        // 💡 FIX: LocalStorage ko update karo taaki refresh pe data na ud jaye
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            // Agar data nested hai (userData.data), to wahan update karo
            if (userData.data) {
                userData.data.unlockedChefs = updatedList;
            } else {
                userData.unlockedChefs = updatedList;
            }
            localStorage.setItem("user", JSON.stringify(userData));
        }
        console.log("LocalStorage Updated with:", updatedList);

        setTimeout(() => {
            // App.js ke function ko updated list bhej do
           onPaymentSuccess(updatedList);
        }, 1500);
     }  else {
        // Agar backend bole ki signature galat hai
        setError("Payment verification failed on server");
        setPaymentStep("error");
     } 
   } catch (err) {
    console.error("Verify Request Error:", err);
    // AGAR REQUEST FAIL HO JAYE TO LOADER ROKO
    setError("Verification request failed");
    setPaymentStep("error");
    }
   },
   prefill: {
    // Agar userData mein name hai toh wo dikhao, nahi toh "Bakery Owner"
    name: userData?.name || "Bakery Owner",
    // Agar userData mein email hai toh wo dikhao, nahi toh default email
    email: userData?.email || "owner@example.com",
    },
    theme: { color: "#3399cc" },
    modal: {
        ondismiss: () => setPaymentStep("details"), // Agar user cancel karde
        escape: true,
        backdropclose: false
    }
};

const rzp = new window.Razorpay(options);
rzp.open();

} catch (err) {
    console.error("Payment Error:", err);
    setError(err.response?.data?.message || "Server error. Try again.");
    setPaymentStep("error");
 }
};
// --- ASLI RAZORPAY LOGIC END ---


// Ye logic mene ChefDashboard.js me bi add kr rkha haior ab yha per bhi 
const formattedSalary = professional.hourlyRate
? Number(String(professional.hourlyRate).replace(/[^0-9.-]+/g, "")).toLocaleString('en-IN')
: "TBD";

// 2. Initials nikalne ke liye function (Rupa Mosi -> RM)
const getInitials = (name) => {
    if (!name) return "C";
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
};

return (
    <div className="pm-overlay">
        <div className="pm-modal">
            <button className="pm-close" onClick={onClose}>
                <FaTimes size={18}/>
            </button>

           {paymentStep === "details" && (
            <>
            <h2 className="pm-title">Unlock Contact Details</h2>
            {/* Professional Card */}
            <div className="pm-card">
                <div className="pm-profile">
                    {professional.avatar ? (
                    <img
                       src={professional.avatar}
                       alt={professional.name}
                       className="pm-avatar"
                       onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    ) : null}

                    <div
                    className="pm-avatar-fallback"
                    style={{ display: professional.avatar ? 'none' : 'flex', backgroundColor: getAvatarColor(professional.name)
                        }}
                    >
                    {getInitials(professional.name)}
                        </div>
                    {/* Is div ko class di hai taaki alignment sahi rahe */}
                    <div className="pm-meta-info">
                        <h3>{professional.name}</h3>
                        <p className="pm-role-text">{professional.role}</p>

                        <div className="pm-stats-row">
                            <span className="pm-rating">
                                <FaStar size={12}/> {professional.rating}
                            </span>
                            <span>
                                <FaMapMarkerAlt size={12}/> {professional.location}
                            </span>
                            <span>
                                <FaRupeeSign size={12}/>{formattedSalary}/month
                            </span>
                        </div>
                    </div>
                </div>

                {/* Skills section ko profile ke niche rakho card ke andar hi */}
                <div className="pm-skills">
                    {professional.skills && professional.skills.map((skill, i) => (
                        <span key={i} className="pm-badge">{skill}</span>
                    ))}
                </div>
            </div>

            {/* Benefits */}
            <div className="pm-section">
                <h4>
                  <FaLock size={16}/> What you’ll get
                </h4>
                <ul>
                    <li>Direct phone number</li>
                    <li>Email address</li>
                    <li>Full profile access</li>
                    {/* <li>No platform fees</li> */}
                </ul>
            </div>

            {/* Price */}
            <div className="pm-price">
                <div className="pm-price-label">
                    <div className="pm-price-title">Contact Unlock Fee</div>
                    <div className="pm-price-subtitle">One-time payment</div>
                </div>
                <div className="pm-amount">{CONTACT_UNLOCK_AMOUNT}</div>
            </div>

            <div className="pm-actions">
                <button className="pm-btn primary" onClick={handlePayment}>
                    <FaCreditCard size={16} />
                    Pay {CONTACT_UNLOCK_AMOUNT} Now
                </button>
                <button className="pm-btn" onClick={onClose}>
                    Cancel
                </button>
            </div>
            </>
           )}

           {paymentStep === "processing" && (
            <div className="pm-center">
                <div className="pm-spinner"></div>
                <p className="pm-muted">Processing payment...</p>
            </div>
           )}

           {paymentStep === "success" && (
            <div className="pm-center">
                <div className="pm-success">✓</div>
                <h3>Payment Successful!</h3>
                <p className="pm-muted">
                    Contact details unlocked successfully.
                </p>
            </div>
           )}

           {paymentStep === "error" && (
            <div className="pm-center">
                <FaExclamationCircle size={40} className="pm-error-icon"/>
                <h3>Payment Failed</h3>
                <p className="pm-muted">
                    {error || "Something went wrong. Please try again."}
                </p>
                <button className="pm-btn primary" onClick={() => setPaymentStep("details")}>
                    Try Again
                </button>
            </div>
           )}
        </div>
    </div>
);
};

export default PaymentModal;