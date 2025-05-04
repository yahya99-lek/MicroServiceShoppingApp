const ShoppingService = require("../services/shopping-service");
module.exports = (app) => {
  const service = new ShoppingService();
  // Define an endpoint to listen for incoming events from other services (like Customer or Order service)
  app.use("/app-events", async (req, res, next) => {
    const { payload } = req.body;
    service.SubscribeEvents(payload);
    // Log to show that the event was received — useful for debugging
    console.log(
      "================= Shopping service received event ================"
    );
    return res.status(200).json(payload);
  });
};
