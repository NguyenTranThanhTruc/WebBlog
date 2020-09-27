const express = require('express');
const route = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const config = require('config');
const jwt = require('jsonwebtoken');

// @route   POST API/users
// @desc    Register route
// @access  Public
route.post('/', [
    check('name', 'Name is required.')
        .not()
        .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a valid password with 6 or more characters.').isLength({ min: 6 })

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body;

    try {
        // check existed user
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exist' }] });
        }

        // config avatar
        const avatar = gravatar.url(email, {
            s: '200',    // size
            r: 'pg',     // rating
            d: 'mm'      // default
        })

        user = new User({
            name,
            email,
            avatar,
            password
        });

        // encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 36000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }

    console.log(req.body);
})

module.exports = route; 