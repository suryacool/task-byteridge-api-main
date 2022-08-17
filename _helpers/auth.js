const jwt = require('jsonwebtoken');
const config = require('../config');
const verifyUser = (req, res, next) => {

    const token = req.headers.authorization.split(' ')[1];
    try {
        if (!token) {
            res.status(200).json({
                success: false, message: "Error! Token was not provided."
            });
        }
        //Decoding the token
        const decodedToken = jwt.verify(token, config.secret);
        req.historyId = decodedToken.historyId
        next()
    } catch (err) {
        // err
    }

}

const verifyAuditUser = async (req, res, next) => {

    const token = req.headers.authorization.split(' ')[1];
    try {
        if (!token) {
            return res.status(200).json({
                success: false, message: "Error! Token was not provided."
            });
        }
        //Decoding the token
        const decodedToken = jwt.verify(token, config.secret);

        if (decodedToken.role && decodedToken.role.join("").toLowerCase().includes("auditor")) {
            req.historyId = decodedToken.historyId
            next()
        } else {
            return res.status(200).json({
                success: false, message: "Unauthorized access"
            });
        }

    } catch (err) {
        // err
    }

}

module.exports = {
    verifyUser,
    verifyAuditUser
}