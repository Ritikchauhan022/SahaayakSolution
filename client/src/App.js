import React, {useState} from "react";
import { useEffect } from "react";
import { useLocation } from 'react-router-dom';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate, isCookie } from 'react-router-dom';
import LandingPage from './LandingPage';
import LoginSignup from "./LoginSignup";
import OwnerInformation from "./OwnerInformation";
import OwnerDashboard from "./OwnerDashboard";
import BasicInformation from "./BasicInformation";
import ChefDashboard from "./ChefDashboard";
import AvailableProfessionals from "./AvailableProfessionals";
import PaymentModal from "./PaymentModal";
import io from 'socket.io-client'; // 👈 Ye add karo
import LegalPage from './LegalPage';
import Footer from './Footer';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Razorpay ke liye mandatory content
const policies = {
 privacy: `At Sahaayak Solution, we value your trust. Our Privacy Policy explains how we handle your data:

1. **Information Collection**: We collect basic information like name, phone number, and email to facilitate the connection between bakery owners and chefs.
2. **Data Sharing**: Your contact details are only shared with authorized bakery owners after a successful payment transaction. We do not sell or rent your data to third parties for marketing.
3. **Data Security**: We use industry-standard security measures and encryption to protect your information from unauthorized access or theft.
4. **Cookies**: We use basic cookies to improve your browsing experience and remember your login session for a smoother interface.
5. **Third-Party Services**: We use secure payment gateways (like Razorpay) to process payments. We do not store your credit card or bank details on our servers.
6. **User Rights**: You have the right to request the deletion of your account and personal data from our platform at any time by contacting our support.`,
  terms: `1. **Introduction**: Sahaayak Solution is a platform to discover and connect with bakery professionals.
2. **User Eligibility**: By using this platform, you confirm that you are at least 18 years of age.
3. **Payments**: Owners must pay a one-time fee of ₹500 to unlock a specific professional's contact details. This fee is for information access only.
4. **Account Security**: Users are responsible for maintaining the confidentiality of their account; please do not share your password with anyone.
5. **Prohibited Conduct**: Any misuse of the platform, data scraping, or harassment of professionals will lead to permanent account suspension.
6. **Limitation of Liability**: The information provided by chefs is self-declared. Sahaayak Solution only facilitates connections and is not liable for any disputes, conduct, or service quality issues after hiring.
7. **Verification**: Owners are strongly advised to verify credentials and references before hiring any professional.`,
  refund: `1. **Nature of Service**: Sahaayak Solution provides digital information services (unlocking professional contact details). Once the contact details are accessed or unlocked, the service is considered 'consumed'.
2. **No-Refund Policy**: Due to the digital nature of our service, we do not offer any refunds once a contact has been successfully unlocked on your dashboard.
3. **Failed Transactions**: In cases where the amount is deducted from your bank account but the contact remains locked, the amount will be automatically refunded to your original payment method within 5-7 business days.
4. **Dispute Resolution**: For any payment-related issues, please contact our support team with your Transaction ID and Registered Phone Number. We aim to resolve all queries within 48 hours.`,
  shipping: `1. **Digital Service**: Sahaayak Solution is a digital-only platform. We do not deal in physical goods; therefore, no physical shipping or courier service is involved.
2. **Method of Delivery**: The 'Delivery' of our service (Chef's contact information) is provided digitally and instantly on your Owner Dashboard upon successful payment confirmation.
3. **Delivery Timeline**: Access is immediate. There is no waiting period or shipping time. If you face any delay in access after payment, please refresh your dashboard or contact support.
4. **Order Confirmation**: You will receive an automated email and/or SMS confirmation for every successful unlock, which serves as the electronic proof of delivery for our service.`,
}
// 1. Socket connection initialize karein
// 👈 Import ke BAAD initialize karein aur transport force karein
const socket = io(API_BASE_URL,
   { transports: ["websocket"] // 👈 Ye polling ko disable kar dega
   }); 

// 1. AppRoutes component bnaya jo useNavigate ka use kre
function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  // es logic se footer ke ya kesi bhi link per click krne se page ke top per puchega user
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const [selectedProfessional, setSelectedProfessional] = useState(null);

// ----------------------------------------------------
// OwnerDashboard ke liye Prop Handlers
// ----------------------------------------------------

const handleOwnerLogout = () => {
  // 1. Browser ki memory saaf karo
  localStorage.removeItem("userPhone"); // Phone hatao
  localStorage.removeItem("userType");  // Type hatao
  // 2. React ki state saaf karo (Purana data hatane ke liye)
  setCurrentOwnerProfile(initialOwnerData); // State khali karo Zaruri
  // Log out ka logic: state clear krna, token htana, etc
  navigate('/'); // LandingPage per navigate
};

