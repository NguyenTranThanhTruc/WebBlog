const express = require('express');
const Profile = require('../models/Profile');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');



// @route   GET API/profile/me
// @desc    Get logged in users profile 
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user.' });
        }
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }

})

// @route   POST API/profile/
// @desc    create profile 
// @access  Private

router.post('/', [
    check('status', 'Status is required.')
        .not()
        .isEmpty(),
    check('skills', 'Skills is required.')
        .not()
        .isEmpty()
], auth, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        company,
        website,
        location,
        status,
        skills,
        bio,
        githubusername,
        youtube,
        twitter,
        facebook,
        instagram,
        linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};

    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }
    console.log(profileFields.skills);

    // Build social object
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true });
            return res.json(profile);

        };

        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

// @route   GET API/profile/
// @desc    Get all profile 
// @access  Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);

    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server error');
    }
})


// @route   GET API/profile/user/:user_id
// @desc    Get all profile 
// @access  Private
router.get('/user/:user_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json('Profile not found.');
        }
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        if (err.kind === Object) {
            return res.status(400).json('Profile not found.');
        }
        res.status(500).json('Server error');
    }
})

// @route   DELETE  API/profile/
// @desc    DELETE profile, post, user 
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        // delete profile
        await Profile.findOneAndRemove({ user: req.user.id });

        // delete user
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User deleted.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server error');
    }
})

// @route   PUT  API/profile/
// @desc    PUT experience
// @access  Private
router.put('/', auth, [
    check('title', 'Title is required.')
        .not()
        .isEmpty(),
    check('Company', 'Company is required.')
        .not()
        .isEmpty(),
    check('from', 'The time is required.')
        .not()
        .isEmpty()
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }



    try {


    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server error');
    }
})

module.exports = router;