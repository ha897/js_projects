const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    pic: {
      type: String,
      // if any error with default img show image with the first leter of user
      default:
        "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg",
    },
  },
  { timestamps: true }
);
// ميثود تضاف لكائن المستخدم للتحقق من صحة كلمة المرور
// عند انشاء مستخدم   const user = await User.findOne({ email });
// يمكن التحقق كالتالي await user.matchPassword(passwordNeedToChick)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// قبل حفض كلمة المرور شفرها تصير اتماتيك قبل حفض اي مستخدم
userSchema.pre("save", async function (next) {
  // يتاكد ان كلمة المرور مشفرة فلا يشفرها مرة اخرى
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