// "Refreshed Profile" के लिए एक "Loading" स्टेट जोड़ें
const [isLoading, setIsLoading] = useState(true); 

// PaymentModal ke liye
const handleUnlockContact = (professional) => {
  console.log("App.js → selectedProfessional set:", professional);
  setSelectedProfessional(professional);
};

// ye function Backend API ko batayega ki "Bhai, owner ne paise de diye hain, ab chef ka contact dikha do."
const handlePaymentSuccess = async () => {
  if (!selectedProfessional || !currentOwnerProfile.phone) return;

  try{
    const response = await fetch(`${API_BASE_URL}/api/owner/unlock-chef`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        ownerPhone: currentOwnerProfile.phone, // Kaun unlock kar raha hai
        chefId: selectedProfessional.id   // Kisko unlock kar raha hai
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Unlock Success! Updated List:", result.unlockedChefs);

      // Backend se jo list aayi hai use string mein convert karke save karein
     // Taaki ID matching mein koi panga na ho
      const updatedList = result.unlockedChefs.map(id => String(id));
     // 1. Owner ki frontend state update karo taaki contact turant dikh jaye
     setCurrentOwnerProfile(prev => ({
      ...prev,
      unlockedChefs: updatedList // Backend se updated list aayegi
     }));

     alert("Success! Contact Unlocked.");
    }
  } catch (err) {
    console.error("Payment error:", err);
    alert("Something went wrong while unlocking!");
  } finally {
    setSelectedProfessional(null); //Modal band kar do
  }
};


const handleSearchProfessionals = () => {
  // Available Professionals page per navigate, viewerType 'owner' ke saat
  navigate('/professionals/owner');
};

const handleEditProfile = () => {
  // Editing Mode me OwnerInformation page per navigate
  navigate('/ownerinfo', {state: {isEditing: true}});
  //Note: '/ownerinfo' path ka use kiya hai 
};

const initialChefData = {
  name: "",
  avatar: null,
  role: "Bakery Chef",
  rating: 4.8,
  //email: "ritik@gmail.com",
  phone: "",
  location: "",
  experience: "3 years",
  hourlyRate: "",
  availability: "Full Time / Immediate Joiner",
  lookingForWork: false,
  isAvailable: false,
  skills: ["Cake decoration", "Chocolate work", "Pastry chef"],
  bio: "Experienced bakery chef specializing in premium cakes and pastries."
};

// 💡 Chef ke data ko state me rakhe
const [currentChefProfile, setCurrentChefProfile] = useState(initialChefData);
const [allChefs, setAllChefs] = useState([]); // डेटाबेस के सारे शेफ यहाँ रहेंगे

