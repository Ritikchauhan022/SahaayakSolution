const mongoose = require('mongoose');
const OwnerSchema = new mongoose.Schema({
    ownerName: { type: String, required: true },
    // Email Validation: Only @gmail.com allowed
    email: {
      type: String,
      unique: true, 
      sparse: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Please provide a valid @gmail.com address'] },
      // Phone Validation: Exactly 10 digits
    phone: { 
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits']},
      password: { type: String, required: true },
      businessName: { type: String, required: true }, // Bakery Name
      bakeryWork: { type: String },
      location: { type: String },
      yearEstablished: { type: String },
      profilePic: { type: String }, // फोटो का पाथ स्टोर होगा
      unlockedChefs: [{type:mongoose.Schema.Types.ObjectId, ref: 'Chef'}] //Ye line add karein esse database ko pata chale ki is owner ne kaunse chefs unlock kiye hain.
    }, { timestamps: true });

module.exports = mongoose.model('Owner', OwnerSchema);