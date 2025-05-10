/* /app-events acts as an entry point for event communication between microservices.
Instead of making a direct HTTP call from one microservice to another,
 services send events (like “ADD_TO_CART” or “CREATE_ORDER”) to this endpoint.
These events are received as JSON payloads, which are then passed to the SubscribeEvents() function of CustomerService. 
Loose Coupling: Services don’t depend directly on each other’s APIs.
*/

const CustomerService = require("../services/customer-service");

module.exports = (app) => {
  // Create an instance of the CustomerService to use its methods
  const service = new CustomerService();

  // Define an endpoint to listen for incoming events from other services (like Product or Order service)
  app.use("/app-events", async (req, res, next) => {
    // Destructure the payload from the request body
    const { payload } = req.body || {};
  
    // Pass the event payload to the service to handle different types of events
    service.SubscribeEvents(payload);

    // Log to show that the event was received — useful for debugging
    console.log(
      "================= Customer service received event ================"
    );

    // Respond with the received payload as confirmation
    return res.status(200).json(payload);
  });
};
