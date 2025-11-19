import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","Accept"]
}));

app.options("*", cors());

app.use(express.static("."));

const upload = multer({ dest: "uploads/" });

app.post("/extract", upload.single("bank"), (req,res)=>{
  if(!req.file) return res.status(400).json({error:"No .bank file uploaded"});

  const inputPath = req.file.path;
  const outputDir = path.join("output", req.file.filename);
  fs.mkdirSync(outputDir, {recursive:true});

  const extractor = "./fmod_extractor";
  const outFile = path.join(outputDir,"output.wav");

  const cmd = `${extractor} ${inputPath} -o ${outFile}`;

  exec(cmd,(err,stdout,stderr)=>{
    if(err) return res.status(500).json({error:"Extraction failed",details:stderr});
    res.json({message:"done",file:`/download/${req.file.filename}/output.wav`});
  });
});

app.get("/download/:id/:file",(req,res)=>{
  const p = path.join("output",req.params.id,req.params.file);
  if(!fs.existsSync(p)) return res.status(404).send("Not found");
  res.download(p);
});

app.listen(process.env.PORT||3000,()=>console.log("FMOD extractor API running"));
