const {Router}=require('express');
const User= require('../models/user');

const router = Router();

router.get('/signup',(req,res)=>{
    return res.render('signup');
});

router.get('/signin',(req,res)=>{
    return res.render('signin');
});

router.post('/signup',async (req,res)=>{
    const {fullname,email,password} = req.body;
    await User.create({
        fullname,
        email,
        password,
    })
    return res.redirect("/");
});

router.post('/signin',async (req,res)=>{
    const {email,password}=req.body;
    try{
        const token =await User.checkAuth(email,password);
        return res.cookie('token',token).redirect("/");
    }catch(error){
        return res.redirect("/user/signin");
    }
})

router.get("/logout",(req,res)=>{
    res.clearCookie('token').redirect("/");
})

module.exports= router;