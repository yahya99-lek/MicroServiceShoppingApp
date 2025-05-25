const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  APP_SECRET,
  QUEUE_NAME,
  EXCHANGE_NAME,
  CUSTOMER_BINDING_KEY,
} = require("../config");
const amqplib = require("amqplib");
const { MESSAGE_BROKER_URL } = require("../config");
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
    console.log(signature);
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

//create a channel
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


//Subscribe messages
module.exports.SubscribeMessage = async (channel, service) => {
  try {
    // Assert a queue if it doesn't exist already
    const appQueue = await channel.assertQueue(QUEUE_NAME);
    // Bind the queue to the exchange with the given binding key
    channel.bindQueue(appQueue.queue, EXCHANGE_NAME, CUSTOMER_BINDING_KEY);
    // Consume messages from the queue
    channel.consume(appQueue.queue, (data) => {
      console.log("received data");
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
