

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const fs = require('fs')
const path = require('path')
const morgan = require('morgan')
const FileStreamRotator = require('file-stream-rotator')

const port = 3000

var logDirectory = path.join(__dirname, 'log')

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDirectory, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}))

app.use(express.static(__dirname+'/public',{index:'index.html'}))
app.use(express.static(path.join(__dirname, 'public')))



server.listen(port,()=>{
	console.log(`listen at ${port}`)
})

// app.get('/',(req, res)=>{
// 	res.sendFile(path.join(__dirname, './index.html'))
// })


// // // /////////




// const express = require('express')
// const app = express()
// const server = require('http').createServer(app)
// const fs = require('fs')
// const path = require('path')
// const morgan = require('morgan')
// const FileStreamRotator = require('file-stream-rotator')

// const port = 3000

// var logDirectory = path.join(__dirname, 'log')

// // ensure log directory exists
// fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// // create a rotating write stream
// var accessLogStream = FileStreamRotator.getStream({
//   date_format: 'YYYYMMDD',
//   filename: path.join(logDirectory, 'access-%DATE%.log'),
//   frequency: 'daily',
//   verbose: false
// })

// // setup the logger
// app.use(morgan('combined', {stream: accessLogStream}))

// app.use(express.static(__dirname+'/public',{index:'index.html'}))
// app.use(express.static(path.join(__dirname, 'public')))


// server.listen(port,()=>{
// 	console.log(`listen at ${port}`)
// })



// // debugger