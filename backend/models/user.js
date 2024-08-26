const {Schema,Model, model} = require('mongoose');
const {createHmac,randomBytes} = require('crypto');
const { create } = require('domain');
const {createToken} = require('../services/auth');

const userSchema= new Schema({
    fullname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    salt:{
        type:String,
    },
    password:{
        type:String,
        required:true,
    },
},{timestamps: true});

userSchema.pre("save" , function(next){
    const user=this;
    if (!user.isModified("password")) return;

    const salt = randomBytes(16).toString();

    const hashedpassword = createHmac('sha256',salt).update(user.password).digest('hex');

    this.salt=salt;
    this.password=hashedpassword;

    next();
})

userSchema.static("checkAuth" , async function(email,password){
    const user = await this.findOne({email});
    if (!user) throw new Error("User Not Found!");
    const salt=user.salt;
    const hashed=user.password;
    
    const hashedcheck = createHmac('sha256',salt).update(password).digest('hex');   

    if (hashed !== hashedcheck) throw new Error("Incorrect Password!");
    const token = createToken(user);
    return token; 
})

const User = model('user',userSchema);

module.exports= User;