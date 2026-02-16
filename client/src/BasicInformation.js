import React, {useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft,FaEyeSlash, FaEye, FaPlus, FaTimes, FaUnlink, FaUpload } from "react-icons/fa";
import  "./App.css";
import imageCompression from 'browser-image-compression';

export default function BasicInformation({
    onProfileCreated = (data) => console.log("Chef Profile:", data),
    // editing feature ke liye
    initialData = null,
    isEditing = false,
}) {
    const navigate = useNavigate();
    const location = useLocation();

// new logic: isEditing ka antem maan Determined(nirdharit) kiya
// URL state se isEditing ko pdega (Jo App.js se { state: { isEditing: true } } ke ruup me bheja gya hai)
    const isEditingFromState = location.state?.isEditing;

// 2. Anteem maan: Yadi state me koi maan (true) hai, to usse use krega,
//    nhi to, Prop (isEditing)ka use krega (jo default ruup se false hai)
const finalIsEditing = isEditingFromState || isEditing;

    // LoginSignu page se userType get(prapet) kra yani(default 'chef' set kra mene)
    const userType = location.state?.userType || 'chef';

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password:"",
        location: "",
        role: "",
        experience: "",
        salaryExpectation: "",
        bio: "",
        skills: [],
        availability: "",
        photo: null,
        isAvailable: false,
    });

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [currentSkill, setCurrentSkill] = useState("");
    const [photoPreview, setPhotoPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const suggestedSkills = [
    "French Pastries", "Wedding Cakes", "Artisan Breads", "Sourdough", "Croissants",
    "Pizza Dough", "Cookies", "Muffins", "Danish Pastries", "Chocolate Work",
    "Sugar Art", "Cake Decoration", "Bread Making", "Customer Service", "Inventory Management"
    ];

    useEffect(() => {
        // Jab initialData pass kiya jata hai (yani, Edit mood me) to form ko phele se bherne ka Logic
        //  यहाँ हमने 'finalIsEditing' का चेक लगा दिया
        if (initialData && finalIsEditing) {
            setFormData({
                ...formData,
                ...initialData,
                // photo: initialData.photo || null,
                // name ko fullName me map kre taaki form load ho
                fullName: initialData.name || initialData.fullName || "", // name or fllName handle kra 
                email: initialData.email || "", // 👈 Edit mode ke liye
                // FIX: Agar DB mein contactEmail mein phone save hai, toh use yahan nikalein
                phone: initialData.phone || "",
                location: initialData.city || initialData.location || "",
                role: initialData.specialty || initialData.role || "",
                experience: initialData.experience || "",
               // hourlyRate ko salaryExpectation me map kre
               salaryExpectation: initialData.hourlyRate || initialData.salaryExpectation || "",
               bio: initialData.bio || "",
               // 🔥 Ye line add karo taaki edit karte waqt purani choice dikhe
               availability: initialData.availability || "",
               isAvailable: initialData.isAvailable ?? false,
               // 💡 सुरक्षित चेक: अगर skills स्ट्रिंग में आए तो उसे JSON.parse करें, वरना खाली [] दें
               skills: Array.isArray(initialData.skills)
              ? initialData.skills
              : (typeof initialData.skills === 'string' ? JSON.parse(initialData.skills) : [])
            });
            // Photo Preview ko bhi set kre (dummyChef me avatar URL hai)
            if (initialData.avatar && typeof initialData.avatar === 'string') {
                setPhotoPreview(initialData.avatar);
            }
        } else if (!finalIsEditing) {
            // 💡 अगर एडिटिंग नहीं है, तो फॉर्म को खाली कर दो (Rama के लिए)
            setFormData({
                fullName: "", email: "", phone: "", password: "", location: "", 
                role: "", experience: "", salaryExpectation: "", 
                bio: "", skills: [], availability: "", photo: null,
                isAvailable: false
            });
            setPhotoPreview(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData, finalIsEditing]); // dependency array में finalIsEditing ज़रूर लिखें

    // mene handleChange function or eske under logic likh diya ab me es logic ko use kr sakta hu bhout sari jagah
     const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        setError('');
        setSuccessMessage('');
     }   

    //  Back button or Cancel button ke liye navigation
    const handleBack = () => {
        if (finalIsEditing) {
            // agar hum form me Edit mod me hai to ChefDashboard page per bapes jayega
            navigate('/chefdashboard');
        } else {
            // agar hum new form bher rhe hai to LoginSignup page per bapes jayega
            navigate('/loginsignup', {state: {userType}});
        }
    // Loginsignup page per bheja, or saat me userType state ko bhi bheja
    // navigate('/loginsignup', { state: { userType } });
    };

    const handleAddSkill = () => {
     const s = currentSkill.trim();
     if (!s) return;
     if (formData.skills.includes(s)) {
        setCurrentSkill("");
        return;
     }
     setFormData((prev) => ({...prev, skills: [...prev.skills, s] }));
     setCurrentSkill("");
    };

    const handleRemoveSkill = (skill) => {
        setFormData((prev) => ({...prev, skills: prev.skills.filter((s) => s !== skill)}));
    };

    const validate = () => {
        // 1. (Required fields check)
        // ?. use karne se undefined ka khatra khatam
        if (!formData.fullName?.trim() || !formData.phone?.trim() || !formData.password?.trim()){
            setError("Full name, phone and password are required.");
            return false; 
        }

        // 2. (Password length check)
        if (formData.password.length < 6){
            setError("Password must be at least 6 characters long.");
            return false;
        }

        // 3. (Phone number check)
        if (!/^\d{10}$/ .test(formData.phone)){
            setError("Phone number must be exactly 10 digits.");
            return false;
        }

        // 4. (If everything is valid)
        setError("");
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        setError(""); // pichli error ko saaf kra 
        setSuccessMessage(""); // pichli success message ko saaf kra

        // 1. Safety Size Check (Render crash na ho isliye)
        if (formData.photo && formData.photo.size > 3 * 1024 * 1024) {
            setError("This photo is too complex. Please take a screenshot and upload that.");
            return;
        }

        // 2. Data Cleaning
        // Ek naya object banao bina contactEmail ke
        const cleanedData = { ...formData };
        // Agar email empty string hai, toh use field se hi uda do
        if (!cleanedData.email || cleanedData.email.trim() === "") {
            delete cleanedData.email;
        }
        delete cleanedData.contactEmail; // 👈 Safai abhi isi waqt!

        // 3. Background Processing (No Await)
        onProfileCreated(cleanedData, finalIsEditing)
        .then(() => {
            console.log("Chef Profile Processed!");
        })
        .catch((err) => {
            console.error("Upload Error:", err);
            // Agar asli error aaye toh alert dikhega
            alert("Update Failed: " + (err.response?.data?.message || err.message));
        });

        // 4. Instant Feedback & Navigation
        setSuccessMessage(finalIsEditing ? "Updating your profile..." : "Creating your profile...");

     // 2 second baad ChefDashboard per navigate kra 
        setTimeout(() => {
         navigate('/chefdashboard');
        }, 1500);
    };

    return (
        <div className="bi-container">
        <div className="bi-header">
            <button className="bi-back" onClick={handleBack}>
                <FaArrowLeft /> Back
            </button>
            <h1 className="bi-page-title">{finalIsEditing ? "Edit Your Profile" : "Create Your Professional Profile"}</h1>
        </div>
        <div className="bi-card">
            <div className="bi-card-header">
                <h2>{finalIsEditing ? "Edit Profile" : "Professional Profile"}</h2>
                <p className="bi-sub">
                    {finalIsEditing? "Update your professional information to attract potential employers"
                    : "Create a compelling profile to showcase your bakery skills and attract potential employers"}
                </p>
            </div>

            {/* Error and Success Messages */}
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <form className="bi-form" onSubmit={handleSubmit}>
                {/* Basic Information */}
                <section>
                    <h3 className="bi-section-title">Basic Information</h3>
                    <div className="bi-grid-2">
                        <div>
                            <label>Full Name</label>
                            <input type="text" name="fullName" value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required/>
                        </div>

                        <div>
                            <label>Email (Optional)</label>
                            <input type="email" name="email" value={formData.email}
                            onChange={handleChange} placeholder="your.email@example.com"
                            // yha hum 'required' ka use nhi krge kyuki hume email optional chiye 
                            /> 
                        </div>

                        <div>
                         <label>Phone</label>
                         <input type="tel" name="phone" value={formData.phone}
                         onChange={handleChange}
                         placeholder="(555) 123-4567" required/>
                        </div>

                        <div>
                            <label>Password</label>
                            <div className="password-wrapper">
                                <input type={showPassword ? "text" : "password"} name="password" value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password (min 6 characters)" required/>

                                <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash/> : <FaEye/>}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label>Location</label>
                            <input type="text" name="location" value={formData.location}
                            onChange={handleChange}
                            placeholder="City, State" required/>
                        </div>
                    </div>
                </section>

                {/* Professional Information */}
                <section>
                    <h3 className="bi-section-title">Professional Information</h3>
                    <div className="bi-grid-2">
                        <div>
                            <label>Role</label>
                            <select name="role" value={formData.role}
                             onChange={handleChange} required>
                             <option value="">Select your role</option>
                             <option value="Chef">Chef</option>
                             <option value="Helper">Helper</option>
                             </select>
                        </div>

                        <div>
                            <label>Years of Experience</label>
                            <select name="experience" value={formData.experience}
                            onChange={handleChange} required>
                                <option value="">Select experience</option>
                                <option value="0-1 years">0-1 years</option>
                                <option value="2-3 years">2-3 years</option>
                                <option value="4+ years">4+ years</option>
                            </select>
                        </div>

                        <div>
                            <label>salary Expectation</label>
                            <input type="text" name="salaryExpectation" value={formData.salaryExpectation}
                            onChange={handleChange}
                            placeholder="/month" required/>
                        </div>

                        <div>
                            <label>Availability</label>
                            <select name="availability" value={formData.availability}
                            onChange={handleChange} required>
                             <option value="">Select availability</option>
                             <option value="Full-time">Full-time</option>
                             <option value="Part-time">Part-time</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Bio */}
                <section>
                    <label className="bi-label">Professional Bio</label>
                    <textarea rows="4" name="bio" value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell potential employers about your passion for baking, your experience, and what makes you unique..."/>
                </section>

                {/* Skills */}
                <section>
                    <h3 className="bi-section-title">Skills & Specialties</h3>
                    <div className="bi-skill-row">
                        <input type="text" value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        placeholder="Add a skill..." 
                       onKeyPress = {(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}/>
                       <button type="button" className="bi-add-btn" onClick={handleAddSkill}>
                        <FaPlus/>
                       </button>
                    </div>

                    <div className="bi-skills-list">
                        {Array.isArray(formData.skills) && formData.skills.map((s, i) => (
                            <span className="bi-skill-tag" key={i}>
                                {s}
                                <FaTimes className="bi-skill-remove" onClick={() => handleRemoveSkill(s)}/>
                            </span>
                        ))}
                    </div> 

                    <p className="bi-suggest-title">Suggested skills:</p>
                    <div className="bi-suggest-list">
                        {suggestedSkills
                          .filter((sk) => Array.isArray(formData.skills) && !formData.skills.includes(sk))
                          .slice(0, 10)
                          .map((sk, idx) => (
                            <button type="button" key={idx} className="bi-suggest-btn"
                              onClick={() => setFormData((p) => ({...p, skills: [...p.skills, sk] }))}>
                                + {sk}
                              </button>
                          ))}
                    </div>
                </section>

                {/* Photo Upload */}
                <section>
                    <label className="bi-label">Profile Photo</label>
                    <div className="bi-upload-box">
                        <FaUpload className="bi-upload-icon"/>
                        <p className="bi-upload-text">Upload your profile photo</p>

                        {/* hidden file input */}
                        <input type="file" id="uploadProfilePhoto" accept="image/*" style={{display: "none"}}
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            setError('');
                            setSuccessMessage('');

                          // 1. Compression Options Set Kiya
                             const options = {
                                maxSizeMB: 0.5,   // 1MB se kam kiya taaki AI image heavy na pade
                                maxWidthOrHeight: 800,  // Dimension thoda chota kiya fast processing ke liye
                                useWebWorker: true,    // Background mein kaam karega (App slow nahi hoga)
                                initialQuality: 0.6,  // Quality thodi kam rakhi taaki compression loop na fase
                                preserveExif: false //  Naya: AI image ka extra data delete karega
                            };

                             try {
                                // Backup: Pehle se asli file ko hi 'fileToUpload' maan lo
                                let fileToUpload = file;

                             try {
                                // 2. Compression try karo
                                const compressedFile = await imageCompression(file, options);
                                fileToUpload = compressedFile; // Agar success hua toh compressed file
                                console.log("Compression success!");
                            } catch (compressionErr) {
                                // Sabse Zaruri: Agar AI image ki wajah se compression fail ho,
                                // toh ye crash nahi hoga, seedha asli file upload hogi.
                                console.warn("Compression failed, using original file:", compressionErr);
                            }
                                
                               // 3. Purana Preview URL agar hai to band (Revoke) kra
                               if (photoPreview && photoPreview.startsWith('blob:')) {
                                    URL.revokeObjectURL(photoPreview);
                                }

                                // 4. State update (Hamesha fileToUpload use karein)
                                setFormData({ ...formData, photo: fileToUpload });
                                setPhotoPreview(URL.createObjectURL(fileToUpload));

                                } catch (err) {
                                    console.error("Main Error:", err);
                                    setError("Photo process karne mein dikkat aayi.");
                              }
                        
                        }}/>
                        {/* button trigger */}
                        <label htmlFor="uploadProfilePhoto" className="bi-upload-btn">
                            Choose Photo
                        </label>

                        {/* Image Preview */}
                        {photoPreview && (
                            <div style={{marginTop: "15px"}}>
                                <img 
                                src={photoPreview}
                                alt="Preview"
                                style={{
                                    width: "100%",
                                    maxHeight: "250px",
                                    objectFit: "contain",
                                    borderRadius: "10px",
                                    border: "1px solid #ddd"
                                }}
                                />
                              </div>
                        )}
                    </div>

                </section>

                {/* Error */}
                {/* {error && <div className="bi-error">{error}</div>} */}

                {/* Buttons */}
                <div className="bi-btn-row">
                    <button type="submit" className="bi-primary">
                        {finalIsEditing? "Update Profile" : "Create Profile"}
                    </button>
                    <button type="button" className="bi-secondary" onClick={handleBack}>
                         Cancel
                    </button>
                </div>
            </form>
        </div>
        </div>
    );
}