/* /app-events acts as an entry point for event communication between microservices.
Instead of making a direct HTTP call from one microservice to another,
 services send events (like “ADD_TO_CART” or “CREATE_ORDER”) to this endpoint.
These events are received as JSON payloads, which are then passed to the SubscribeEvents() function of CustomerService. 
Loose Coupling: Services don’t depend directly on each other’s APIs.
*/

const ProductService = require("../services/product-service");
module.exports = (app) => {
  // Define an endpoint to listen for incoming events from other services (like Customer or Order service)
  app.use("/app-events", async (req, res, next) => {
    const { payload } = req.body;
    // Log to show that the event was received — useful for debugging
    console.log(
      "================= Products service received event ================"
    );
    return res.status(200).json(payload);
  });
};
