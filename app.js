const express = require('express')
const app = express()
const api = require('./api/v1/index')
const bodyparser = require('body-parser')
const cors = require('cors')

const mongoose = require('mongoose')
const connection = mongoose.connection

app.set('port', (process.env.port || 3000))

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
	extended: false
}))
app.use(cors())

const uploadsDir = require('path').join(__dirname, '/uploads')
console.log('uploadsDir', uploadsDir)
app.use(express.static(uploadsDir))

app.use('/api/v1', api)

app.use((req, res) => {
	const err = new Error('404 - not found !!!')
	err.status = 404
	res.json({
		msg: '404 - not found !!!',
		err: err
	})
})

mongoose.connect('mongodb://localhost:27017/whiskycms', {
	useNewUrlParser: true
})
connection.on('error', (err) => {
	console.error(`connection to MongoDB error: ${err.message}`)
})

connection.once('open', () => {
	console.log('Connected to MongoDB')

	app.listen(app.get('port'), () => {
		console.log(`express-server listening on port ${app.get('port')}`)
	})
})