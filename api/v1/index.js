const express = require('express')
const router = express.Router()
const Blogpost = require('../models/blogpost')

router.get('/ping', (req, res) => {
	res.status(200).json({msg: 'pong', date: new Date().toLocaleString()})
})

router.get('/blog-posts', (req, res) => {
	find()
		.sort({'createdOn': -1})
		.exec()
		.then(blogPosts => res.status(200).json(blogPosts))
		.catch(err => res.status(500).json({
			message: 'blog posts not found :(',
			error: err
		}))
})


// CREATE
router.post('/blog-posts', (req, res) => {
	console.log('req.body', req.body)
	const blogPost = new Blogpost(req.body)
	blogPost.save((err, blogPost) => {
		if (err) {
			return res.status(500).json(err)
		}
		res.status(201).json(blogPost)
	})
})


// READ
router.get('/blog-posts/:id', (req, res) => {
	const id = req.params.id
	findById(id)
		.then(blogPost => res.status(200).json(blogPost))
		.catch(err => res.status(500).json({
			message: `blog post with id ${id} not found`,
			err: err
		}))
})

// DELETE
router.delete('/blog-posts/:id', (req, res) => {
	const id = req.params.id
	findByIdAndDelete(id, (err, blogPost) => {
		if (err) {
			return res.status(500).json(err)
		}
		res.status(202).json({msg: `blog post with id ${blogPost._id} deleted !`})
	})
})

module.exports = router