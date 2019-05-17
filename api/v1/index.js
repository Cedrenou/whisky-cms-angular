const express = require('express')
const router = express.Router()
const Blogpost = require('../models/blogpost')
const mongoose = require('mongoose')
const multer = require('multer')
const crypto = require('crypto')
const path = require('path')

router.get('/ping', (req, res) => {
	res.status(200).json({msg: 'pong', date: new Date().toLocaleString()})
})

router.get('/blog-posts', (req, res) => {
	Blogpost.find()
		.sort({'createdOn': -1})
		.exec()
		.then(blogPosts => res.status(200).json(blogPosts))
		.catch(err => res.status(500).json({
			message: 'blog posts not found :(',
			error: err
		}))
})

// File upload config
const storage = multer.diskStorage({
	destination: './uploads/',
	filename: function(req, file, callback) {
		crypto.pseudoRandomBytes(16, (err, raw) => {
			if(err) return
			//callback(null, raw.toString('hex') + path.extname(file.originalname))
			lastUploadedImageName = raw.toString('hex') + path.extname(file.originalname)
			console.log('lastUploadedImageName', lastUploadedImageName);
			callback(null, lastUploadedImageName)
		})
	}
})
const upload = multer({storage: storage})

// file upload
router.post('/blog-posts/images', upload.single('image'), (req,res) => {
	if(!req.file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
		res.status(400).json({msg: 'only image files please !'})
	}
	res.status(201).send({filename: req.file.filename, file: req.file})
})

// CREATE
router.post('/blog-posts', (req, res) => {
	console.log('req.body', req.body)
	// const blogPost = new Blogpost(req.body)

const blogPost = new Blogpost({...req.body, image: lastUploadedImageName})
	blogPost.save((err, blogPost) => {
		if (err) {
			return res.status(500).json(err)
		}
		res.status(201).json(blogPost)
	})
})

let lastUploadedImageName = ''


// READ
router.get('/blog-posts/:id', (req, res) => {
	const id = req.params.id
	Blogpost.findById(id)
		.then(blogPost => res.status(200).json(blogPost))
		.catch(err => res.status(500).json({
			message: `blog post with id ${id} not found`,
			err: err
		}))
})

// DELETE
router.delete('/blog-posts/:id', (req, res) => {
	const id = req.params.id
	Blogpost.findByIdAndDelete(id, (err, blogPost) => {
		if (err) {
			return res.status(500).json(err)
		}
		res.status(202).json({msg: `blog post with id ${blogPost._id} deleted !`})
	})
})

router.delete('/blog-posts', (req,res) => {
	const ids = req.query.ids
	console.log(ids)
	const allIds = ids.split(',').map(id => {
		if(id.match(/^[0-9a-fA-F]{24}$/)) {
			return mongoose.Types.ObjectId(id)
		} else {
			console.log('Id is not valid', id)
		}
	})
	const condition = {_id: {$in: allIds}}
	Blogpost.deleteMany(condition, (err, result) => {
		if (err) {
			return res.status(500).json(err)
		} 
		res.status(202).json(result)
	})
})

module.exports = router