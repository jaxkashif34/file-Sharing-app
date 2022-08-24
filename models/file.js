const mongoose = require('mongoose');

const File = new mongoose.Schema({
  // how the file object is look like (Schema object for file objects)
  path: {
    type: String,
    required: true,
  },
  orignalName: {
    type: String,
    required: true,
  },
  password: String,
  downloadCount: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model('File', File);
