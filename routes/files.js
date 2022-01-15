const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuidv4} = require("uuid");

let storage = multer.diskStorage({
    destination: (req,file,cb)=> cb(null,"./uploads"),
    filename: (req,file,cb)=>{
        // const uniqueName = `${Date.now().toString().replace(`/:/g,'-'`)}-${Math.round(Math.random()*1E9)}${path.extname(file.originalname)}`;
        cb( null , new Date().toISOString().replace(/:/g,'-') + file.originalname);
    },
});

let upload = multer({
    storage,
    limits: {fileSize : 1000000 * 100},
}).single('myfile');

router.post("/",(req,res)=>{

    upload(req,res, async(err)=>{

        if (err){
            return res.status(500).send({error: err.message});
        }

        // if (!req.file){
        //     return res.json({error: "All fields are required...!"});
        // }

        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size,
        })

        const response = await file.save();
        return res.json({file: `${process.env.APP_BASE_URL}/files/${response.uuid}`});
        // return res.render("mainpage",{file: `${process.env.APP_BASE_URL}/files/${response.uuid}`})

    });
});

router.post("/send", async (req,res)=>{

    const { uuid , emailTo ,emailFrom , expiresIn } = req.body;

    if (!uuid || !emailTo || !emailFrom){
        return res.status(422).send({error: "All fields are requird...!"});
    }
    try{
        const file = await File.findOne({uuid: uuid});
        if (file.sender){
            return res.status(422).send({error: "Email already send...!"});
        }
        file.sender = emailFrom;
        file.receiver = emailTo;
        const response = await file.save();
    
        const sendMail = require("../services/emailservice");
        sendMail({
            from: emailFrom,
            to: emailTo,
            subject: "inShare file sharing...!",
            text: `${emailFrom} shared file with you...!`,
            html: require("../services/emailtemplate")({
                emailFrom: emailFrom,
                downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`,
                size: parseInt(file.size/1000)+ "KB",
                expires: "24 hours"
            })
        }).then(()=>{
            return res.json({success: true});
        }).catch(err=>{
            console.log(err);
            return res.status(500).json({error: "Error in email sending...!"});
        });
    } catch(err){
        return res.json(500).send({error: "Soething went wrong...!"});
    }

})

module.exports = router;