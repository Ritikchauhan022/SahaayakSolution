import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import  "./App.css";
// Icons
import { FaArrowLeft, FaEye, FaEyeSlash, FaUpload, FaBuilding } from "react-icons/fa";
import imageCompression from 'browser-image-compression';

export default function OwnerInformation({
    onProfileCreated = (data) => console.log("Owner Profile:", data),
    // editing feature ke liye
    initialData = null,
    isEditing = false,
}) {
    
    const navigate = useNavigate();
    const location = useLocation();

    // new logic: isEditing ka antem maan Determined(nirdharit) kiya
    // 1. phele, URL state se isEditing pdega
    const isEditingFromState = location.state?.isEditing

    // 2. Anteem maan: Yadi state me koi maan (true) hai, to usse use krega,
    //    nhi to, Prop (isEditing)ka use krega (jo default ruup se false hai)
    const finalIsEditing = isEditingFromState || isEditing;

    // LoginSignup page se userType get(prapt) krna ye jaruri hai kyuki piche 2 page hai lakin esse pta hoga kis page per jana hai owner ya chef 
    const userType = location.state?.userType || 'owner';

    const [formData, setFormData] = useState({
        ownerName: initialData?.ownerName || initialData?.fullName || "",
       email: initialData?.email || "",
       phone: initialData?.phone || "",
       password: initialData?.password || "",
       businessName: initialData?.businessName || initialData?.bakeryName || "",
       bakeryWork: initialData?.bakeryWork || "",
       location: initialData?.location || "",
       yearEstablished: initialData?.yearEstablished || "",
       profilePic: null, // photo ki jagah profilePic use karein backend compatibility ke liye
    });

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    
    const [previewImage, setPreviewImage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // useEffect: initialData(purana data) ko formData me load krna (Editing Logic)
    useEffect(() => {
        if (initialData) {
           setFormData(prev => ({
            ...prev, // ensure kra mene ki default value mojud rhe
            ...initialData,

            // FIX 1: Dashboard Keys ko Form Keys me map kre
            fullName: initialData.ownerName || initialData.fullName || "",
            bakeryName: initialData.businessName || initialData.bakeryName || "",
           }));

           // Photo preview ke liye, agar initialData me photo hai 
           // Photo preview के लिए (हमने App.js में profilePic key का उपयोग किया है)
           if (initialData.profilePic) {
            setPreviewImage(initialData.profilePic); // FIX 2: profilePic ka use kiya 
           }
        }

    }, [initialData]);

    // Input changes ko handle krna 
    const handleChange = (e) => {
       const { name, value } = e.target;
       setFormData(prev => ({ ...prev, [name]: value }));
       setError('');
       setSuccessMessage('');
    };  

    //  Back button or Cancel button ke liye navigation
    const handleBack = () => {
        if (finalIsEditing) {
           // agar hum form me Edit mod me hai to OwnerDashboard page per bapes jayega
         navigate('/ownerdashboard');
        } else {
            // agar hum new form bher rhe hai to LoginSignup page per bapes jayega
         navigate('/loginsignup', { state: { userType } });
        }
   // Loginsignup page per bheja, or saat me userType state ko bhi bheja
    // navigate('/loginsignup', { state: { userType } });
    };

    const validate = () => {
        // 1. (Required fields check)
        if (!formData.ownerName?.trim() || !formData.phone?.trim() || !formData.password?.trim() || 
     !formData.businessName?.trim()) {
        setError("Owner Name, Phone, Password, and Bakery Name are required.");
        return false;
     }

     // 2. (Password length check)
     if (formData.password && formData.password.length < 6) {
       setError("Password must be at least 6 characters long.");
       return false;
     }

     // 3. (Phone number check)
     if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
        setError("Phone number must be exactly 10 digits.");
        return false;
      }

      // 4. (If everything is valid)
      setError('');
      return true;
    }

      // Profile Creation
    const handleSubmit = (e) => {
        e.preventDefault();
         setError('');
         setSuccessMessage('');

         if (!validate()){
            return;
         }
         
         // 1. Size Check (Vercel/Render ki safety ke liye)
         // FIX: Check karo agar image compression fail hui aur file abhi bhi badi hai
         if (formData.profilePic && formData.profilePic.size > 2 * 1024 * 1024) { // 2MB se badi
            setError("This image is too complex/large. Please take a screenshot of it and upload that instead.");
            return;
         }

         // Dono keys bhejo: ownerName (New) aur fullName (Old backup)
         const finalData = {
            ...formData,
            fullName: formData.ownerName,
            bakeryName: formData.businessName
         };

         // 2. Background mein data bhejo (Bina await kiye)
         // Isse browser ko wait nahi karna padega
         onProfileCreated(finalData)
         .then(() => {
            console.log("Profile updated in background!");
         })
         .catch((err) => {
            console.error("Submission Error:", err);
            // Agar bahut bada error ho tabhi alert aayega
            // Ye line phone par error dikha degi
          alert("Asli Error: " + (err.response?.data?.message || err.message));
         });

         // 3. User ko turant message dikhao aur Dashboard par bhej do
         setSuccessMessage("Setting up your dashboard... Please wait.");

         setTimeout(() => {
            navigate('/ownerdashboard');
            }, 1500);
            
        };
    

    return (
        <div className="owner-container">

            {/* Header */}
            <div className="owner-header">
                <button className="back-btn" onClick={handleBack}>
                    <FaArrowLeft /> Back
                </button>

                <div className="header-title">
                    <FaBuilding className="header-icon" />
                    <span>{finalIsEditing ? "Edit Bakery Profile" : "Create Bakery Profile"}</span>
                </div>
            </div>

            {/* Card */}
            <div className="owner-card">
                <h2 className="owner-title">{finalIsEditing ? "Update Your Bakery Profile" : "Set Up Your Bakery Profile"}</h2>
                <p className="owner-desc">{finalIsEditing ? "Review and update your bakery information below."
                : "Tell us about your bakery so professionals can understand what you offer." }</p>
                 {/* Error and Success Messages */}
                 {error && <div className="error-message">{error}</div>}
                 {successMessage && <div className="success-message">{successMessage}</div>}

                <form onSubmit={handleSubmit} className="owner-form">
                 {/* Owner Information */}
                 <h3 className="section-title">Owner Information</h3>

                 <div className="grid-2">
                    <div>
                        <label>Full Name</label>
                        <input
                          type="text"
                          name="ownerName"
                          value={formData.ownerName || ""}
                          onChange={handleChange}
                            placeholder="Enter your full name"
                            required />
                    </div>

                    <div>
                        <label>Email (Optional)</label>
                        <input  type="email"  name="email" value={formData.email || ""}
                        onChange={handleChange}
                        placeholder="your.email@example.com" />
                    </div>
                 </div>

                 <div>
                    <label>Phone</label>
                    <input type="text" name="phone" value={formData.phone}
                    onChange={handleChange}
                    placeholder=""
                    required />
                 </div>

                 <div>
                    <label>Password</label>
                    <div className="password-wrapper">
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password || ""}
                    onChange={handleChange}
                    placeholder="Create a password (min 6 characters)" required/>
                    
                    <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>

                 {/* Bakery Information */}
                 <h3 className="section-title">Bakery Information</h3>
                 <div className="grid-2">
                    <div>
                        <label>Bakery Name</label>
                        <input type="text" name="businessName" value={formData.businessName || ""}
                        onChange={handleChange}
                        placeholder="Enter your bakery name" required/>
                    </div>

                    <div>
                        <label>Bakery Work</label>
                        <select
                        name="bakeryWork"
                        value={formData.bakeryWork}
                        onChange={handleChange}>
                            <option value="">Select bakery work</option>
                            <option value="Counter Work">Counter Work</option>
                            <option value="Supply Work">Supply Work</option>
                            <option value="Counter & Supply Work">Counter & Supply Work</option>
                        </select>
                    </div>

                    <div>
                        <label>Location</label>
                        <input type="text" name="location" value={formData.location || ""}
                         onChange={handleChange}
                         placeholder="City, State"/>
                    </div>

                    <div>
                        <label>Year Established</label>
                        <input type="text" name="yearEstablished" value={formData.yearEstablished || ""}
                         onChange={handleChange}
                         placeholder="e.g., 2010"/>
                    </div>
                 </div>

                  {/* Photo Upload */}
                  <label style={{marginTop: '15px'}}>Bakery Photos</label>
                  <div className="upload-box">
                    <FaUpload className="upload-icon" />
                    <p>Upload photos of your bakery</p>

                    {/* Hidden file input */}
                    <input type="file" id="uploadPhoto" accept="image/*" style={{display: "none"}}
                    onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        setError('');

                         // 1. Compression Options Set Kiya
                            const options = {
                                maxSizeMB: 0.5,           // 1MB se kam kiya taaki AI image heavy na pade
                                maxWidthOrHeight: 800,    // Dimension thoda chota kiya fast processing ke liye
                                useWebWorker: true,   // Background mein kaam karega (App slow nahi hoga)
                                initialQuality: 0.6,     // Quality thodi kam rakhi taaki compression loop na fase
                                preserveExif: false
                            };

                            try {
                              // Backup: Pehle asli file ko hi maan lo
                              let fileToUpload = file;

                            try {
                             // 2. Image ko compress kiya
                            const compressedFile = await imageCompression(file, options);
                            fileToUpload = compressedFile;
                            console.log("Owner Photo Compression success!");
                        } catch (compressionErr) {
                            // Agar fail hua (jaise Abdul wali photo), toh asli file chalti rahegi
                              console.warn("Compression failed, using original file:", compressionErr);
                        }
                             // FIX: Purana temporary link delete karo memory se
                            if (previewImage && previewImage.startsWith('blob:')) {
                            URL.revokeObjectURL(previewImage);
                          }

                            // 4. Preview aur State update (fileToUpload use karein)
                           setPreviewImage(URL.createObjectURL(fileToUpload));
                            // 🔥 यह लाइन जोड़ना बहुत ज़रूरी है, वरना फोटो कभी सर्वर पर नहीं जाएगी
                            // ProfilePic mein ab compressed file jayegi
                            setFormData(prev => ({ ...prev, profilePic: fileToUpload }));
                           } catch (error) {
                                console.error("Main Error:", error);
                                setError("Photo process karne mein dikkat aayi.");
                            }

                    }}/>
                    {/* Button to trigger file upload */}
                    <label htmlFor="uploadPhoto" className="upload-btn">
                        Choose Photo
                    </label>

                    {/* Image Preview */}
                    {previewImage && (
                        <div style={{ marginTop: "15px"}}>
                            <img src={previewImage} alt="Preview"
                            style={{
                              width: "100%",
                              maxHeight: "250px",
                              objectFit: "contain",
                              borderRadius: "10px",
                              border: "1px solid #ddd"
                           }} />
                        </div>
                     )}
                </div>
                  {/* Submit Buttons */}
                  <div className="btn-row">
                    <button type="submit" className="primary-btn">{finalIsEditing ? "Update Profile" : "Create Bakery Profile"}</button>
                    <button type="button" className="cancel-btn" onClick={handleBack}>Cancel</button>
                  </div>

                </form>
            </div>

        </div>
    );
}