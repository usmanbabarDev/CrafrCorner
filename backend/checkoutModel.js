const mongoose = require("mongoose");

const checkoutSchema = new mongoose.Schema({
  // Existing fields
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: String,
  country: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: String,
  postcode: { type: String, required: true },
  phone: String,
  email: { type: String, required: true },
  notes: String,
  totalPrice: { type: Number, required: true },

  // New field referencing the CardDetail model
  cardDetail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CardDetail'
  }
});

const Checkout = mongoose.model("Checkout", checkoutSchema);

module.exports = Checkout;
