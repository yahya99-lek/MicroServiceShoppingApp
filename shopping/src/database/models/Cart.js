const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CartSchema = new Schema(
  {
    customerId: String,
    items: [
      {
        product: {
          _id: { type: String, required: true },
          name: { type: String },
          desc: { type: String },
          price: { type: Number },
          type: { type: String },
          unit: { type: String },
          banner: { type: String },
          suplier: { type: String },
        },
        unit: { type: Number, require: true },
      },
    ],
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

module.exports = mongoose.model("cart", CartSchema);
