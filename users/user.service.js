const config = require('config.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;
const historyService = require('./../history/history.service');
module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    logout,
    audits
};

async function authenticate({ username, password, clientIp }) {
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.hash)) {
        console.log("user hash")
        console.log(user.hash)
        console.log("password")
        console.log(password)
        
        const { hash, ...userWithoutHash } = user.toObject();
        const history = await historyService.add({ userId: user['_id'], clientip: clientIp })
        const token = jwt.sign({ sub: user.id, role: user.role, historyId: history['_id'] }, config.secret);
        return {
            ...userWithoutHash,
            token
        };
    }
}

async function getAll() {
    return await User.find().select('-hash');
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}

async function logout(historyId) {
    // const user = await User.findOne({ username });
    await historyService.updateHistory(historyId, false)
}

async function audits(skip = 0, limit = 5) {

    return await User.aggregate([
        { $project: { username: 1, firstName: 1, lastName: 1, role: 1, createdDate: 1 } },
        {
            $lookup: {
                from: "histories",
                localField: "_id",
                foreignField: "userId",
                as: "history_info",
            },
        },


        // Deconstructs the array field from the
        // input document to output a document
        // for each element
        {
            $unwind: "$history_info",
        },
        { $skip: skip },
        { $limit: limit },
    ])
}