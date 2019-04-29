

const express = require('express')
const app = express()

const fs = require('fs')
const path = require('path')

const morgan = require('morgan')
const FileStreamRotator = require('file-stream-rotator')

const server = require('http').createServer(app)


// var privateKey  = fs.readFileSync(path.join(__dirname, './certificate/private.pem'), 'utf8');
// var certificate = fs.readFileSync(path.join(__dirname, './certificate/ca.cer'), 'utf8');
// var credentials = {key: privateKey, cert: certificate};
// const server = require('https').createServer(credentials,app)


const port = 3004


const logDirectory = path.join(__dirname, 'log')

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


server.listen(port,()=>{
	console.log(`listen at ${port}`)
})

const io = require('socket.io')(server)

//不同进程或服务器共享
const redisAdapter = require('socket.io-redis')
io.adapter(redisAdapter({ host: 'localhost', port: 6379 }))

app.get('/',(req, res)=>{
	res.sendFile(path.join(__dirname, './index.html'))
})


io.on('connection',function(socket){
	// setInterval(()=>{
	// 	io.emit('xmessage',{msg:'from 3004!'})
	// },3333)
	
	socket.on('client->server:event1',data=>{
		io.emit('server->client:event1',{msg: 'from port 3004～'})
		// console.log('client->server:event!!!!',data)
	})
	
})
// // debugger