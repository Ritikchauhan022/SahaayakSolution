const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
unlockedChefs: [{type:mongoose.Schema.Types.ObjectId, ref: 'Chef'}] //Ye line add karein esse database ko pata chale ki is owner ne kaunse chefs unlock kiye hain.
}, { timestamps: true });

// PASSWORD HASHING LOGIC START
OwnerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (error) {
        next(error);
      }
  });
  // PASSWORD HASHING LOGIC END

module.exports = mongoose.model('Owner', OwnerSchema);