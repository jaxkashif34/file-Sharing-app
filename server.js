require('dotenv').config(); // setting the config for .env file to get the variables from the env (envirement) variables
require('colors');
const express = require('express');
const app = express();
const multer = require('multer');
const connectDB = require('./config');
const bcrypt = require('bcrypt');
const File = require('./models/file');

connectDB(); // onload connect the database

const upload = multer({ dest: 'upload' }); //  naming the folder where the file will be stored when get from the font-End

app.use(express.urlencoded({ extended: true })); // setting the middleware to get the alphanumeric characters fields

app.set('view engine', 'ejs'); // setting the template engine

app.get('/', (req, res) => {
  // what happens when visit the home page
  res.render('index');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  // what happens when visit the home page
  const fileData = {
    // setting the file object to be uploaded
    path: req.file.path, // the path to the file to be uploaded
    orignalName: req.file.originalname, // the name of the file to be uploaded
  };

  if (req.body.password != null && req.body.password !== '') {
    // if the password is not set and empty password
    fileData.password = await bcrypt.hash(req.body.password, 10); // converting password to encrypted hash string
  }

  File.create(fileData).then((result) => {
    // storing the file into mongodb
    res.render('index', { fileLink: `${req.headers.origin}/file/${result.id}` }); // rendering the home page with the file link
  });
});

const handleDownload = async (req, res) => {
  // callback function to be called when clicked on link
  const file = await File.findById(req.params.id); // get the file from the database by Id

  if (file.password != null) {
    // if password is not set when sharing
    if (req.body.password == null) {
      // if password is not type after clicking the link
      res.render('password'); // re-render password page
      return;
    }

    if (!(await bcrypt.compare(req.body.password, file.password))) {
      // if password is not matched
      res.render('password', { error: true }); // re-render password page
    }
  }

  file.downloadCount += 1; // increase pasword count

  await file.save(); // save the file data into database with updated passwordCount

  res.download(file.path, file.orignalName); // download the file when all is done
};

app.route('/file/:id').get(handleDownload).post(handleDownload); // onsame route run two mathods get and post

const port = process.env.PORT; // geting the port from the environment variable and setting to post variable
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
