const mongoose = require("mongoose");
const { DB_URL } = require("../config");
console.log("DB_URL:", process.env.MONGODB_URI);
module.exports = async () => {
  try {
    await mongoose.connect(DB_URL);
  } catch (error) {
    console.log("Error ============");
    console.log(error);
    process.exit(1);
  }
};
