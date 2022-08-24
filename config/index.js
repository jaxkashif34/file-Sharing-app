const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.DATABASE_URL); // connect to database

    console.log(`Successfully connected to ${connection.connection.host}`.cyan.underline.bold);
  } catch (e) {
    console.log(`Could't  ${connection.connection.name}`.red.underline.bold);
  }
};

module.exports = connectDB;
