const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');




// @router   POST API/posts
// @desc    Create a post
// @access  Public
router.post('/', auth, [
    check('text', 'Text is required.')
        .not()
        .isEmpty()
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            user: req.user.id,
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
        });

        await newPost.save();
        res.json(newPost);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error.');
    }
})

// @router  GET API/posts
// @desc    get all post
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 })
        res.json(posts);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error.');
    }
})

// @router  GET API/posts/:id
// @desc    get a post
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('users', ['name', 'avatar']);

        if (!post) {
            return res.status(400).json({ msg: 'Post not found.' })
        }

        res.json(post);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error.');
    }
})

// @router  DELETE API/posts/:id
// @desc    get a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findByIdAndRemove(req.params.id).populate('users', ['name', 'avatar']);

        if (!post) {
            return res.status(400).json({ msg: 'Post not found.' })
        }
        
        res.json({msg:'Deleted post.'});

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error.');
    }
})

module.exports = router;