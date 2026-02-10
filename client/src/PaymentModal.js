import React, {useState} from "react";
import  "./App.css";
import {
  FaTimes,
  FaCreditCard,
  FaLock,
  FaStar,
  FaMapMarkerAlt,
  FaDollarSign,
  FaExclamationCircle,
} from "react-icons/fa";

const CONTACT_UNLOCK_AMOUNT = "₹500.00";

const PaymentModal = ({professional, onClose, onPaymentSuccess}) => {
    const [paymentStep, setPaymentStep] = useState("details"); // details | processing | success | error
    const [error, setError] = useState(null);

    const handleFakePayment = () => {
        setError(null);
        setPaymentStep("processing");

         // 🔥 BACKEND INTEGRATION POINT
         setTimeout(() => {
            setPaymentStep("success");
             // success demo
             setTimeout(() => {
             if (onPaymentSuccess) {
                // ✅ FIX: professional pass karo taaki App.js ko pata chale kise unlock karna hai
                onPaymentSuccess(professional);
             }
         }, 1500);
    }, 2000);
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
                    <img
                       src={professional.avatar}
                       alt={professional.name}
                       className="pm-avatar"
                    />
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
                                <FaDollarSign size={12}/> {professional.hourlyRate}/month
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
                    <li>No platform fees</li>
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
                <button className="pm-btn primary" onClick={handleFakePayment}>
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