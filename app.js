require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const ShortUrl = require("./models/shortUrl");
const PORT = process.env.PORT || 3000;
const connectDB = require("./config/db");
const shortid = require("shortid");
connectDB();

const corsoptions = {
    origin: process.env.ALLOWED_CLIENTS.split(',')
}

app.use(cors(corsoptions));
app.use(express.static("public"));
// app.use(express.json());
app.set("views", path.join(__dirname,"/views"));
app.set("view engine","ejs");

app.use("/api/files",require("./routes/files"));
app.use("/files",require("./routes/show"));
app.use("/files/download",require("./routes/download"));
app.use(express.urlencoded({extended: false}));

app.get("/", async (req,res)=>{
    const shortUrls = await ShortUrl.find()
    res.render("normalpage",{ shortUrls : shortUrls});
})

app.post("/shortUrls", async (req,res)=>{
    console.log(req.body.fullUrl);
    console.log("yess");
    try{
        await ShortUrl.create({ full: req.body.fullUrl })
        res.redirect("/");
    }
    catch(e){
        console.log(e)
    }
})

app.get("/:shortUrl",async (req,res)=>{
    const shortUrl = await ShortUrl.findOne({ short : req.params.shortUrl});
    if (shortUrl === null){
        return res.status(404);
    }
    shortUrl.clicks++;
    shortUrl.save();

    res.redirect(shortUrl.full);

})

app.post("/deleting/:delete", async (req,res)=>{
    
    try{
        const delete_button = await ShortUrl.deleteOne({short: req.params.delete});
        res.redirect("/");
    }
    catch(e){
        res.status(500).send(e);
        console.log(e);
    }
})

// app.post("/deleting/", async (req,res)=>{

//     const { id } = JSON.stringify(req.body);
//     console.log(id);

//     try{
//         const delete_button = await ShortUrl.deleteOne({short: id});
//         res.redirect("/");
//     }
//     catch(e){
//         res.status(500).send(e);
//         console.log(e);
//     }
// })

app.listen(PORT , ()=>{
    console.log(`Server ran successfully on port${PORT}`);
})