//useEffect me hum ab Polling ke jagah webSocket ka use kr rhe hai 
useEffect(() => {
  // 1. Pehli baar mein saare chefs le aao
  // 1. Data laane wala function
const fetchAllChefs = async () => {
  try{
    const response = await fetch(`${API_BASE_URL}/api/chefs`); // पक्का करें कि बैकएंड में ये रूट है
    if (response.ok) {
      const data = await response.json();
      setAllChefs(data); // Ye state update hote hi Owner ka page badal jayega
      console.log("Real-time Sync: Marketplace Updated!");
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
};
 
// 2. Initial Fetch: Page load hote hi data laye
fetchAllChefs();

// SOCKET LISTENERS: Ab polling ki zaroorat nahi!
socket.on('marketplace_update', (updateData) => {
  console.log("Signal Received from Server:", updateData);

  // AGAR: Profile Update hui hai (Naam, City, etc. badla hai)
  if (updateData.type === 'PROFILE_UPDATE' && updateData.chefData) {
    console.log("Optimized Update: Patching single chef in list");

    setAllChefs((prevChefs) =>
      prevChefs.map((chef) =>
        // Agar ID match ho gayi, toh purane data mein naya data merge kar do
    chef._id === updateData.chefId ? { ...chef, ...updateData.chefData } : chef
    )
      );
    }
    // AGAR: Kisi ne Availability Toggle ki hai (Radha stop/start looking)
    else {
      console.log("General Update: Re-fetching list for safety");
      fetchAllChefs(); // Jaise hi signal mile, data refresh kar lo // Bina refresh ke data fetch karega
    }
});

// Clean up
return () => {
  socket.off('marketplace_update');
};
}, []);


useEffect(()=> {
const syncLoggedInUser = async () => {
// 1. चेक करें कि क्या LocalStorage में फ़ोन नंबर है
const savedPhone = localStorage.getItem("userPhone");
const savedType = localStorage.getItem("userType");

/// सुधार: अगर फोन नंबर मौजूद नहीं है, तो रिक्वेस्ट मत भेजो
if (!savedPhone || savedPhone === "undefined" || savedPhone === null) {
    setIsLoading(false);
    return;
  }

try{
  // 1. सबसे पहले Chef API को चेक करें
  // बैकएंड से इस फोन नंबर की प्रोफाइल मंगवाएं yani बैकएंड से डेटा मंगवाएं
  // नोट: हमने 'contactEmail' में फोन सेव किया था, तो वही पैरामीटर भेजेंगे
  // Naya Universal Route call karein (Ek hi call mein kaam khatam)<- ye logic use ho rha hai ab
  const response = await fetch(`${API_BASE_URL}/api/user/sync/${savedPhone}`);
  // यहाँ हमने update वाला ही route use कर लिया क्योंकि वो एक Chef का डेटा देता है

  // अगर रिस्पॉन्स OK है, तभी डेटा प्रोसेस करें
  if (response.ok) {
    const result = await response.json();
    // result.type aur result.data backend se aa rahe hain
    handleLoginSuccess(result.data, result.type);
    
  }
  }catch (err) {
    console.error("Session sync failed:", err);
  } finally {
    setIsLoading(false);
  }
  };
 
  syncLoggedInUser();
}, []); // खाली ऐरे मतलब यह सिर्फ पेज लोड/रिफ्रेश पर चलेगा

const initialOwnerData = {
businessName: "", // OwnerInformation: bakeryName
ownerName: "",       // OwnerInformation: fullName
phone: "",
email: "",
location: "",
bakeryWork: "",
yearEstablished: "",
profilePic: null, // Dummy link htaya or Null kiya mene  
activeSubscription: true
};

// Owner ke data ko state me rkhe
const [currentOwnerProfile, setCurrentOwnerProfile] = useState(initialOwnerData);

// ChefDashboard ke liye Prop Handlers (New)
const handleChefLogout = () => {
  // 1. Browser ki memory saaf karo
  localStorage.removeItem("userPhone");
  localStorage.removeItem("userType");
  // 2. React ki state saaf karo (Purana data hatane ke liye)
  setCurrentChefProfile(initialChefData); // State khali karo 👈 Zaruri
  // Chef Logout ka logic: state clear krna, token htana, etc.
  navigate('/'); // LandingPage per navigate
};

 const handleUpdateChefProfile = async (newProfileData, isEditingMode) => { //  isEditingMode जोड़ा
  console.log("Processing Profile... Mode:", isEditingMode ? "Update" : "Create");
  // 1. Pehle data ko clean karo
  const cleanedData = { ...newProfileData };

  // Hum email tabhi delete karenge jab hum REGISTER kar rahe hon.
 // UPDATE ke time par agar user ne email dala hai, toh use rehne do.
 if (!isEditingMode) {
  if (!cleanedData.email || String(cleanedData.email).trim() === "") {
    delete cleanedData.email;
  }
  } else {
    // Agar Edit mode hai aur user ne email box mein kuch likha hai
    if (cleanedData.email && String(cleanedData.email).trim() !== "") {
    cleanedData.email = cleanedData.email.trim()
  }
  // Agar user ne email delete kar diya hai (khali kar diya), toh use null ya "" bhejo
  else{
    // "" ki jagah null bhejo, isse sparse index kabhi mana nahi karega
    cleanedData.email = null;
  }
}
   
  delete cleanedData.contactEmail;
  
// नया ऑब्जेक्ट बनाएं जिसमें डिफ़ॉल्ट स्टेटस हो
const finalSubmissionData = {
  ...cleanedData,
  // अगर एडिटिंग नहीं है (यानी नई प्रोफाइल है), तो स्टेटस को हमेशा false भेजें
  isAvailable: isEditingMode ? cleanedData.isAvailable : false
};


  // 1. FormData तैयार करें (क्योंकि इसमें फोटो हो सकती है)
  const formData = new FormData();

  // सभी फील्ड्स को FormData में डालें // अब finalSubmissionData का उपयोग करें
  for (const key in finalSubmissionData) {
    // Pehle check karo ki key exist karti hai ya nahi (Safety Check)
    if (Object.prototype.hasOwnProperty.call(finalSubmissionData, key)) {
      const value = finalSubmissionData[key];

      // 💡 SABSE ZARURI CHECK:
      // Agar value null hai, undefined hai, ya password khali hai (Edit mode mein delete ho gaya),
      // toh usse FormData mein append MAT KARO.
      if (value === null || value === undefined) continue;
    // Agar frontend se galti se contactEmail key aa rahi hai toh use skip karo
    if (key === 'contactEmail') continue;

    //  Append logic
    if (key === 'photo' && value instanceof File) {
      formData.append('photo', value);
    } else if (key === 'skills') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  }
}
  try {
    //  अब हम isEditingMode के आधार पर फैसला लेंगे
    // MAIN LOGIC: यहाँ तय करेंगे कि Register करना है या Update
    // 2. Backend API को कॉल करें (PUT Request)
    // हमने server.js में email/phone को ID माना है
    // const isNewProfile = !currentChefProfile.phone || currentChefProfile.phone === ""; // abhi cut kruga esse
    //Identifier check: Use cleanedData.phone instead of newProfileData.phone
    // Naya Updated Code
    const identifier = isEditingMode 
    ? (currentChefProfile._id || currentChefProfile.phone || currentChefProfile.email)
    : (cleanedData.phone || cleanedData.email);
    console.log("Chef Identifier (Using ID/Phone/Email):", identifier);

  // Ek extra safety check:
  if (!identifier) {
    alert("Error: Identifier not found. Please login again.");
    return;
  }
  console.log("Final Identifier being sent:", identifier);
    const API_URL = isEditingMode 
      ? `${API_BASE_URL}/api/chef/update/${identifier}`  // update krne ke liye
      : `${API_BASE_URL}/api/chef/register`; //new bnane ke liye

    const response = await fetch(API_URL, {
      method: isEditingMode ? "PUT" : "POST",
      body: formData,
    });
    
    if (response.ok) {
      const result = await response.json();
      const savedChef = result.chef || result.user; //Backend से आया असली डेटा

      // 1. Sabse pehle LocalStorage ko naye phone se update karo (Zaruri hai!)
      if (savedChef.phone) {
        localStorage.setItem("userPhone", savedChef.phone);
        localStorage.setItem("userType", "chef"); 
        }

      // FIX: Hamesha Phone ko priority do, kyunki humne Dashboard par
      // Toggle ke liye bhi Phone ko hi pehli priority di hai.

      // 1. LocalStorage update karo taaki refresh pe naya number hi rahe
      // if (savedChef.phone) {
      //   localStorage.setItem("userPhone", savedChef.phone);
      // }

      // localStorage.setItem("userPhone", savedChef.phone); // Phone number save hua
      //localStorage.setItem("userType", "chef");           // Role save hua taaki refresh pe panga na ho

      // refres krne per profile hat ke dusri profile na aaye jo hai boi rhe 
      // localStorage.setItem("userPhone", savedChef.contactEmail || savedChef.phone);

      // Frontend State को अपडेट करें ताकि Dashboard पर असली डेटा दिखे
      // Hum wahi mapping use karenge jo humne 'handleLoginSuccess' mein ki hai
      // 2. Mapping mein double check karo
      const finalProfileData = {
        ...initialChefData, // Hamesha clean start karo
        ...currentChefProfile, // Purana data rakho
        ...savedChef, //Backend से आया असली डेटा // Naya data jo backend se aaya wo dalo
        _id: savedChef._id, // 👈 यह लाइन पक्का करें ताकि 'currentChefId' सही रहे
        phone: savedChef.phone,
        // Dashboard 'fullName' aur 'name' dono mangta hai, hum dono ko update karenge
        fullName: savedChef.fullName || savedChef.name,
        name: savedChef.fullName || savedChef.name,
        //  Kaam (Specialty) ki Double Safety
        role: savedChef.specialty || savedChef.role,
        specialty: savedChef.specialty || savedChef.role,
        //  Daam (Salary) ki Double Safety
       hourlyRate: savedChef.salaryExpectation || savedChef.hourlyRate,
       salaryExpectation: savedChef.salaryExpectation || savedChef.hourlyRate,
        // अगर ये नई प्रोफाइल है (!isEditingMode), तो इसे पक्का false रखें
        isAvailable: isEditingMode ? savedChef.isAvailable : false,
        // 🔥 CLOUDINARY FIX: Agar image path hai, toh check karo wo URL hai ya local path
     avatar: savedChef.avatarPath && savedChef.avatarPath.includes('cloudinary.com') 
     ? savedChef.avatarPath 
     : (savedChef.avatarPath ? `${API_BASE_URL}/${savedChef.avatarPath.replace(/\\/g, '/')}` : null),
      };

      setCurrentChefProfile(finalProfileData);
      // alert("Profile Updated Successfully!");
      // isEditingMode का उल्टा मतलब है कि प्रोफाइल नई है (New Profile)
      console.log(!isEditingMode ? "Profile Created!" : "Profile Updated!", savedChef);

     // Marketplace ki list ko turant update kr rha hai
     setAllChefs((prevChefs) =>
      prevChefs.map((chef) =>
      // Agar ID match ho gayi, toh purane data ki jagah naya 'savedChef' daal dege hum
     (chef._id === savedChef._id || chef.id === savedChef._id)
     ? { ...chef, ...savedChef }
     : chef
     )
     );

      // 4. डैशबोर्ड पर भेजें
      navigate('/chefdashboard');
    } else {
       const errorData = await response.json();
       alert("Server Message: " + errorData.message);
    }
  } catch (err) {
    console.error("Network Error:", err);
    alert("Connection error!");
  }
 };

 // लॉगिन सफल होने पर प्रोफाइल डेटा को स्टेट में भरने के लिए
 // --- LOGIN SUCCESS HANDLER (Universal) ---
 const handleLoginSuccess = (userData, type = 'chef') => {
  console.log(`Login Success! User Type: ${type}`, userData); // Data check krne ke liye
  if (!userData) return;

  // Naya temporary object banao bina contactEmail ke
  const cleanUserData = { ...userData };
  delete cleanUserData.contactEmail; // Frontend state clean

  if (type === 'chef') {
  
 const finalProfileData = {
  ...initialChefData, // Dummy Structure लें
  ...cleanUserData, // Ab clean data use karo
  // ...userData,  // डेटाबेस का डेटा इसके ऊपर डालें  // userData ki jgah mene cleanUserDatat use kiya hai
  _id: cleanUserData._id, // Har jagah cleanUserData use karo
  fullName: cleanUserData.name || cleanUserData.fullName, // Dashboard name mangta hai, DB mein 'name' hai
  // Logic: Agar data mein 'phone' hai toh wo lo, nahi toh 'contactEmail' lo
  phone: cleanUserData.phone || "",
  email: cleanUserData.email || "",
  location: cleanUserData.city || cleanUserData.location || "Location not set",
  role: cleanUserData.specialty || "Bakery Chef",
  hourlyRate: cleanUserData.salaryExpectation || "0",
  isAvailable:cleanUserData.isAvailable ?? false,
   avatar: cleanUserData.avatarPath && cleanUserData.avatarPath.includes('cloudinary.com')
   ? cleanUserData.avatarPath
   : (cleanUserData.avatarPath ? `${API_BASE_URL}/${cleanUserData.avatarPath.replace(/\\/g, '/')}` : null),
  };
 setCurrentChefProfile(finalProfileData); // अब स्टेट में असली "Ganesha" का डेटा सेट होगा
 }
 else if (type === 'owner') {
  const finalOwnerData = {
 ...initialOwnerData, // ओनर का डमी स्ट्रक्चर लें
 ...userData, // डेटाबेस का असली डेटा इसके ऊपर डालें

   //मैपिंग: डेटाबेस की Keys को डैशबोर्ड की Keys से मिलाना
    ownerName: userData.ownerName || userData.fullName || "Owner",
    businessName: userData.businessName || userData.bakeryName || "Bakery Name",
    phone: userData.phone,
    email: userData.email,
    location: userData.location || "Location not set",

    // फोटो पाथ को सही URL में बदलना
    profilePic: userData.profilePic && userData.profilePic.includes('cloudinary.com')
  ? userData.profilePic
  : (userData.profilePic ? `${API_BASE_URL}/${userData.profilePic.replace(/\\/g, '/')}` : null),
  };
  setCurrentOwnerProfile(finalOwnerData); //ओनर की स्टेट अपडेट करें
 }
};


// 1. Parameter ka naam thoda badal do (id) taaki collision na ho
 const handleToggleAvailability = async (id, currentStatus) => { // yha identifier ko id kr diya hai 
  // 2. Ab yahan check karo: agar id (parameter) hai toh wo lo,
  // nahi toh state se phone ya email uthao
  // Taaki agar ek cheez missing ho toh doosri kaam kar jaye.
  const identifier = id || currentChefProfile.phone || currentChefProfile.email;
  if(!identifier){
    console.error("Error: No identifier (Phone/Email) found for toggle!");
    return;
  }

  // FORCE CONVERSION: Taaki true/false hi jaye, string na jaye
  const newStatus = !Boolean(currentStatus);

  try {
    console.log(`Sending update for ${identifier}. Old: ${currentStatus}, New: ${newStatus}`);
    // Backend ko ab hum identifier bhejenge (Atul ke liye phone jayega, VK ke liye email)
    const response = await fetch(`${API_BASE_URL}/api/chef/toggle-status/${identifier}`, {
     method: "PATCH", // Patch use karein kyunki hum sirf ek field badal rahe hain
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ isAvailable: newStatus }) // स्टेटस को उल्टा कर रहे हैं // Naya status toggle ho raha hai
    });

    if (response.ok) {
      const result = await response.json();
      // Sirf apna dashboard status badlo
      // Frontend की राधा वाली प्रोफाइल को अपडेट करें
      // 1. Chef ki dashboard profile update karo (Dashboard Button ke liye)
      // Server se jo 'chef' object wapas aaya hai, usse state update karein
      setCurrentChefProfile(prev => ({ 
        ...prev, 
        isAvailable: result.chef.isAvailable
       }));
      // Note: setAllChefs yahan se hata diya hai.
      // Kyunki Socket server ko signal bhejega aur App.js ka useEffect
      // apne aap fetchAllChefs() chala kar poori list update kar dega.
     console.log("Status update request success! New Status:", result.chef.isAvailable);
      } else {
     console.error("Server Error:", response.status);
      }
  } catch (err) {
     console.error("Toggle Error:", err);
     }
};
        
 const handleUpdateOwnerProfile = async (newProfileData) => {
  console.log("Owner Profile Updated! New Data:", newProfileData);
// check kro ki ye Editmode hai ya nhi (agar mughe need hai to me OwnerInformation se isEditing pass kr sakta hu )
  const isEditingMode = !!location.state?.isEditing;

  // 1. 🔥 CLEANING LOGIC: Khali email ko delete karo
  const cleanedData = { ...newProfileData };

  if (!isEditingMode) {
  // Naya Register karte waqt agar email khali hai toh poora field uda do
  if (!cleanedData.email || String(cleanedData.email).trim() === "") {
    delete cleanedData.email;
    console.log("Registration: Email removed to avoid unique index conflict");
  }
} else {
  // Edit mode mein email trim karo ya agar khali hai toh "" bhejo
  if (cleanedData.email && String(cleanedData.email).trim() !== "") {
      cleanedData.email = cleanedData.email.trim();
    } else {
      // Agar user ne email delete kar diya hai (khali kar diya)
      // "" ki jagah null bhejo, isse sparse index kabhi mana nahi karega
      cleanedData.email = null;
    }
  }

  const formData = new FormData();

  for (const key in cleanedData) { // 👈 Dhayan de: cleanedData use ho rha hai
    // 1. Safety Guard: Sirf apni asli keys uthao
    if (Object.prototype.hasOwnProperty.call(cleanedData, key)) {
      const value = cleanedData[key]; // Baar-baar cleanedData[key] likhne se bachne ke liye variable bana liya

      // 2. Password/Undefined Guard: 🛑 SABSE ZARURI
      if (value === null || value === undefined) continue;

      // 3. Mapping logic
    // ध्यान दें: 'photo' (जो फॉर्म से आता है) को 'profilePic' (जो बैकएंड चाहता है) में बदलें
     if ((key === 'photo' || key === 'profilePic') && value instanceof File) {
      formData.append('profilePic', value);
     } else {
      formData.append(key, value);
     }
  }
}

  try{
    // 🔥 MAGIC STEP: Chef ki tarah yahan bhi current state se identifier uthao
    // Taaki agar user phone badal bhi de, toh hum use purane phone/email se dhoond sakein
   const identifier = isEditingMode 
  ? (currentOwnerProfile._id || currentOwnerProfile.phone || currentOwnerProfile.email)
  : (cleanedData.phone || cleanedData.email);
  // 2. 🔥 Safety Check (Owner ke liye bhi zaroori hai)
  if (!identifier) {
    alert("Error: Owner identifier not found. Please login again.");
    return;
  }
    const API_URL = isEditingMode ? `${API_BASE_URL}/api/owner/update/${identifier}`
    : `${API_BASE_URL}/api/owner/register`;

    const response = await fetch(API_URL, {
         method: isEditingMode ? "PUT" : "POST",
         body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      const savedOwner = result.owner;

      // Save phone for refresh persistence
      // LocalStorage अपडेट करें ताकि रिफ्रेश पर यही यूजर लोड हो
      localStorage.setItem("userPhone", savedOwner.phone);
      localStorage.setItem("userType", "owner"); // Refresh persistence ke liye

      // State Update: Dashboard ko seedha DB wala data bhej rahe hain
      const finalOwnerData = {
        // ...currentOwnerProfile, // ...currentOwnerProfile को यहाँ से हटा दिया ताकि 'अमित शर्मा' वाला डेटा डिलीट हो जाए
        ...savedOwner,
        // मैपिंग पक्की करें ताकि Dashboard को सही Keys मिलें
        ownerName: savedOwner.ownerName || savedOwner.fullName,
        businessName: savedOwner.businessName || savedOwner.bakeryName,
        phone: savedOwner.phone,
        // फोटो पाथ को URL में बदलें
        // 🛑 DUMMY LINK HATAYA: Agar pic nahi hai toh null bhejo taaki Dashboard initials dikha sake
      profilePic: savedOwner.profilePic && savedOwner.profilePic.includes('cloudinary.com')
  ? savedOwner.profilePic
  : (savedOwner.profilePic ? `${API_BASE_URL}/${savedOwner.profilePic.replace(/\\/g, '/')}` : null),

        activeSubscription: savedOwner.activeSubscription ?? true
      };

      setCurrentOwnerProfile(finalOwnerData);
      navigate('/ownerdashboard');
    } else {
      const errorData = await response.json();
      alert("Error: " + (errorData.message || "Operation failed"));
    }
  } catch (err) {
    console.error("Critical Network Error:", err);
    alert("Could not connect to the server. Please check your internet connection.");
  }
};

const handleChefEditProfile = () => {
  // Chef ki profile 'BasicInformation' page se banti hai, isliye wahan navigate krenge.
 navigate('/basicinfo' , { state: {isEditing: true }});
};

const handleWatchProfile = () => {
  // Chef ko Marketplace View page per bheja mene 
  navigate('/professionals/chef');
};

// AvailableProfessionals navigate code
const handleBackToDashboard = (viewerType) => {
  console.log("Navigating back to dashboard for viewer:", viewerType);
  if (viewerType === 'owner') {
    navigate('/ownerdashboard'); // owner ko OwnerDashboard per bheja
  } else if (viewerType === 'chef') {
    navigate('/chefdashboard'); // chef ko ChefDashboard per bheja
  } else {
    navigate('/'); // yadi koi Role define na ho, TO Landing Page per bheja
  }
};

// Footer.js liye logic yha se
// 1. Current location check karne ke liye (useLocation upar already defined hai)
// 2. Un 5 pages ki list jahan Footer dikhana hai
const footerPages = [
  '/',
  '/privacy-policy',
  '/terms-conditions',
  '/refund-policy',
  '/shipping-policy'
];

// 3. Check karo ki current page list mein hai ya nahi
const shouldShowFooter = footerPages.includes(location.pathname);

  return (
    <>
      <Routes>
    <Route path="/" element={ <LandingPage/> } />
    {/* --- Legal Routes Start --- */}
    <Route path="/privacy-policy" element={<LegalPage title="Privacy Policy" content={policies.privacy} />} />
    <Route path="/terms-conditions" element={<LegalPage title="Terms & Conditions" content={policies.terms} />} />
    <Route path="/refund-policy" element={<LegalPage title="Refund & Cancellation" content={policies.refund} />} />
    <Route path="/shipping-policy" element={<LegalPage title="Shipping & Delivery" content={policies.shipping} />} />

    <Route path="/loginsignup" element={<LoginSignup onBack = {() => navigate('/')} onLoginSuccess={handleLoginSuccess}/>} />
    <Route path="/ownerinfo" element={<OwnerInformation
    // FIX: onProfileCreated handler pass kra
    onProfileCreated={handleUpdateOwnerProfile}
    // FIX: Form ko प्री-फिल(form ko phele se bherne ke liye Data) krne ke liye initialData pass kra
    initialData={currentOwnerProfile}
    />} />
    <Route path="/basicinfo" element={<BasicInformation 
  // new data handler
  onProfileCreated={handleUpdateChefProfile}
  // Form ko phele se bherne ke liye Data
  initialData={currentChefProfile}
  // isEditing={currentChefProfile.phone ? true : false} // 💡 ये लाइन जोड़े
  isEditing={!!location.state?.isEditing}
  />} />

    {/* Owner Dashboard - Props yha pass kiye ye hai*/}
    <Route path="/ownerdashboard" element={<OwnerDashboard userProfile={currentOwnerProfile}
    onBackToLanding={handleOwnerLogout} // Logout
    onSearchProfessionals={handleSearchProfessionals} // Browse Professionals
    onEditProfile={handleEditProfile} // Edit Profile
    />} />
    {/* Available Professionals Routes */}
    {/* NOTE: हम यहां `viewerType` को URL Params से पढ़ने के बजाय Prop से भेज रहे हैं */}
    <Route path="/professionals/:viewerType" // Role (owner/chef) ko URL se pde
     element={<AvailableProfessionals
     // onBack handler ko pass kra 
     onBack={handleBackToDashboard}
     // 👇 Owner ki unlocked list pass karein
     unlockedChefs={currentOwnerProfile.unlockedChefs || []}
     // 👇 यहाँ हो रहा है असली "Backend Data Mapping"
     // 👇 Pehle filter karein ki sirf available chefs hi dikhen (yha filter esliye lagaya hai taki chef yadi stop looking btn dba de to owner ko bina refres ke hi us chef ki profile na dheke jisne stop looking btn abhi dabaya hai OR ek filter mene Backend(server.js) me bhi lgaya hai bo bus unchef ko DB se nikaltha hai jinka isAvailable: true hai   
     professionals={allChefs.filter(chef => chef.isAvailable === true) 
      .map(chef => ({
      id: chef._id || chef.id,
      // Yahan mapping dhyan se dekho bhai:
      name: chef.fullName || chef.name || "Unknown",
      role: chef.specialty || "Bakery Chef",
      experience: chef.experience || "Fresh",
      rating: chef.rating || 4.5,
      location: chef.city || chef.location || "N/A",
      hourlyRate: chef.salaryExpectation || "0", // Taaki ₹0 na dikhe
      skills: Array.isArray(chef.skills) ? chef.skills : JSON.parse(chef.skills || "[]"),
      // 🔥 Image Path Fix:
      avatar: chef.avatarPath && chef.avatarPath.includes('cloudinary.com')
  ? chef.avatarPath
  : (chef.avatarPath ? `${API_BASE_URL}/${chef.avatarPath.replace(/\\/g, '/')}` : null),
      bio: chef.bio || "No bio added",
      phone: chef.phone || "No Phone", // ✅ Backend se ab phone hi aayega
      email: chef.email || "No Email", // ✅ Model mein email field hai hi
      isAvailable: chef.isAvailable, // राधा की विजिबिलिटी के लिए
      availability: "Immediate"
     }))}
     onUnlockContact={handleUnlockContact}
     currentChefId={currentChefProfile._id || currentChefProfile.id} // अपनी खुद की प्रोफाइल पहचानने के लिए
    />} />
    {/* <Route path="/professionals/owner" element={<AvailableProfessionals viewerType="owner"
    // जब 'onBack' कॉल हो, तो 'owner' रोल के लिए नेविगेट करें
    onBack={() => handleBackToDashboard("owner")}
    />} />
    <Route path="/professionals/chef" element={<AvailableProfessionals viewerType="chef" 
    // जब 'onBack' कॉल हो, तो 'chef' रोल के लिए नेविगेट करें
    onBack={() => handleBackToDashboard("chef")}
    />} /> */}

    {/* Chef Dashboard - Props yha pass kiye (updated)*/}
    {/* 💡 Chef Dashboard को भी अपडेट करें ताकि वह updated state (update profile matlab) का उपयोग करे */}
    <Route path="/chefdashboard" element={
      isLoading ? <div>Loading Profile...</div> : // 👈 अगर लोड हो रहा है तो ये दिखेगा
    <ChefDashboard userProfile={currentChefProfile}
    onLogout={handleChefLogout} // Logout
    onEditProfile={handleChefEditProfile} // Edit Profile
    onWatchProfile={handleWatchProfile}  // Watch your Profile
    onToggleStatus={handleToggleAvailability} // यह नया Prop है
    />} />

    <Route path="*" element={<h1>404 Page Not Found</h1>} />
      </Routes>

   {/* 4. PaymentModal ke baad ya pehle Footer logic chipka do */}
     {shouldShowFooter && <Footer />}

  {/* PaymentModal.js ke code ke liye */}
      {selectedProfessional && (
        <PaymentModal
        professional={selectedProfessional}
        onClose={() => setSelectedProfessional(null)}
        onPaymentSuccess={handlePaymentSuccess}/>
      )}
      </>
  );
}

// App component me Router or AppRoutes ko rap kre
function App() {
  return (
    <Router>
      <div className="App">
        <AppRoutes /> {/* AppRoutes ko call hoga yha se */}
      </div>
    </Router>
  );

}
export default App;
