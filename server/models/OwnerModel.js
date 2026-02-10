const mongoose = require('mongoose');

const OwnerSchema = new mongoose.Schema({
    ownerName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    businessName: { type: String, required: true }, // Bakery Name
    bakeryWork: { type: String },
    location: { type: String },
    yearEstablished: { type: String },
    profilePic: { type: String }, // फोटो का पाथ स्टोर होगा
unlockedChefs: [{type:mongoose.Schema.Types.ObjectId, ref: 'chef'}] //Ye line add karein esse database ko pata chale ki is owner ne kaunse chefs unlock kiye hain.
}, { timestamps: true });

module.exports = mongoose.model('Owner', OwnerSchema);