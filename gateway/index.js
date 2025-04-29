const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");// To forward requests to other services (for microservices)
const app = express();

app.use(express.json());
app.use("/customer", proxy("http://localhost:3001")); // Proxy to customer service
app.use("/shopping", proxy("http://localhost:3002")); // Proxy to order service
app.use("/", proxy("http://localhost:3003")); // Proxy to product service

app.listen(3000, () => {
  console.log("Gateway  is listenning on port 3000");
});
