const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");

const {
  APP_SECRET,
  MESSAGE_BROKER_URL,
  EXCHANGE_NAME,
  QUEUE_NAME,
  SHOPPING_BINDING_KEY,
} = require("../config");


//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

/*-------------------------Message Broker---------------------- */

//craete a channel
module.exports.CreateChannel = async () => {
  try {
    // Connect to RabbitMQ server using provided URL
    const connection = await amqplib.connect(MESSAGE_BROKER_URL);
    // Create a channel within the connection
    const channel = await connection.createChannel();
    // Assert an exchange if it doesn't exist already
    await channel.assertExchange(EXCHANGE_NAME, "direct", false);
    // Return the channel object
    return channel;
  } catch (error) {
    // Log any errors encountered during creation
    console.log("Error in creating channel", error);
    throw error;
  }
};

//Publish messages
module.exports.PublishMessage = async (channel, binding_key, message) => {
  try {
    // Publish the message to the exchange with the given binding key
    await channel.publish(
      EXCHANGE_NAME,
      SHOPPING_BINDING_KEY,
      Buffer.from(message)
    );
    console.log("Message published to exchange:", message);
  } catch (error) {
    // Throw any errors encountered during publishing
    throw error;
  }
};
//Subscribe messages
module.exports.SubscribeMessage = async (channel, service) => {
  try {
    // Assert a queue if it doesn't exist already
    const appQueue = await channel.assertQueue(QUEUE_NAME, {
      durable: true,
    });
    // Bind the queue to the exchange with the given binding key
    channel.bindQueue(appQueue.queue, EXCHANGE_NAME, SHOPPING_BINDING_KEY);
    // Consume messages from the queue
    channel.consume(appQueue.queue, (data) => {
      console.log("received data IN SHOPPING SERVICE");
      console.log(data.content.toString()); // Convert Buffer to String
      service.SubscribeEvents(data.content.toString()); // Call the SubscribeEvents method with the message data
      channel.ack(data); // Acknowledge receipt of the message
    });
  } catch (error) {
    // Log any errors encountered during subscription
    console.log("Error in subscribing message", error);
    throw error;
  }
};
