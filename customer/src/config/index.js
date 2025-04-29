const dotEnv = require("dotenv");
// First load the correct .env file based on the environment
if (process.env.NODE_ENV !== "prod") {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  dotEnv.config({ path: configFile });
} else {
  // In production, load the default .env file
  dotEnv.config();
}

// Now you can safely use the environment variables
console.log(process.env.MONGODB_URI);

module.exports = {
  PORT: process.env.PORT,
  DB_URL: process.env.MONGODB_URI,
  APP_SECRET: process.env.APP_SECRET,
};
