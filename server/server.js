// Server.js 
require('dotenv').config();
const express = require('express');
const http = require('http'); // 👈 Add this
const { Server } = require('socket.io'); // 👈 Add this
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer'); // Multer ko import kiya
const cloudinary = require('cloudinary').v2; // 👈 Add this
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // 👈 Add this
const bcrypt = require('bcrypt');

// ChefModel को यहाँ इम्पोर्ट करना ज़रूरी है!
const Chef = require('./models/ChefModel');
// ChefModel को इम्पोर्ट किया है
const Owner = require('./models/OwnerModel');


const app = express();
const server = http.createServer(app); // 👈 Server ko wrap karein

// --- CLOUDINARY CONFIGURATION ---
// Bhai yahan apni keys dal
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- CLOUDINARY STORAGE SETTINGS ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'BakeryConnect_Uploads', // Cloudinary mein is naam ka folder ban jayega
        // .webp aur .heic ko allow karna MUST hai real project ke liye
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'heic'],
       transformation: [
        // Ye line photo ko handle-able banayegi
        { width: 800, height: 800, crop: "limit" },
        // Ye line quality maintain rakhegi
        { quality: "auto", fetch_format: "auto" }
    ] // Optimization
    },
});
const upload = multer({
    storage: storage, // Ab multer cloud par bhejega
    limits: { fileSize: 10 * 1024 * 1024 } // Iska matlab 10MB ki limit  
}); 


const io = new Server(server, {
    cors: {
        // Isse Vercel aur tumhara apna laptop dono allow ho jayenge
        origin: ["https://sahaayak-frontend.vercel.app", "http://localhost:3000"],
        // origin: "*", // Live hone par ye sabse safe hai testing ke liye
        methods: ["GET", "POST", "PATCH", "PUT"]
    }
});

// Socket logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('disconnect', () => console.log('User disconnected'));
});

// Global io ko app mein set karein taaki routes mein use kar sakein
app.set('io', io);


const PORT = process.env.PORT || 5000; // Backend aamtor per 5000 per chalta hai

// Multer storage set kiya (Hum filal upload nhi kr rhe, srif data paas kr rhe hai)
// Yadi aap cloud per image save krege, to ye change hoga| Abhi ye local folder me save krege|
// const upload = multer({dest: 'uploads/' });  

// (Middleware)
app.use(cors());
// यह लाइन ब्राउज़र को 'uploads' फोल्डर से फोटो उठाने की परमिशन देती है
// app.use('/uploads', express.static('uploads'));
// Note: Multer ka use krne per, express.json() ki need nhi hoti
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// New: MongoDB Connection String // ye local MongoDB URL hai
// const DB_URL = 'mongodb://127.0.0.1:27017/BakeryDB';
// Ab ye .env file se cloud ka URL uthayega
const DB_URL = process.env.MONGODB_URI; // direct MongoDB Atlas (Cloud) se connect hua

// New: MongoDB se conect kra
mongoose.connect(DB_URL)
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => {
    console.error('MongoDB connection failed:', err);
    // अगर कनेक्शन फेल हो जाए, तो process.exit(1);
})


// API Root: server ki jaach ke liye
app.get('/api/status', (req, res) => {
    res.json({status: 'OK', message: 'Backend is running and ready!'});
});


