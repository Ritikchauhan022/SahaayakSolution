import React, {useState} from "react";
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

const CONTACT_UNLOCK_AMOUNT = "₹1.00";

const PaymentModal = ({professional, onClose, onPaymentSuccess}) => {
    const [paymentStep, setPaymentStep] = useState("details"); // details | processing | success | error
    const [error, setError] = useState(null);

    const handlePayment = async () => {
        setError(null);
        setPaymentStep("processing");

        try {
          const rawUser = JSON.parse(localStorage.getItem("user"));
          const userObj = rawUser?.data || rawUser || {};

          const currentOwnerId = userObj?._id || userObj?.id || "";
          const ownerName = userObj?.ownerName || userObj?.name || userObj?.fullName || "Bakery Owner";
          const ownerEmail = userObj?.email || "owner@sahaayaksolution.in";
          const ownerPhone = userObj?.phone || "";
          const chefId = professional?._id || professional?.id;

          if (!chefId) {
            setError("Professional ID missing. Please try again.");
            setPaymentStep("error");
            return;
          }

          // 1. Backend se PayU payment parameters & hash mangwana
          const { data } = await axios.post(`${API_BASE_URL}/api/payment/payu-init`, {
            amount: 1,
            chefId,
            ownerId: currentOwnerId,
            name: ownerName,
            email: ownerEmail,
            phone: ownerPhone,
          });

        const payuActionUrl = data.actionUrl || "https://secure.payu.in/_payment";

        // 2. Hidden form create karke PayU checkout page par redirect karna
        const form = document.createElement("form");
        form.method = "POST";
        form.action = payuActionUrl;
        form.style.display = "none";

        const payuFields = {
            key: data.key,
            txnid: data.txnid,
            amount: data.amount,
            productinfo: data.productinfo,
            firstname: data.firstname,
            email: data.email,
            phone: data.phone,
            surl: data.surl,
            furl: data.furl,
            hash: data.hash,
            udf1: data.udf1 || "",
            udf2: data.udf2 || "",
            udf3: "",
            udf4: "",
            udf5: "",
        };

       Object.entries(payuFields).forEach(([fieldName, fieldValue]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = fieldName;
        input.value = fieldValue ?? "";
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  } catch (err) {
    console.error("PayU Payment Init Error:", err);
    setError(
        err.response?.data?.message ||
          "Unable to start PayU payment. Please try again."
        );
        setPaymentStep("error");
      }
    };


// Ye logic mene ChefDashboard.js me bi add kr rkha hai or ab yha per bhi 
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
                                <FaRupeeSign size={12}/>{formattedSalary}/mo (Fee)
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
            
            <p style={{
                fontSize: '11px',
                color: '#666',
                textAlign: 'center',
                marginTop: '12px',
                lineHeight: '1.4'
                }}>
                    By proceeding, you agree to our{" "} <a href="/terms-conditions" target="_blank" rel="noreferrer" style={{color: '#007bff'}}>Terms</a>{" "}&{" "}<a href="/refund-policy" target="_blank" rel="noreferrer" style={{color: '#007bff'}}>Refund Policy</a>. Access fee is non-refundable once unlocked.
                </p>
            </>
           )}

           {paymentStep === "processing" && (
            <div className="pm-center">
                <div className="pm-spinner"></div>
                <p className="pm-muted">Redirecting to PayU payment gateway...</p>
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