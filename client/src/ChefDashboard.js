import React, { useState } from "react";
import  "./App.css";
import { useLocation } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaSearch,
  FaEdit,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaRupeeSign,
} from "react-icons/fa";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ChefDashboard = ({userProfile, onLogout, onEditProfile, onWatchProfile, onToggleStatus = () => {}}) => {
// 1. अब हम सीधे props वाले userProfile का इस्तेमाल करेंगे
// और || (OR) ऑपरेटर का उपयोग करेंगे ताकि अगर डेटा न हो तो खाली दिखे, न कि "Undefined"
 
// बटन के क्लिक पर यह फंक्शन चलेगा
const handleStatusClick = () => {
    const phone = userProfile.phone;
    onToggleStatus(phone, userProfile.isAvailable); // App.js वाले फंक्शन को कॉल करेगा
};

const profile = {
  name: userProfile.fullName || userProfile.name || "Guest Chef", // fullName पहले चेक करें
  // Backend 'avatarPath' भेज रहा है, Dashboard 'avatar' मांग रहा है
  // 🔥 सुधार: पहले App.js वाला 'avatar' चेक करें, फिर 'avatarPath', फिर Default
  // 🔥 FIX: Sirf userProfile.avatar use karo kyunki App.js ise pehle hi process kar chuka hai
  avatar: userProfile.avatar || "https://i.pravatar.cc/150",
  role: userProfile.specialty || userProfile.role || "Bakery Chef", // specialty बैकएंड से आता है
  rating: userProfile.rating || 4.8,
  phone: userProfile.phone || "No Phone",
  // FIX: Email ke liye sirf email check karein (taki email ki jagah email hi dikhe)
  email: userProfile.email || "No Email",
  location: userProfile.city || userProfile.location || "Location Not Set",
  experience: userProfile.experience || "Fresh",
  hourlyRate: userProfile.salaryExpectation || userProfile.hourlyRate
  ? Number(String(userProfile.salaryExpectation || userProfile.hourlyRate).replace(/,/g, '')).toLocaleString('en-IN')
   : "TBD",
  // 🔥 SUDHAAR: Sidha database wali availability string use karo
  // Agar database mein "Full-time" hai toh wahi dikhega
  availability: userProfile.availability || (userProfile.isAvailable ? "Available" : "Not Looking"),
  skills: Array.isArray(userProfile.skills) ? userProfile.skills : [],
  bio: userProfile.bio || "No professional bio added yet."
}; 
   // 2. State के लिए भी props का इस्तेमाल करें
//   const [isLookingForWork, setIsLookingForWork] = useState(userProfile.lookingForWork ?? true);


    // if (!userProfile) {
    //     return(
    //         <div className="no-profile-container">
    //             <h2>Profile Not Found</h2>
    //             <p>There seems to be an issue with your profile. Please try creating it again.</p>
    //             <button className="btn-primary">Go Back</button>
    //         </div>
    //     );
    // }

    return(
        <div className="dashboard-container">
            {/* Header */}
            <header className="header">
                <div className="header-left">
                <button className="back-btn" onClick={onLogout}>
                    <FaArrowLeft className="icon" /> Logout
                </button>
                <h1 className="logo">SahaayakSolution</h1>
                </div>
                <div className="profile-mini">
                    <span>Welcome, {profile.name}</span>
                    <img src={profile.avatar} alt="avatar" className="mini-avatar" />
                </div>
            </header>

            <div className="content-box">
                <h2 className="title">Your Dashboard</h2>
                <p className="subtitle">Manage your profile visibility and professional information</p>

                {/* Job Status Section */}
                <div className="job-status-card">
                    <div className="status-left">
                        <div className="icon-circle">
                            {userProfile.isAvailable ? <FaEye size={32} />: <FaEyeSlash size={32}/>}
                        </div>

                        <div className="status-text-content">
                            <h3 className="status-heading">Looking for Work Status</h3>
                            <p className="status-message">
                                {userProfile.isAvailable ? "Your profile is visible to bakery owners who can pay to view your contact details"
                                : "Your profile is hidden from the marketplace. Activate to receive job opportunities"}
                            </p>
                            <div className="badge-container">
                            {userProfile.isAvailable && <span className="badge">Profile Active</span>}
                            {/* Is button ko humne badge ke saath hi container ke andar daal diya hai */}
                            {userProfile.isAvailable && (
                                <button className="btn-watch-profile" onClick={onWatchProfile}>
                                    <FaSearch size={14} style={{marginRight: '5px'}} className="icon-small"/>
                                    Watch Profile
                                </button>
                                )}
                            </div>
                            {/* Watch Your Profile button yha add kiya mene 
                            {userProfile.isAvailable && (
                                <button className="btn-watch-profile"
                                    onClick={onWatchProfile}>
                                    
                                    <FaSearch size={14} style={{marginRight: '5px'}} className="icon-small"/> Watch Your Profile 
                                </button>
                            )} */}
                        </div>
                    </div>

                    <button className="btn-toggle" onClick={handleStatusClick}>
                        {userProfile.isAvailable ? "Stop Looking" : "Require New Job"}
                    </button>
                </div>

                 {/* Profile Info */}
                 <div className="profile-card">
                    <div className="profile-header">
                        <h3>Your Professional Profile</h3>
                        <button className="btn-outline" onClick={onEditProfile}>
                            <FaEdit /> Edit Profile
                        </button>
                    </div>

                    <div className="profile-box">
                        <img src={profile.avatar} alt="avatar" className="main-avatar" />

                        <div>
                            <h3 className="name">{profile.name}</h3>
                            <p className="role">{profile.role}</p>

                            <div className="rating-box">
                                <FaStar className="rating-icon" />
                                <span>{profile.rating} rating</span>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="details-grid">
                        <div className="detail-block">
                            <h4>Contact Information</h4>
                            <div className="detail-item">
                      <FaEnvelope className="detail-icon" /> 
                     <span>{profile.email}</span>
                      </div>
                           <div className="detail-item">
                       <FaPhone className="detail-icon" /> 
                        <span>{profile.phone}</span>
                       </div>
                           <div className="detail-item">
                       <FaMapMarkerAlt className="detail-icon" /> 
                       <span>{profile.location}</span>
                         </div>
                        </div>

                        <div className="detail-block">
                            <h4>Professional Details</h4>
                            <div className="detail-item">
                            <FaClock className="detail-icon" /> 
                            <span>{profile.experience} experience</span>
                        </div>
                            <div className="detail-item">
                            <FaRupeeSign className="detail-icon" /> 
                           <span>{profile.hourlyRate}/month</span>
                         </div>
                           <div className="detail-item">
                            <FaClock className="detail-icon" /> 
                           <span>{profile.availability}</span>
                         </div>
                        </div>

                        <div className="detail-block">
                            <h4>Skills & Specialties</h4>
                            <div className="skills">
                                {profile.skills.map((skill, index) =>(
                                    <span key={index} className="skill-tag">{skill}</span>
                                ))}
                            </div>
                        </div>

                        <div className="detail-block">
                             <h4>About</h4>
                             <p className="about">{profile.bio}</p>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default ChefDashboard;