

const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const morgan = require('morgan')
const FileStreamRotator = require('file-stream-rotator')

const port = 3000

const formidable = require('formidable')

const maxFieldsSize = 1 * 1024 * 1024 //内存大小

const maxFileSize = .3 * 1024 * 1024 //

const logDirectory = path.join(__dirname, 'log')


const server = require('http').createServer(app)

var privateKey  = fs.readFileSync(path.join(__dirname, './certificate/private.pem'), 'utf8');
var certificate = fs.readFileSync(path.join(__dirname, './certificate/ca.cer'), 'utf8');

var credentials = {key: privateKey, cert: certificate}

require('https').createServer(credentials,app).listen(port,()=>{
	console.log('HTTPS Server is running on: https://localhost:%s', port)
})


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

app.use('/uploads',express.static(__dirname + '/uploads/'))

// server.listen(port,()=>{
// 	console.log(`listen at ${port}`)
// })

//xhr
app.post('/uploadFile/:gameid/:userid', (request,response)=>{

	response.header('Access-Control-Allow-Origin','*')
	response.header('Access-Control-Allow-Credentials','true')

	var form = new formidable.IncomingForm()

	var dir = !!process.platform.match(/^win/) ? '\\uploads\\' : '/uploads/'

	form.uploadDir = __dirname + dir
    
	form.keepExtensions = true
	form.maxFieldsSize = maxFieldsSize
	form.maxFileSize = maxFileSize
	form.multiples = false

	form.parse(request, (err, fields, files) =>{

		if(err){
			console.log('err:',err)
			response.end(JSON.stringify({
				status: -1,
				message:'err',
				data:{}
			}))
			return 
		}

		// console.log(files.file.size,form.maxFieldsSize)

		const [,file_name,file_ext] = files.file.path.match(/([^\/]+)\.(wav|mp3|ogg)/)
		
		const fileURL = '//172.20.1.41:7878' +'/19/nodejs-cluster-redis/uploads/' + file_name+'.'+file_ext

   // console.log( `fileURL:${fileURL}`)
		response.end(JSON.stringify({
			status: 1,
			message:'success',
			data:{
				userid:request.params.userid+'@@@@@',
				fileURL,
				gameid:request.params.gameid
			}
		}))

	})

})

