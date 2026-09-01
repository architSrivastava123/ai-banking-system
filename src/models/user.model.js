const mongoose = require('mongoose');
const bcrypt=require('bcrypt')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: [true, 'Username is already in use']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: [true, 'Email is already in use'],
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required for creating an account'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  systemUser:{
    type:Boolean,
    default:false,
    immutable:true,
    select:false
  }
},{
    timestamps: true
});

userSchema.pre("save",async function (){
    if(!this.isModified("password")){
        return ;
    }

    const hashPass=await bcrypt.hash(this.password,10);
    this.password=hashPass;

})

userSchema.methods.comparePassword=async function (password){
  return await bcrypt.compare(password,this.password);
}

const userModel = mongoose.model('user', userSchema);
module.exports = userModel;