const {Router}=require('express');
const axios=require('axios');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = Router();

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

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024, files: 10 } // Max 10 files, 10MB each
});

router.get("/upload",(req,res)=>{
    if(!req.user){
        return res.redirect("/user/signin");
    }
    const Roles=['ACCOUNTANT', 'ADVOCATE', 'AGRICULTURE', 'APPAREL', 'ARTS',
       'AUTOMOBILE', 'AVIATION', 'BANKING', 'BPO',
       'DATA-SCIENTIST/ANALYST', 'CHEF', 'CIVIL-ENGINEERING',
       'CONSULTANT', 'DESIGNER', 'DIGITAL-MEDIA',
       'MECHANICAL/ELECTRICAL ENGINEERING', 'FINANCE', 'FITNESS',
       'HEALTHCARE', 'HR', 'WEB-DEVELOPMENT', 'PUBLIC-RELATIONS', 'SALES','TEACHER'];
    return res.render("hr_upload",{role_op:Roles});
})

router.post('/upload',upload.array('files', 10) ,async(req, res) => {
    const id=req.user._id;
    const role=req.body.dropdown;
    console.log(req.body);
    console.log(req.files);
    try {
        const url = 'http://127.0.0.1:5000/process_folder';
        const data = {
            folder_path: `../backend/uploads/${id}`,
            role: "TEACHER"
        };

        const response = await axios.post(url, data);
        console.log('Response from Flask API:', response.data);
        res.render("best_resumes",{pdf_list:response.data.result})
    } catch (error) {
        console.error('Error calling Flask API:', error);
    }
    return;
});

module.exports=router;
