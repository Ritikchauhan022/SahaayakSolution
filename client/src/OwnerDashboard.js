import React, { useState } from "react";
import {
  FaArrowLeft,
  FaBuilding,
  FaMapMarkerAlt,
  // FaClock,
  FaSearch,
  FaEdit,
  // FaGlobe,
  FaPhone,
  FaEnvelope,
  // FaBriefcase
} from "react-icons/fa";
import  "./App.css";

export default function OwnerDashboard({
  onBackToLanding = () => {},
  onSearchProfessionals = () => {},
  onEditProfile = () => {},
  userProfile  //FIX: Prop name ownerProfile se userProfile hona chiye (jesa humne App.js me pass kiya hai)
}) {
  // local tab state: 'overview' | 'profile'
  const [tab, setTab] = useState("overview");

   // fallback if ownerProfile not provided
   const profile = userProfile || {
    id: 0,
    name: "Owner Name",
    email: "owner@bakery.com",
    phone: "",
    password: "",
    bakeryName: "My Bakery",
    bakerywork: "",
    location: "Your City, State",
    yearEstablished: "",
    avatar: ""
   };

   return(
    <div className="od-root">
      <header className="od-header">
        <div className="od-left">
          <button className="od-ghost" onClick={onBackToLanding}>
            <FaArrowLeft/> Logout
          </button>
          <div className="od-brand">
            <FaBuilding className="od-brand-icon" />
            <span className="od-brand-title">BakeryConnect</span>
          </div>
        </div>

        <div className="od-right">
          <div className="od-welcome">Welcome, {profile.ownerName || profile.name}</div>
          <div className="od-avatar">
            {profile.profilePic ? (
              <img src={profile.profilePic} alt="avatar"/>
            ) : (
              <div className="od-avatar-fallback">
                {profile.ownerName 
         ? profile.ownerName.split(" ").map(n => n[0]).slice(0,2).join("")
         : 'OW'}
                </div>
            )}
          </div>
        </div>
      </header>

      <main className="od-container">
        <div className="od-page-title">
          <h1>Owner Dashboard</h1>
          <p className="od-sub">Find bakery professionals and manage your hiring</p>
        </div>

        <div className="od-tabs">
          <button className={tab === "overview" ? "od-tab od-tab-active" : "od-tab"}
          onClick={() => setTab("overview")}>
           Overview
          </button>
          <button className={tab === "profile" ? "od-tab od-tab-active" : "od-tab"}
          onClick={() => setTab("profile")}>
            My Profile
          </button>
        </div>

        {tab === "overview" && (
          <section className="od-section od-overview-container">
            <div className="od-top-content">
              {/* Find Available Professionals */}
              <h2><FaSearch/> Find Available Professionals</h2>
              <p className="od-sub">Browse chefs and helpers who are actively looking for work</p>
              </div>
              <div className="od-marketplace-card">
              <div className="od-card-content">
                <h3 className="od-market">Search Professional Marketplace</h3>
                <p className="od-unlock">Browse available professionals and pay to unlock their contact details</p>
                <div className="od-badge">Pay per contact: ₹500</div>

                <button className="od-primary" onClick={onSearchProfessionals}>
                  Browse Available Professionals
                </button>
                </div>

                <div className="od-search-overlay-icon">
                  <FaSearch />
                  </div>
                  </div>
                  </section>
        )}
              

        {tab === "profile" && (
          <section className="od-section">
              <div className="od-card-header">
                <div>
                  <h3>Your Bakery Profile</h3>
                  <p className="od-muted">This is how professionals will see your bakery</p>
                </div>
                <div>
                  <button className="od-outline" onClick={onEditProfile}>
                    <FaEdit/> Edit Profile
                  </button>
                </div>
                </div>

              <div className="od-profile">
                <div className="od-profile-left">
                  <div className="od-avatar-large">
                   {profile.profilePic ? (
                    <img src={profile.profilePic} alt="avatar"/>
                   ) : (
                    <div className="od-avatar-fallback-large">(
                      {profile.ownerName 
         ? profile.ownerName.split(" ").map(n => n[0]).slice(0,2).join("")
         : 'OW'}
                    </div>
                   )}
                  </div>

                  <div className="od-profile-name">{profile.businessName}</div> {/* App.js me businessName hai*/}
                  <div className="od-muted">{profile.bakerywork}</div>
                  <div className="od-location"><FaMapMarkerAlt /> {profile.location}</div>
                </div>

                <div className="od-profile-data-wrap">
                  <div className="od-block">
                    <h4>Owner Information</h4>
                    {/* Name Section */}
                    <div className="od-detail-item">
                    <strong>Name:</strong> <span>{profile.ownerName || "Not provided"}</span> {/* App.js me ownerName hai*/}
                    </div>

                    {/* Email Section with Null Check */}
                    {profile.email && profile.email !== "null" && (
                      <div className="od-detail-item">
                        <FaEnvelope className="od-icon" />
                        <span>{profile.email}</span>
                        </div>
                    )}

                    {/* Phone Section */}
                    <div className="od-detail-item">
                      <FaPhone className="od-icon" />
                      <span>{profile.phone || "Not provided"}</span>
                    </div>
                  </div>

                  <div className="od-block">
                    <h4>Business Details</h4>
                    {profile.yearEstablished && <p><strong>Established:</strong> {profile.yearEstablished}</p>}
                  </div>

                </div>
              </div>
            {/* </div> */}
          </section>
        )}
      </main>
    </div>
   );
}