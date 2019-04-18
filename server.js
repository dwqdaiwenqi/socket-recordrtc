const express = require('express')
const app = express()
const http = require('http')
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const bodyParser = require('body-parser')
const formidable = require('formidable')

const shell = require('shelljs')

const port = 2333
const maxFieldsSize = 1 * 1024 * 1024 //内存大小
const maxFileSize = .3 * 1024 * 1024 //

// console.log(`####${Date.now()}`)

app.use(express.static(__dirname+'/',{index:'index.html'})) 

app.use('/uploads',express.static(__dirname + '/uploads/'))


app.use( bodyParser.urlencoded({extended: true ,limit: '1mb'}) )


console.log(`listen at ${port}`)
server.listen(port)


app.post('/uploadFile/:userid', (request, response)=>{
	response.header('Access-Control-Allow-Origin', '*')

	console.log(`userid:${request.params.userid}`)

	// parse a file upload

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
		
		const fileURL = 'http://' + 'localhost' + ':' + port + '/uploads/' + file_name+'.'+file_ext

		response.end(JSON.stringify({
			status: 1,
			message:'success',
			data:{
				userid:request.params.userid+'@@@@@',
				fileURL
			}
		}))

		io.emit('server-client:uploadfile',{
			userid:request.params.userid,
			fileURL
		})

	})

})
// 20秒150kb

// ffmpeg -i  uploads/upload_4bd5622758528ad8e3daf25c39042649.wav -acodec libmp3lame audio.mp3

// pm2 start server.js
// pm2 stop server.js
// pm2 logs
// pm2 list
// pm2 restart all
io.on("connection",function(socket){
		console.log("a user connected")

    socket.on("disconnect",function(){
        console.log("a user disconnect");
        io.emit("server-client:disconnect",{
            user_id : socket.name
        });
    });

		
    socket.on("client-server:join",function(data){

				socket.name = data.userid;

        io.emit("server-client:join",{
            msg : "join ok",
            userid:data.userid
        });
    });

    // socket.on("client-server:message",function(data){
    //     io.emit("server-client:message",data);
    // });

});
// // debugger
