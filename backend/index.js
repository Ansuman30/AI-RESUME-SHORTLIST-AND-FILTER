const express = require('express');
const UserRouter = require('./routes/user');
const CandidateRouter = require("./routes/candidate");
const CompanyRouter = require("./routes/company");
const path=require("path");
const { checkforauthcookie } = require('./middlewares/authentication');
const cookieparser=require('cookie-parser');
const {connectMongo}=require('./connections')


const app=express();
const port= 8000;

connectMongo('resume-test');

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({extended: false}));
app.use(cookieparser());
app.use(checkforauthcookie('token'));

app.get('/',async (req,res)=>{
    res.render('home.ejs', {
        user:req.user,
    });
});

app.use('/candidate',CandidateRouter);
app.use('/user',UserRouter);
app.use('/company',CompanyRouter);


app.listen(port,()=>{console.log(`Server started at port: ${port}`)});