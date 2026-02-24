import React, { useMemo, useState } from "react";
import  "./App.css";
import { useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaDollarSign,
  FaClock,
  FaLock,
  FaEye,
  FaUser,
  FaRupeeSign
} from "react-icons/fa";
// import { data } from "react-router-dom";

const formatCurrency = (amount = 0) => {
    // Agar amount string hai aur usme comma hai (jaise "20,000"), toh use saaf karo
    const cleanAmount = typeof amount === 'string'
    ? amount.replace(/,/g, '')
    : amount;

    const numericAmount = Number(cleanAmount);

    // Agar fir bhi number na bane (NaN ho), toh "Negotiable" ya wahi string dikha do
    if (isNaN(numericAmount)) return amount;

    return `₹${numericAmount.toLocaleString("en-IN")}`;
};

/*data nhi mila to dummy data use krea */

const AvailableProfessionals = ({
  professionals: externalProfessionals = null,
  onBack = () => {}, // onBack Prop abhi bhi chiye
//   onViewDetails = () => {},
  onUnlockContact = () => {},
 unlockedChefs: externalUnlocked = [],
  currentChefId = null,
}) => {

 //  useParams ka use krke URL se viewerType pda
const { viewerType: urlViewerType } = useParams();
const viewerType = urlViewerType || "owner";

// Dummy data
const dummyProfessionals = [
  {
     id: 1,
     name: "Ramesh Kumar",
     role: "Chef",
     experience: "4+ years",
     rating: 4.9,
     location: "Manhattan",
     hourlyRate: 450,
     skills: ["Cakes", "Pastry", "Fondant", "Chocolate"],
     avatar: "https://i.pravatar.cc/120?img=12",
     bio: "Expert in wedding cakes and artisanal pastries. Strong taste sense and presentation.",
     phone: "+1 555-0101",
     email: "ramesh@example.com",
     availability: "Immediate",
     lookingForWork: true,
      },
    {
       id: 2,
       name: "Priya Sharma",
            role: "Helper",
            experience: "2-3 years",
            rating: 4.6,
            location: "Brooklyn",
            hourlyRate: 300,
            skills: ["Breads", "Sourdough", "Croissant"],
            avatar: "https://i.pravatar.cc/120?img=22",
            bio: "Skilled in artisan breads and laminated dough. Loves long fermentation techniques.",
            phone: "+1 555-0202",
            email: "priya@example.com",
            availability: "Part Time",
            lookingForWork: true,
        },
        {
            id: 3,
            name: "Aman Verma",
            role: "Helper",
            experience: "1 year",
            rating: 4.2,
            location: "Queens",
            hourlyRate: 180,
            skills: ["Kneading", "Packing", "Cleaning"],
            avatar: "https://i.pravatar.cc/120?img=32",
            bio: "Reliable helper with experience in fast-paced bakery environments.",
            phone: "+1 555-0303",
            email: "aman@example.com",
            availability: "Immediate",
            lookingForWork: false,
        }
    ];

    const professionals = externalProfessionals || dummyProfessionals;

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");
    const [selectedExperience, setSelectedExperience] = useState("all");
    const [selectedLocation, setSelectedLocation] = useState("all");

    // Purana wala hatao aur sirf ye likho:
const unlockedContacts = externalUnlocked || [];

    // Purana useMemo wala roles hata do aur ye likho:
    const roles = ["all", "Chef", "Helper"];

    // Purana useMemo wala experience hata do aur ye likho:
    const experience = ["all", "0-1 years", "2-3 years", "4+ years"];

    const locations = useMemo(() => {
        const setL = new Set(professionals.map((p) => p.location));
        return ["all", ...Array.from(setL)];
    }, [professionals]);

    
    // सिर्फ उन्हें दिखाओ जिनका isAvailable true है (Real data के लिए)
    // या lookingForWork true है (Dummy data के लिए)
    // 1. FILTER LOGIC FIX (CHANGE HERE)
    const activeProfessionals = professionals.filter(p => p.isAvailable === true || p.lookingForWork === true);
    // अब 'activeProfessionals' पर सर्च और बाकी फिल्टर लगाओ
    const filteredProfessionals =  activeProfessionals.filter((professional) => { // Pehle yahan 'professionals' tha
        // 1. Search Logic 
        const name = professional.name || "";
        const skills = Array.isArray(professional.skills) ? professional.skills : [];
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
     // 2. Filter Logic
        const matchesRole = selectedRole === "all" || professional.role === selectedRole;
        // 2. EXPERIENCE FILTER SYNC
        // Strict '===' ki jagah includes use kar rahe hain taaki "4+ years" dropdown "4 years" data se match kar jaye
        const matchesExperience = 
        selectedExperience === "all" || (professional.experience && professional.experience.includes(selectedExperience.split(' ')[0]));
        const matchesLocation = selectedLocation === "all" ||  professional.location === selectedLocation;

        return matchesSearch && matchesRole && matchesExperience && matchesLocation;
    });

    const isContactUnlocked = (professionalId) => {
    if (!unlockedContacts) return false;
    // Ye line ensure karegi ki database wali ID aur card wali ID sahi se match ho
    return unlockedContacts.some(id => String(id) === String(professionalId));
    };
    const isCurrentChef = (professionalId) => currentChefId && professionalId && String(currentChefId) === String(professionalId);
    
    // OWNER → payment modal kholna hai
  const handleUnlock = (professional) => {
  console.log("Unlock clicked, opening modal:", professional);
  onUnlockContact(professional);
};


    const pageTitle = viewerType === "chef" ? "Your Profile in the Marketplace" : "Find Bakery Professionals";
    const pageDescription = 
    viewerType === "chef" ? "This is how bakery owners see your profile and other available professionals in the marketplace."
     : "Browse professionals actively looking for work. Pay to unlock contact details and hire directly.";
     
// Back button ka Logic: Ab onBack handler ko viewerType Bhejna hoga
 return (
 <div className="ap-root">
    <header className="ap-header">
     <div className="ap-header-left ap-header-title-group">
    <button className="ap-back" onClick={() => onBack(viewerType)}>
    <FaArrowLeft /> Back to Dashboard
    </button>
     <h1 className="ap-page-location">{viewerType === "chef" ? "Marketplace View" : "Available Professionals"}</h1>
 </div>                    
    </header>

    <main className="ap-container">
    <section className="ap-top ap-top--figma">
 <div className="ap-top-left">
    <h2 className="ap-title">{pageTitle}</h2>
     <p className="ap-desc">{pageDescription}</p>

 <div className="ap-badges">
    <span className="ap-badge">{filteredProfessionals.length} professionals</span>
    {viewerType === "owner" && <span className="ap-badge outline">Pay {formatCurrency(500)} per contact</span>}
    {viewerType === "chef" && <span className="ap-badge outline">Read-only marketplace</span>}
 </div>
 </div>

<div className="ap-top-right">
<div className="ap-search">
  <FaSearch className="ap-search-icon"/>
   <input placeholder="Search by name or skills..." value={searchTerm}
   onChange={(e) => setSearchTerm(e.target.value)}/>
</div>

<div className="ap-filters">
  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
  {roles.map((r, idx) => (
  <option value={r} key={idx}>
  {r === "all" ? "All Roles" : r}
  </option>
  ))}
  </select>

  <select value={selectedExperience} onChange={(e) => setSelectedExperience(e.target.value)}>
    {experience.map((ex, idx) => (
    <option value={ex} key={idx}>
    {ex === "all" ? "All Experience" : ex}
     </option>
     ))}
    </select>

    <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
     {locations.map((loc, idx) => (
                                    <option value={loc} key={idx}>
                                       {loc === "all" ? "All Locations" : loc}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                <section className="ap-list">
                    {filteredProfessionals.length === 0 ? (
                        <div className="ap-empty">
                            <FaSearch className="ap-empty-icon"/>
                            <h3>No professionals found</h3>
                            <p>Try adjusting your filters or check back later for new professionals.</p>
                        </div>
                    ) : (
                        filteredProfessionals.map((professional) => {
                            const profId = professional._id || professional.id; 
                            const unlocked = isContactUnlocked(profId);
                            const myProfile = isCurrentChef(profId);

                            // ✅ 1. बायो को छोटा करने का लॉजिक (Max 150 characters)
                            const truncatedBio = professional.bio && professional.bio.length > 150
                            ? professional.bio.substring(0, 150) + "..."
                            : professional.bio;

                            return(
                                <article className={`ap-card ${myProfile ? "ap-card--mine" : ""}`} key={profId}> 
                                    <div className="ap-card-left">
                                        {/* 3. AVATAR INITIAL FALLBACK (CHANGE HERE) */}
                                        {/* Image Fix: Agar avatarPath kharab ho toh default image dikhegi */}
                                        {professional.avatar ? (
                                        <img src={professional.avatar} alt={professional.name} className="ap-avatar" 
                                       onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + professional.name + "&background=4f46e5&color=fff"; }} // Agar link toot jaye toh dabba dikhe
                                       />
                                       ) : (
                                        <div className="ap-avatar-fallback">
                                            {professional.name ? professional.name.charAt(0).toUpperCase() : "P"}
                                            </div>
                                            )}

                                        <div className="ap-meta">
                                            <div className="ap-title-row">
                                                {/* 3. Name Fix: Kalyani ya jo bhi naam DB mein hai wahi dikhega */}
                                                <h3 className="ap-name">{professional.name || "Bakery Professional"}</h3>
                                                {(professional.isAvailable || professional.lookingForWork) && (
                                                    <span className="ap-pill">Looking for work</span>
                                                )}
                                            </div>

                                            <div className="ap-sub">{professional.role || "Chef"}</div>

                                            <div className="ap-stats-grid">
                                                <div className="ap-stat">
                                                    <FaMapMarkerAlt className="icon"/>
                                                    <span className="truncate">{professional.location || "Location N/A"}</span>
                                                </div>

                                                <div className="ap-stat">
                                                    <FaStar className="icon" style={{color: '#f1c40f'}}/>
                                                    <span>{professional.rating || 4.5} rating</span>
                                                </div>

                                                <div className="ap-stat">
                                                    <FaRupeeSign className="icon"/>
                                                    {/* 4. Salary Fix: hourlyRate ko proper dikhayega */}
                                                    <span>{formatCurrency(professional.hourlyRate || 0 )}/month</span>
                                                </div>

                                                <div className="ap-stat">
                                                    <FaClock className="icon" />
                                                    <span>{professional.experience || "Fresh"}</span>
                                                </div>
                                            </div>

                                            <div className="ap-block">
                                                <div className="ap-block-title">Skills</div>
                                                <div className="ap-skills">
                                                    {professional.skills && professional.skills.length > 0 && professional.skills[0] !== "" ? (
                                                        professional.skills.slice(0, 4).map((s, i) => (
                                                            /* Key mein skill ka naam (s) aur index (i) dono daal diye taaki React turant update pakad le */
                                                           <span className="ap-skill" key={`${s}-${i}`}>
                                                            {s}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        /* Agar skills khali hain toh "No skills added" dikhega */
                                                        <span className="ap-skill"style={{ opacity: 0.7 }}>No skills added</span>           
                                                    )}
                                                    </div>
                                                    </div>

                                                    {/* ✅ 2. यहाँ truncatedBio का इस्तेमाल करें */}
                                                    <div className="ap-block">
                                                        <div className="ap-block-title">About</div>
                                                        <div className="ap-block-body ap-bio">{truncatedBio}</div>
                                                        </div>
                                                        </div>
                                                        </div>
                                                    
                                    <div className="ap-card-right">
                                        <div className="ap-contact-card">
                                            <div className="ap-contact-top">
                                                <FaLock className="ap-lock" />
                                                <h4>Contact Details</h4>
                                                <p className="ap-contact-sub">{myProfile ? "Your Profile (Locked for others)" : "Unlock to view phone & email"}</p>
                                            </div>

                                            <div className="ap-contact-body">
                                                {/* ✅ 3. लॉजिक अपडेट: अपनी प्रोफाइल पर भी कांटेक्ट छुपाएं */}
                                                {(unlocked || myProfile) ? (
                                                    // myProfile ? (
                                                       <div className="ap-contact-unlocked">
                                                        <div><FaUser className="icon" /> <strong>Phone:</strong> {professional.phone}</div>
                                                        <div><FaUser className="icon" /> <strong>Email:</strong> {professional.email}</div>
                                                     </div>
                                                    ) : (
                                              <div className="ap-locked-box">
                                                <p>Phone: •••-•••-••••</p>
                                                <p>Email: •••••@••••••</p>
                                                </div>
                                                    )}
                                                    </div>
                                               
                                                <div className="ap-contact-actions">
                                                    {viewerType === "chef" ? (
                                                        // Case 1: Agar viewer CHEF hai, toh use sirf "View Only" dikhao
                                                        <button className="btn btn-outline" disabled style={{ width: '100%' }}>
                                                            {myProfile ? "Your Profile" : "View Only Mode"}
                                                        </button>
                                                    ) : unlocked ? (
                                                        //Case 2: Agar contact UNLOCKED hai, toh seedha baat karne ke raste do
                                                        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                                            <a href={`tel:${professional.phone}`} className="btn btn-outline" 
                                                            style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                Call Now
                                                                </a>
                                                            <a href={`mailto:${professional.email}`} className="btn btn-outline" 
                                                            style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                Email
                                                                </a>
                                                                </div>
                                                    ) : (
                                                      
                                                    // Case 3: Agar contact LOCKED hai, toh payment modal wala button dikhao
                                                        <button className="btn btn-primary" onClick={() =>  handleUnlock(professional)} style={{ width: '100%' }}>
                                                            <FaLock className="btn-icon"/>  Unlock Contact - {formatCurrency(500)}
                                                        </button>
                                                    )}
                                          </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    )}

                </section>
            </main>
        </div>
     );
};

export default AvailableProfessionals;