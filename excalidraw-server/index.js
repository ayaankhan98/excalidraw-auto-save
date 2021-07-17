import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';

const app = express();

app.use(cors());

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + ".png")
  }
});

let upload = multer({ storage: storage })

app.get("/", (req, res) => {
  res.send(`
  <div>
  <h1>How to use?</h1>
  <pre>
    1. go to /getAll to get list of all images.
    2. go to /getSpecificImage/:fileName to get specific image with file name.
    3. /upload route save an image automatically (Triggered from frontend).
    </pre>
  </div>`);
});

/// upload file to /uploads/
app.post("/upload", upload.single("file"), (req, res) => {
    console.log(req.file);
  res.send("uploaded");
});

// return list of all files in ./uploads/
app.get('/getAll', (req, res) => {
  fs.readdir('./uploads/', (err, files) => {
    res.json(files);
  });
});

// return a single file in ./uploads/ based on file name
app.get('/getSpecificImage/:fileName', (req, res) => {
  console.log("Tre");
  console.log(req.params);
  fs.readFile('./uploads/' + req.params.fileName, (err, data) => {
    res.send(data);
  });
});

app.listen(4200, () => {
  console.log("Server running on port 4200");
});