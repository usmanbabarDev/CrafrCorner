const mongoose = require("mongoose");

const cardDetailSchema = new mongoose.Schema({
  cardNumber: { type: String, required: true },
  cvv: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const CardDetail = mongoose.model("CardDetail", cardDetailSchema);

module.exports = CardDetail;
