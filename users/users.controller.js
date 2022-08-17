const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const { verifyUser, verifyAuditUser } = require("./../_helpers/auth");

const requestIp = require("request-ip")
// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', verifyUser, getAll);
router.get('/current', verifyUser, getCurrent);
router.get('/audit', verifyAuditUser, getAudits);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);
router.post('/logout', verifyUser, logout);


module.exports = router;

function authenticate(req, res, next) {

    const clientIp = req.headers.clientip.toString();
    const obj = {
        username: req.body.username,
        password: req.body.password,
        clientIp: clientIp
    }
    const role = req.body.role.toLowerCase();
    userService.authenticate(obj)
        .then(user => {
            if (user) {
                if (!role.includes(user.role.join('').toLowerCase())) {
                    return res.status(400).json({ message: 'Do not have access to ' + role + " role" })
                }
                return res.json(user)
            } else {
                return res.status(400).json({ message: 'Username or password is incorrect' })
            }
        }
        )
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function logout(req, res, next) {
    userService.logout(req.historyId)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAudits(req, res, next) {
    const skip = Number(req.query.skip);
    const limit = Number(req.query.limit)
    userService.audits(skip, limit)
        .then((data) => {
            res.json(data)
        })
        .catch(err => {
            next(err)

        });
}