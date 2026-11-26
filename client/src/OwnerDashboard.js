import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaBuilding,
  FaMapMarkerAlt,
  FaSearch,
  FaEdit,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import axios from "axios";
import  "./App.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function OwnerDashboard({
  onBackToLanding = () => {},
  onSearchProfessionals = () => {},
  onEditProfile = () => {},
  onUserSync = null,
  userProfile  // Backend se jo data aa raha hai  //FIX: Prop name ownerProfile se userProfile hona chiye (jesa humne App.js me pass kiya hai)
}) {
  // local tab state: 'overview' | 'profile'
  const [tab, setTab] = useState("overview");
  const [paymentBanner, setPaymentBanner] = useState(null); // { type: 'success' | 'error', text: string }

  // 1. BETTER INITIALS LOGIC (Chef Dashboard se match karta hua)
  const getInitials = (name) => {
    if (!name) return 'OW';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    };

    // 2. Data Mapping: Logic ko upar hi settle kar diya chef ki tareh 
    const profile = {
      ...userProfile,
      // Agar ownerName nahi hai toh name lo, varna "Owner"
      name: userProfile?.ownerName || userProfile?.name || "Owner",
      businessName: userProfile?.businessName || "My Bakery",
      bakerywork: userProfile?.bakeryWork || userProfile?.bakerywork || "Bakery Owner",
      location: userProfile?.location || "Location Not Set",
      // Email clean check
      email: userProfile?.email && userProfile.email !== "null" ? userProfile.email : null,
      phone: userProfile?.phone || "Not provided",
      yearEstablished: userProfile?.yearEstablished || "N/A",
      // STRICTOR CHECK: Agar backend se "" ya "null" string aaye, toh usey real null banao
      // Strictly null agar image nahi hai (fallback trigger karne ke liye)
      // 🔥 STRICTOR CHECK: Ye line Bob ki dummy image ka bhoot bhagayegi
  profilePic: (
    userProfile?.profilePic && 
    userProfile.profilePic !== "null" && 
    userProfile.profilePic !== "" &&
    !userProfile.profilePic.includes("dummy") // Agar koi purana default link aa raha ho toh block karo
   ) ? userProfile.profilePic : null
      };

  // 3. PayU Redirect Query Params Handle Karna (?payment=success&chefId=... ya ?payment=failed)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const chefId = params.get("chefId");

    if (!paymentStatus) return;

    if (paymentStatus === "success") {
      setPaymentBanner({
        type: "success",
       text: chefId
       ? `Payment successful! Chef contact unlocked (ID: ${chefId}).`
       : "Payment successful! Contact details unlocked.",
      });

      // Latest unlockedChefs sync karne ke liye backend /api/user/sync call
      const syncOwnerData = async () => {
        try {
          const rawUser = JSON.parse(localStorage.getItem("user"));
          const currentObj = rawUser?.data || rawUser || userProfile || {};
          const identifier = currentObj?.phone || currentObj?.email || profile?.phone || profile?.email;

          if (identifier && identifier !== "Not provided") {
            const res = await axios.get(
             `${API_BASE_URL}/api/user/sync/${encodeURIComponent(identifier)}`
            );
            const syncedData = res.data?.data;

            if (syncedData) {
              if (rawUser && rawUser.data) {
                rawUser.data = { ...rawUser.data, ...syncedData };
                localStorage.setItem("user", JSON.stringify(rawUser));
             } else {
                localStorage.setItem("user", JSON.stringify(syncedData));
              }

              if (typeof onUserSync === "function") {
                onUserSync(syncedData);
              }
            }

          }
        } catch (err) {
          console.error("Error syncing owner after PayU payment:", err);
        }
      };

      syncOwnerData();
    } else if (paymentStatus === "failed") {
      setPaymentBanner({
        type: "error",
       text: "Payment was cancelled or failed. Please try again.",
      });
    }

    // URL se query string clean karna taaki reload par dobara trigger na ho
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

   return(
    <div className="od-root">
      <header className="od-header">
        <div className="od-left">
          <button className="od-ghost" onClick={onBackToLanding}>
            <FaArrowLeft/> Logout
          </button>
          <div className="od-brand">
          </div>
        </div>

        <div className="od-right">
          {/* Safe Name Display */}
          <div className="od-welcome">Welcome, {profile.name}</div>
          <div className="od-avatar">
            {/* DUMMY IMAGE REMOVED: Sirf asli pic ya fallback */}
            {/* Check karo ki profilePic real hai ya nahi */}
           {profile.profilePic && profile.profilePic !== "null" ? (
              <img src={profile.profilePic}
               alt="avatar"
               key={profile.profilePic} // 🔥 KEY ADD KARO: Isse React image change hote hi force update karega
               onError={(e) => {
                e.target.style.display = 'none'; // Image chhupao
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex'; // Initials dikhao
                }
               }}
               />
            ) : null}
            {/* Initials wala div */}
              <div className="od-avatar-fallback"
              style={{ display: (profile.profilePic && profile.profilePic !== "null") ? 'none' : 'flex' }}>
              {getInitials(profile.name)}
                </div>
          </div>
        </div>
      </header>

      <main className="od-container">
        {/* PayU Payment Status Banner */}
        {paymentBanner && (
          <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            backgroundColor:
             paymentBanner.type === "success" ? "#e6f7ed" : "#fdecea",
            color: paymentBanner.type === "success" ? "#137333" : "#c5221f",
            border: `1px solid ${
              paymentBanner.type === "success" ? "#b7e1cd" : "#f5c2c7"
            }`,
          }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {paymentBanner.type === "success" ? (
                <FaCheckCircle />
              ) : (
                <FaExclamationTriangle />
              )}
              <span>{paymentBanner.text}</span>
            </div>
            <button
            type="button"
            onClick={() => setPaymentBanner(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: "4px",
            }}
            aria-label="Close payment notification"
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className="od-page-title">
          <h2>Owner Dashboard</h2>
          <p className="od-sub">Find bakery professionals and manage your connections</p>
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
              <p className="od-sub">Browse professional chefs and helpers available in the directory network</p>
              </div>
              <div className="od-marketplace-card">
              <div className="od-card-content">
                <h3 className="od-market">Explore Professional Directory</h3>
                <p className="od-unlock">Browse available professionals and pay to unlock their contact details</p>
                <div className="od-badge">Pay per contact: ₹1</div>

                <button className="od-primary" onClick={onSearchProfessionals}>
                  Browse Professional Directory
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
                    {/* DUMMY IMAGE REMOVED: Large version of fallback */}
                   {profile.profilePic ? (
                    <img src={profile.profilePic} alt="avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if(e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                      />
                   ) : null}
                    <div className="od-avatar-fallback-large"
                    style={{ display: profile.profilePic ? 'none' : 'flex' }}>
                     {getInitials(profile.name)}
                    </div>
                  </div>

                  <div className="od-profile-name">{profile.businessName}</div> {/* App.js me businessName hai*/}
                  <div className="od-muted">{profile.bakerywork}</div>
                  <div className="od-location"><FaMapMarkerAlt />{profile.location}</div>
                </div>

                <div className="od-profile-data-wrap">
                  <div className="od-block">
                    <h4>Owner Information</h4>
                    {/* Name Section */}
                    <div className="od-detail-item">
                    <strong>Name:</strong> <span>{profile.name}</span> {/* App.js me ownerName hai*/}
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
                      <span>{profile.phone}</span>
                    </div>
                  </div>

                  <div className="od-block">
                    <h4>Business Details</h4>
                    <p><strong>Established:</strong> {profile.yearEstablished}</p>
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