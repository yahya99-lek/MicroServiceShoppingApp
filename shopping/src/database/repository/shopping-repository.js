const { OrderModel, CartModel } = require("../models");
const { v4: uuidv4 } = require("uuid");
const { APIError, BadRequestError } = require("../../utils/app-errors");

//Dealing with data base operations
class ShoppingRepository {
  // payment

  async Orders(customerId) {
    try {
      const orders = await OrderModel.find({ customerId });
      return orders;
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Orders"
      );
    }
  }

  async Cart(customerId) {
    console.log("customerId", customerId);
    try {
      const cartItems = await CartModel.find({ customerId: customerId });
      if (cartItems) {
        return cartItems;
      }
      throw new Error("No Cart Items Found");
    } catch (error) {
      throw error;
    }
  }

  async AddCartItem(customerId, item, qty, isRemove) {
    try {
      // Find the cart document associated with the given customer
      const cart = await CartModel.findOne({ customerId: customerId });
      const { _id } = item; // Extract product ID from the item

      if (cart) {
        let isExist = false; // Flag to check if the item already exists in the cart
        let cartItems = cart.items;

        if (cartItems.length > 0) {
          // Loop through each item in the cart
          cartItems.map((item) => {
            // Check if the current item matches the one to be added/updated/removed
            if (item.product._id.toString() === _id.toString()) {
              if (isRemove) {
                // If remove flag is true, remove the item from the cart
                cartItems.splice(cartItems.indexOf(item), 1);
              } else {
                // Otherwise, update the quantity of the existing item
                item.unit = qty;
              }
              isExist = true; // Mark that the item was found in the cart
            }
          });

          // If item wasn't found in the cart and it's not a remove operation, add it
          if (!isExist && !isRemove) {
            cartItems.push({
              product: { ...item }, // Add the new item
              unit: qty,
            });
          }

          cart.items = cartItems; // Update the cart's items
          return await cart.save(); // Save the updated cart to the database
        } else {
          // If the cart exists but is empty, add the first item
          return await CartModel.create({
            customerId: customerId,
            items: [
              {
                product: { ...item },
                unit: qty,
              },
            ],
          });
        }
      } else {
        // If no cart exists for the customer, create a new one with the item
        return await CartModel.create({
          customerId: customerId,
          items: [
            {
              product: { ...item },
              unit: qty,
            },
          ],
        });
      }
    } catch (err) {
      // Handle any errors that occur during the process
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Create Customer"
      );
    }
  }

  async CreateNewOrder(customerId, txnId) {
    //required to verify payment through TxnId

    const cart = await CartModel.findOne({ customerId: customerId });
    console.log("cart", cart);
    if (cart) {
      let amount = 0;

      let cartItems = cart.items;

      if (cartItems.length > 0) {
        cartItems.map((item) => {
          amount += parseInt(item.product.price) * parseInt(item.unit);
        });

        const orderId = uuidv4();

        const order = new OrderModel({
          orderId,
          customerId,
          amount,
          status: "received",
          items: cartItems,
        });

        cart.items = [];

        const orderResult = await order.save();
        await cart.save();
        return orderResult;
      }
    }

    return {};
  }
}

module.exports = ShoppingRepository;
