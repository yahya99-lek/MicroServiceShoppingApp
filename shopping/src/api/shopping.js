const ShoppingService = require("../services/shopping-service");
const UserAuth = require("./middlewares/auth");
const { SubscribeMessage, PublishMessage } = require("../utils");
const { CUSTOMER_BINDING_KEY } = require("../config");

module.exports = (app, channel) => {
  const service = new ShoppingService();
  //Subscribe to events from other services
  SubscribeMessage(channel, service);

  app.post("/order", UserAuth, async (req, res, next) => {
    const { _id } = req.user; // 1. Get the ID of the authenticated user
    const { txnNumber } = req.body; // 2. Get the transaction number from the request
    try {
      const { data } = await service.PlaceOrder({ _id, txnNumber }); // 3. Create a new order
      const payload = await service.GetOrderPayload(_id, data, "CREATE_ORDER"); // 4. Create an event payload for customer service
      PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(payload)); // 5. Send that payload to the customer service

      return res.status(200).json(data); // 6. Respond to client with the created order
    } catch (err) {
      next(err);
    }
  });

  app.get("/orders", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    try {
      const { data } = await service.GetOrders(_id);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/cart", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    try {
      const { data } = await service.GetCart(_id);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });
};
