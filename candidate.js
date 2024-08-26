const {Router}=require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const {webscrape}=require("../services/scrape");

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        const userId = req.user._id; 

        const userFolder = path.join('./uploads', userId);
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true }); 
        }

        cb(null, userFolder);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + (file.originalname));
    }
});

const upload = multer({ storage });


const router = Router();

router.get("/upload",(req,res)=>{
    if(!req.user){
        return res.redirect("/user/signin");
    }
    return res.render("upload.ejs");
})

router.post("/upload",upload.single('Resume'), async(req, res) => {
    const id = req.user._id;
    const name = req.file.fieldname + '-' + (req.file.originalname);
    
    try {
        const url = 'http://127.0.0.1:5000/process_file';
        const data = {
            file_path: `../backend/uploads/${id}/${name}`
        };
        const response = await axios.post(url, data);
        const role=response.data.result;
        console.log(role);
        const jobs = await webscrape(role);
        return res.render("jobs",{job_data:jobs});
    } catch (error) {
        console.error('Error calling Flask API:', error);
    }
});

module.exports=router;