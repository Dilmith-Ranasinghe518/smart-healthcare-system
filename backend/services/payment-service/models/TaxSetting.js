const mongoose = require("mongoose");

const taxSettingSchema = new mongoose.Schema({
  percentage: {
    type: Number,
    required: true,
    default: 5, // Default 5%
    min: 0,
    max: 100
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("TaxSetting", taxSettingSchema);
