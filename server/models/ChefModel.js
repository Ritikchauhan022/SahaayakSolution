const mongoose = require('mongoose');
const ChefSchema = new mongoose.Schema({
    // BasicInformation.js से आ रहे फ़ील्ड्स के हिसाब से
    name: {type: String, required: true},
    // Email Validation: Only @gmail.com allowed
    email: {
       type: String, 
       unique: true,
       sparse: true, // sparse isliye taki agar email na ho to error na aaye
       trim: true,
       lowercase: true,
       match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Please provide a valid @gmail.com address']}, 
      // Phone Validation: Exactly 10 digits
    phone: {
       type: String,
       required: [true, 'Phone number is required'],
       unique: true,
       trim: true,
       match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits']}, // Ab main ID phone hi hai
    password: {type: String, required: true}, // Authentication के लिए, हालाँकि यहाँ hashed नहीं है
    city: { type: String, required: true },
    specialty: { type: String }, // Role
    experience: { type: String },
    salaryExpectation: { type: String },
    bio: { type: String },
    availability: { type: String }, // ye new line add ki Part/Full Time kaam krne ke liye 
    skills: { type: [String], default: [] }, // Array of strings
    isAvailable: { type: Boolean, default: false }, // yha false kr diya kyuki refres ya login krne per Active Profile apne aap na dheke bina Require New Job btn per click kiye 

    avatarPath: { type: String }, // Uploaded photo path
    }, {timestamps: true});

    module.exports = mongoose.model('Chef', ChefSchema);