const { ObjectId } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  userId: { type: ObjectId, required: true },
  clientip: { type: String, required: true },
  active: { type: Boolean, required: true, default: true }
}
  ,
  {
    timestamps: true
  });

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('History', schema);