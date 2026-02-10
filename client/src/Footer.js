import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import  "./App.css";


const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="footer">
            <div className="footer-container">
           {/* Brand Info */}
           <div className="footer-brand">
            <div className="footer-logo">
                <img src="/logo1.png" alt="Chef Logo" />
                <h3>SahaayakSolution</h3>
            </div>
            <p>Connecting India's best bakeries with world-class talent.</p>
           </div>

           {/* Quick Links */}
           <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
                {/* Scroll ki jagah Link use kiya hai taaki har page se kaam kare */}
                <li><Link to="/">Home</Link></li>
                <li onClick={() => navigate('/loginsignup', { state: { userType: 'owner' } })}>For Owners</li>
                <li onClick={() => navigate('/loginsignup', { state: { userType: 'chef' } })}>For Chefs</li>
            </ul>
           </div>

           {/* Legal Pages */}
           <div className="footer-column">
            <h4>Legal</h4>
            <ul>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/terms-conditions">Terms & Conditions</Link></li>
                <li><Link to="/refund-policy">Refund & Cancellation</Link></li>
                <li><Link to="/shipping-policy">Shipping & Delivery</Link></li>
            </ul>
           </div>

           {/* Contact Info */}
           <div className="footer-column">
            <h4>Contact Us</h4>
            <p>📧 sahaayaksolution@gmail.com</p>
            <p>📍 Muzaffarnagar, India</p>
            <p>📞 +91 8273503704</p>
           </div>
            </div>
            <div className="footer-bottom">
                <p>© 2026 SahaayakSolution. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;