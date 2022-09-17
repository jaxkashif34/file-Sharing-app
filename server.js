/* Loading the environment variables from the .env file. */
require('dotenv').config();
require('colors');
const express = require('express');
const app = express();
const multer = require('multer');
const connectDB = require('./config');
const bcrypt = require('bcrypt');
const File = require('./models/file');

/* Connecting to the database. */
connectDB();

/* Setting the destination of the file to be uploaded. */
const upload = multer({ dest: 'upload' });
/* A middleware that is used to parse the body of the request. */
app.use(express.urlencoded({ extended: true }));
/* Setting the view engine to ejs. */
app.set('view engine', 'ejs');

/* This is the route for the home page. When the user visits the home page, the index.ejs file is
rendered. */
app.get('/', (req, res) => {
  res.render('index');
});

/* This is a route that is used to upload a file. The upload.single('file') is a middleware that is
used to upload a single file. The file is uploaded to the upload folder. */
app.post('/upload', upload.single('file'), async (req, res) => {
  const fileData = {
    /* Creating a fileData object with the path and original name of the file. */
    path: req.file.path,
    orignalName: req.file.originalname,
  };

  /* This is a condition that checks if the password field is not empty. If it is not empty, the
  password is hashed and stored in the fileData object. */
  if (req.body.password != null && req.body.password !== '') {
    fileData.password = await bcrypt.hash(req.body.password, 10);
  }

  /* This is a callback function that is called when the file is uploaded. The fileLink is the link to
  the file that is uploaded. */
  File.create(fileData).then((result) => {
    res.render('index', { fileLink: `${req.headers.origin}/file/${result.id}` });
  });
});

/**
 * It checks if the file has a password, if it does, it checks if the password is correct, if it is, it
 * increments the download count and downloads the file.
 * @param req - The request object.
 * @param res - The response object.
 * @returns The file is being returned to the user.
 */
const handleDownload = async (req, res) => {
  /* Finding the file in the database by the id. */
  const file = await File.findById(req.params.id);

  if (file.password != null) {
    if (req.body.password == null) {
      res.render('password');
      return;
    }

    if (!(await bcrypt.compare(req.body.password, file.password))) {
      res.render('password', { error: true });
    }
  }

  file.downloadCount += 1;

  await file.save();

  res.download(file.path, file.orignalName);
};

/* A route that is used to download a file. The get method is used to render the password page if the
file has a password. The post method is used to download the file. */
app.route('/file/:id').get(handleDownload).post(handleDownload);

const port = process.env.PORT;
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
