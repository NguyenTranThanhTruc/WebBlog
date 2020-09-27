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
            return res.status(404).json({ msg: 'Post not found.' })
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
            return res.status(404).json({ msg: 'Post not found.' })
        }

        res.json({ msg: 'Deleted post.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error.');
    }
})

// @router  PUT API/posts/like/:id
// @desc    like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found.' })
        }

        // check if the post has already liked
        if (
            post.likes.filter(like => like.user.toString() === req.user.id).length > 0
        ) {
            return res.status(404).json({ msg: 'Post already liked.' });
        }

        post.likes.unshift({ user: req.user.id });
        post.save();
        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error.');
    }
})

// @router  PUT API/posts/unlike/:id
// @desc    unlike a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found.' })
        }

        // check if the post has not liked
        if (
            post.likes.filter(like => like.user.toString() === req.user.id).length === 0
        ) {
            return res.status(404).json({ msg: 'Post has not yet been liked.' });
        }
        const removeIndex = post.likes
            .map(i => i.id)
            .indexOf(req.user.id)

        await post.likes.splice(removeIndex, 1);
        post.save();

        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error.');
    }
})

// @router  POST API/posts/comments/:id
// @desc    Add a comment to a post
// @access  Private
router.post('/comments/:id', auth, [
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

        const post = await Post.findById(req.params.id);

        const newComment = {
            user: req.user.id,
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
        };

        await post.comments.unshift(newComment);
        post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error.');
    }
})

// @router  POST API/posts/comments/:id/:comment_id
// @desc    Delete a comment to a post
// @access  Private
router.delete('/comments/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('users', ['name', 'avatar']);

        const removeComment = await post.comments.find(comment=>comment.id ===req.params.comment_id)

        // check existed comment
        if (!removeComment) {
            return res.status(404).json({ msg: 'Comment not existed.' })
        }

        // check user
        if(removeComment.user.toString() !== req.user.id)
        {
            return res.status(401).json({msg:'User not authorized.'})
        }

        const removeIndex = post.comments
        .map(i => i.id)
        .indexOf(req.user.id)

        await post.comments.splice(removeIndex, 1);
        post.save();
        res.json({ msg: 'Deleted post.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error.');
    }
})

module.exports = router;