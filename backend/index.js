require('dotenv').config();
const express = require('express');
const mongoose=require('mongoose');
const UserRouter = require('./routes/user');
const CandidateRouter = require("./routes/candidate");
const CompanyRouter = require("./routes/company");
const path=require("path");
const { checkforauthcookie } = require('./middlewares/authentication');
const cookieparser=require('cookie-parser');


const app=express();
const port= process.env.PORT;

mongoose
    .connect(process.env.MONGO_URL)
    .then(()=>console.log("Mongo DB Connected"))
    .catch((err)=>console.log("Mongo connection Failed: ",err));

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