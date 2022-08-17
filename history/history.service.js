const db = require('./../_helpers/db');
const mongoose = require('mongoose');
const History = db.History;

module.exports = {
    add,
    updateHistory
};

async function add({ userId, clientip }) {
    const history = new History({ userId, clientip });
    const userHistory = await history.save();
    return userHistory;
}

async function updateHistory(historyId, active) {
    const id = mongoose.Types.ObjectId(historyId);
    const filter = { _id: id };

    await History.findOneAndUpdate(filter, { active: active });;
}