// CHEF & OWNER ROUTES (Updated)

 // New chef profile bnayi (Multipart/Form-Data handle kiya)
 // 'photo' field ke liye file accept ki (upload.single('photo'))
 app.post('/api/chef/register', upload.single('photo'), async (req, res) => {
    console.log("API HIT: Register route triggered!");
    console.log("Incoming Data:", req.body);
    try {
        // req.body me ab text fields hai, req file me photo
        const body = req.body;
        delete body.contactEmail; // 👈 Ye line database mein jane se pehle hi uda degi

        // skills field jo humne JSON.stringify kiya tha, use parse kiya
        if (body.skills) {
            body.skills = JSON.parse(body.skills);
        }

        // Photo ka path (Example ke liye)
        const photoUrl = req.file ? req.file.path : null;
        
        // SAFETY LOGIC: Agar email empty string hai, toh use undefined kar do
        // Taaki sparse index use ignore kare aur duplicate error na aaye
        const finalEmail = (body.email && body.email.trim() !== "") ? body.email : undefined;

        // 2. MANUAL HASHING FOR CHEF
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);


       // ChefModel के हिसाब से data को मैप करें (mapping BasicInformation.js fields)
        // Database me save krne ke liye ChefModel ka use kra
        const newChefData = {
            name: body.fullName, // Frontend fullName bhej rha hai
            email: finalEmail, // 👈 Null ki jagah undefined use karo
            phone: body.phone,         // Phone alag save hoga
            // User Authentication के लिए: password: body.password, // इसे bcrypt से hash करना होगा
            password: hashedPassword, // 👈 Ab yahan hashed password jayega
            city: body.location,
            specialty: body.role, // Frontend Role bhej rha hai
            experience: body.experience,
            skills: body.skills,
            salaryExpectation: body.salaryExpectation,
            bio: body.bio,
            // अपनी जानकारी के लिए availability को अलग से स्टोर कर सकते हैं अगर आपके Schema में है
            availability: body.availability,
            // isAvailable: body.availability === 'Full-time' || body.availability === 'Part-time',
            avatarPath: photoUrl, // 👈 Yahan ab seedha https:// link save hoga
             // नई लाइन: नया प्रोफाइल हमेशा 'false' से शुरू होगा
            isAvailable: false,
        };
        // नया Chef ऑब्जेक्ट बनाएँ और सेव करें
        const newChef = new Chef(newChefData);
        const savedChef = await newChef.save();
        console.log("DB Name:", mongoose.connection.name);

        console.log(`Chef saved successfully with ID: ${savedChef._id}`);
        res.status(201).json({
            message: 'Chef profile created (Backend received data)!',
            chef:savedChef
        });
    } catch (error) {
        // 1. सबसे पहले, टर्मिनल में एरर का प्रकार दिखाएँ
        console.error("Chef Registration Error:", error);

        // 2. अगर यह Duplicate Key Error (Unique: true फ़ील्ड जैसे phone/contactEmail) है
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Phone or Email already registered.',
                error: "Duplicate key error."
                });
            }
            res.status(500).json({ message: 'Registration failed', error: error.message });
        }
    });
       

 // प्रोफाइल अपडेट करने का रूट (Professional Way)
 app.put('/api/chef/update/:identifier', upload.single('photo'), async (req, res) => {
    try{
        const {identifier} = req.params; // Ab ye phone ya email kuch bhi ho sakta hai
        const body = req.body;
        delete body.contactEmail; // 👈 Yahan bhi uda do

        console.log("Processing update for:", identifier); // Debugging

        // Frontend के नाम को Database के नाम से मैप करें
        let updateData = {
            name: body.fullName || body.name,
            city: body.location || body.city,
            specialty: body.role || body.specialty,
            experience: body.experience,
            salaryExpectation: body.salaryExpectation,
            bio: body.bio,
            // 🔥 YE LINE ADD KAREIN:
            // Agar body mein isAvailable aa raha hai, toh use updateData mein daalein
            availability: body.availability,
            // ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable === 'true' || body.isAvailable === true })
        };

        // Boolean status check
        if (body.isAvailable !== undefined) {
            updateData.isAvailable = (body.isAvailable === 'true' || body.isAvailable === true);
        }

        // 2. Query Build Karo (Sabse Safe Tarika)
        let orConditions = [
            { phone: identifier },
            { email: identifier }
        ];

        // Agar identifier ek valid MongoDB ID hai, toh use bhi query mein dalo
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            orConditions.push({ _id: new mongoose.Types.ObjectId(identifier) });
        }

        // 2. Email handling ko ekdum strict banao (Isse replace karo)
        let unsetData = {}; // Khali object unset ke liye
        // Agar email sahi mein hai (not null, not "null", not empty string)
        if (body.email && body.email !== "null" && body.email.trim() !== "") {
            updateData.email = body.email.trim(); // Agar email hai toh updateData mein rakho
         } else {
            // Agar email khali hai ya "null" string hai, toh usey updateData se hatao
            // aur database se remove karne ke liye unset mein dalo
          unsetData = { email: 1 }; // Agar delete karna hai toh unsetData mein dalo
         }

        // स्किल्स को हैंडल करें
        if (body.skills) {
            updateData.skills = typeof body.skills === 'string' ? JSON.parse(body.skills) : body.skills;
        }

        // अगर यूजर ने नई फोटो अपलोड की है, तो उसका पाथ अपडेट करें
        // 🔥 CHANGE: Nayi photo bhi Cloudinary par jayegi
        if (req.file) {
            updateData.avatarPath = req.file.path;
        }

        // MongoDB में डेटा अपडेट करना
        const updatedChef = await Chef.findOneAndUpdate(
            { $or: orConditions },
            { 
                $set: updateData,
                ...(Object.keys(unsetData).length > 0 && { $unset: unsetData })
            },
            { new: true, runValidators: false } // Validation off rakho test ke liye
        );

        if (!updatedChef) {
            return res.status(404).json({ message: "Chef profile not found" });
        }

        // 🔥 YAHAN SE CHANGES START HAIN:
        // 2. Agar update success hai, toh socket signal bhejo
        const io = req.app.get('io');
        // Hum poora naya data bhej rahe hain taaki App.js bina fetch kiye update ho jaye
        io.emit('marketplace_update', {
            type: 'PROFILE_UPDATE',
            chefId: updatedChef._id,
            chefData: {
                name: updatedChef.name,
                city: updatedChef.city,
                specialty: updatedChef.specialty,
                experience: updatedChef.experience,
                salaryExpectation: updatedChef.salaryExpectation,
                bio: updatedChef.bio,
                avatarPath: updatedChef.avatarPath, // Photo ke liye
                isAvailable: updatedChef.isAvailable
            }
        });

        console.log("Update Success & Socket Signal Sent for:", updatedChef.name);

        //Last mein response bhejo
        res.status(200).json({ message: "Profile updated successfully!", chef: updatedChef });

    } catch (error) {
        console.error("CRITICAL UPDATE ERROR:", error);
        res.status(500).json({ message: "Update failed", error: error.message });
    }
});

 // Sirf status toggle karne ke liye special route
 app.patch('/api/chef/toggle-status/:identifier', async (req, res) => { 
    try{
        const {identifier} = req.params;
        const {isAvailable} = req.body;   // Frontend se !currentStatus yahan aayega

        console.log(`Updating status for ${identifier} to: ${isAvailable}`);

        // FIX: $or ka use karein taaki identifier Email ho ya Phone, dono kaam karein
         const updatedChef = await Chef.findOneAndUpdate(
            {
                $or:[
                    { phone: identifier }, // Naye chefs ke liye 
                    {email: identifier} // Backup ke liye
                ]
            },
            { $set: { isAvailable: Boolean(isAvailable) } }, //👈 Ye line database update karti hai
            {new: true} // Taaki hume update hone ke BAAD wala data mile
        );

        if (!updatedChef) return res.status(404).json({message: "Chef not found"});
        // 🔥 MAGIC LINE: Sabhi ko signal bhejo ki marketplace update ho gaya hai!
        const io = req.app.get('io');
        io.emit('marketplace_update', { // signal bhejne ka kaam
            chefId: updatedChef._id,
            isAvailable: updatedChef.isAvailable
        });

        res.status(200).json({message: "Status Updated!", chef: updatedChef });
    } catch (err) {
        res.status(500).json({message: err.message });
    }
 });

 // मार्केटप्लेस के लिए सभी शेफ्स का डेटा लाने वाला रूट
 // MarketPlace ke liye sirf Available Chefs ka data lane wala route
 app.get('/api/chefs', async (req, res) => {
    try{
        console.log("Fetching active chefs for marketplace...");
        // FIX: Yahan filter lagaya gaya hai { isAvailable: true }
        const chefs = await Chef.find({isAvailable: true});
        // डेटाबेस से सभी शेफ्स को निकालें
        // const chefs = await Chef.find({});

        // क्लाइंट (Frontend) को डेटा भेजें
        res.status(200).json(chefs);
    } catch (err) {
        console.error("Error fetching chefs:", err);
        res.status(500).json({message: "Internal Server Error", error: err.message});
    }

 });

 // --- LOGIN ROUTE (Email or Phone) ---(Chef or Owner dono ke liye)
  app.post('/api/chef/login', async (req, res) => {
    console.log("Login Attempt:", req.body); 
    const { identifier, password, expectedRole } = req.body;  // 👈 expectedRole yahan receive kiya

    try{
        // डेटाबेस में चेक करें कि identifier (Email या Phone) मैच हो रहा है या नहीं
        // 1. Chef mein dhoondo (contactEmail hata diya search se)
        let user = await Chef.findOne({
           $or: [ { email: identifier }, { phone: identifier } ]
        });
        let userType = 'chef';

        // 2. Agar Chef nahi mila, toh Owner table mein dhoondho
        if (!user) {
            user = await Owner.findOne({
                $or: [
                    {email: identifier},
                    {phone: identifier}
                ]
            });
            userType = 'owner';
        }

        // 3. Agar dono mein nahi mila
        if (!user) {
            return res.status(401).json({ message: 'User not found! Please check your email/phone.' });
        }
      
     // ROLE VALIDATION (Ye sabse zaroori hai)
     // Hum dono ko lowercase karke match karenge taaki spelling ki galti na ho
     // NAYA CHECK: Kya user ka type wahi hai jo usne select kiya hai?-> yani chef or owner apne apne data se hi login kr paye 
     // Hum check kar rahe hain ki expectedRole mil raha hai ya nahi
     if (!expectedRole) {
            return res.status(400).json({ message: 'Role information is missing from request.' });
        }
      if (userType.toLowerCase() !== expectedRole.toLowerCase()) {
        console.log(`Role Mismatch: Found ${userType}, Expected ${expectedRole}`);
        return res.status(403).json({
           message: `Account type mismatch! This account is registered as a ${userType.toUpperCase()}. Please use the correct login page.`
        });
      }

      // 4. 🔥 BCRYPT PASSWORD CHECK (Naya Logic)
      // Pehle hum direct match kar rahe the: if (user.password === password)
      // Ab hum bcrypt.compare use karenge
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        console.log(`Login Success: ${userType === 'chef' ? user.name : user.ownerName}`);
        res.status(200).json({
            message: 'Login successful!',
            type: userType,
            data: user,
            chef: user
            });
         } else {
            // Agar password match nahi hua
            return res.status(401).json({ message: 'Incorrect password. Try again.' });
         }

     } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ message: 'Internal Server Error' });
     }
  });



 // प्रोफाइल देखने के लिए नया रूट (रिफ्रेश प्रॉब्लम फिक्स करने के लिए)
 app.get('/api/chef/profile/:identifier', async (req, res) => {
    try{
        const {identifier} = req.params;
        const chef = await Chef.findOne({
          $or: [ { email: identifier }, { phone: identifier } ]
        });
        if (!chef) return res.status(404).json({message: "Chef not found"});
        res.status(200).json({ chef: chef });
    } catch (err) {
        res.status(500).json({message: "Server error", error: err.message });
    }

 });

 // ------OWNER ROUTES--------
 // Owner Registration
 app.post('/api/owner/register', upload.single('profilePic'), async (req, res) => {
    try{
        const body = req.body;
        const photoUrl = req.file ? req.file.path : null; // Cloudinary URL

        // 🔥 YE LINE ADD KARO: Agar email khali hai toh use undefined karo
        // Taaki MongoDB index error na de
        const finalEmail = (body.email && body.email.trim() !== "") ? body.email : undefined;

        // 🔥 FIX 2: Manual Hashing (Directly here)
        // Agar model hook hataya hai, toh yahan hash karna MUST hai
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);

        const newOwner = new Owner ({
            ownerName: body.fullName,
            email: finalEmail, // 👈 body.email ki jagah finalEmail use karo
            phone: body.phone,
            password: hashedPassword, // 👈 Hashed password yahan jayega
            businessName: body.bakeryName,
            bakeryWork: body.bakeryWork,
            location: body.location,
            yearEstablished: body.yearEstablished,
            profilePic: photoUrl // 👈 Seedha Cloud link
        });

        const savedOwner = await newOwner.save();
       res.status(201).json({ message: 'Owner Profile Created!', owner: savedOwner });
    } catch (error) {
        console.error("Owner Save Error:", error);
        // Error response ko detail mein bhejo taaki front-end par dikhe
        res.status(500).json({
            message: 'Registration failed',
            error: error.message,
            stack: error.code === 11000 ? "Duplicate Data Error" : "Other Error"
        });

    }
 });

 //Owner Update API
 app.put('/api/owner/update/:identifier', upload.single('profilePic'), async(req, res) => {
    try{
        const {identifier} = req.params; // Ab ye phone ya email kuch bhi ho sakta hai
        const body = req.body;

        // Frontend ke fields ko Database ke fields se sahi se map karein
        let updateData = {
            ownerName: body.ownerName || body.fullName,
            phone: body.phone,
            businessName: body.businessName || body.bakeryName,
            bakeryWork: body.bakeryWork,
            location: body.location,
            yearEstablished: body.yearEstablished,
        };

        // 2. Email "Null/Empty" Safety (Ye sabse zaroori hai!)
        let unsetData = {};
        if (body.email && body.email !== "null" && body.email.trim() !== "") {
            updateData.email = body.email.trim();
        } else {
            // Agar email khali hai, toh use database se hata do taaki unique error na aaye
            unsetData = { email: 1 };
        }

        if (req.file) {
            updateData.profilePic = req.file.path;
        }

        // 3. Query Conditions (Simple & Safe)
        let orConditions = [
            { phone: identifier },
            { email: identifier }
        ];

        if (mongoose.Types.ObjectId.isValid(identifier)) {
            orConditions.push({ _id: new mongoose.Types.ObjectId(identifier) });
        }

        const updatedOwner = await Owner.findOneAndUpdate(
            { $or: orConditions },
            { 
                $set: updateData,
                ...(Object.keys(unsetData).length > 0 && { $unset: unsetData })
            },
            { new: true, runValidators: false }
        );
            
        if (!updatedOwner) return res.status(404).json({ message: "Owner not found" });

        res.status(200).json({ message: 'Profile updated successfully!', owner: updatedOwner });
    } catch (error) {
        console.error("OWNER UPDATE ERROR:", error.message);
        res.status(500).json({ message: 'Update failed', error: error.message});
    }
 }); 

 //Owner Profile Get (For Refresh/Sync)
 app.get('/api/owner/profile/:phone', async(req, res) => {
    try{
    const { phone } = req.params;
    const owner = await Owner.findOne({ phone: phone });
    if (!owner) return res.status(404).json({ message: "Owner not found" });
    res.status(200).json({ owner: owner });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
 });

 // New ROUTES <- ye routes identifier krega App.js ke liye ki USER chef hai ya owner hai
 // NEW: Universal Sync Route (To stop 404 Red Lines in Console)
 app.get('/api/user/sync/:identifier', async (req, res) => {
    try{
        const {identifier} = req.params;

        // 1. Pehle Chef check karo
        const chef = await Chef.findOne({
           $or: [ { email: identifier }, { phone: identifier } ]
        });

        if (chef) {
            // Document ko plain object mein badlo
            const chefObj = chef.toObject();
            // Ab delete kaam karega
            delete chefObj.contactEmail;
            return res.status(200).json({type: 'chef', data: chefObj});
        }

        // 2. Agar chef nahi mila, toh Owner check karo
        const owner = await Owner.findOne({
            $or: [{ phone: identifier }, { email: identifier }]
        });

        if (owner) {
            return res.status(200).json({type: 'owner', 
                data: {
                   ...owner._doc,
                   // Ye line ensure karegi ki refresh ke baad bhi unlocked list mile
                   unlockedChefs: owner.unlockedChefs || []

                }
            });
        }

        // 3. Agar dono nahi mile
        res.status(404).json({message: "User not found in any collection"});
    } catch (err) {
        res.status(500).json({message: "Sync error", error: err.message});
    }
 });

 // Payment krne ke baad owner ko chef ka number or email mile bo refres krne ke baad bhi nha hte 
 app.post("/api/owner/unlock-chef", async (req, res) => {
    const {ownerPhone, chefId} = req.body;

   try {
        // Direct update karein: $addToSet sirf tabhi add karega jab ID nahi hogi
        const updatedOwner = await Owner.findOneAndUpdate(
            { phone: ownerPhone },
            { $addToSet: { unlockedChefs: chefId } },
            { new: true } // updated owner wapas chahiye
        );

        if (!updatedOwner) return res.status(404).json({ message: "Owner not found" });

        res.status(200).json({
            message: "Chef unlocked successfully",
            unlockedChefs: updatedOwner.unlockedChefs,
            updatedOwner: updatedOwner // ye pura bhejo 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server error"});
    }
 });

 // app.listen KI JAGAH server.listen use karein
// server ko shru kra (सबसे नीचे)
server.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT} with WebSockets`);
});