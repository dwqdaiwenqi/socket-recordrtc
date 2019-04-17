const express = require('express')
const app = express()
const http = require('http')
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const bodyParser = require('body-parser');

// let a  = 1231


app.use(express.static(__dirname+'/',{index:'index.html'})); 

const port = 2333


app.use( bodyParser.urlencoded({extended: true ,limit: '10mb'}) )


console.log(`listen at ${port}`)
server.listen(port)


app.post('/uploadFile/:userid', (request, response)=>{

	// console.log(`attr 2:${socket}`)
	response.header('Access-Control-Allow-Origin', '*')

	console.log(`userid:${request.params.userid}`)

	// parse a file upload
	var mime = require('mime');
	var formidable = require('formidable');
	var util = require('util');

	var form = new formidable.IncomingForm();

	var dir = !!process.platform.match(/^win/) ? '\\uploads\\' : '/uploads/';

	form.uploadDir = __dirname + dir;

	//console.log(`uploadDir:${form.uploadDir}`)
	//console.log(`request:${request}`)
	form.keepExtensions = true;
	form.maxFieldsSize = 10 * 1024 * 1024;
	form.maxFields = 1000;
	form.multiples = false;


			
	function getHeaders(opt, val) {
			try {
					var headers = {};
					headers["Access-Control-Allow-Origin"] = "https://secure.seedocnow.com";
					headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
					headers["Access-Control-Allow-Credentials"] = true;
					headers["Access-Control-Max-Age"] = '86400'; // 24 hours
					headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";

					if (opt) {
							headers[opt] = val;
					}

					return headers;
			} catch (e) {
					return {};
			}
	}


	form.parse(request, function(err, fields, files) {
			const file = util.inspect(files);
			
			// console.log(file.split('path:'))

			// var ar = file.match(/name\:(.+)\,/)
			//console.log(ar[1])

			response.writeHead(200, getHeaders('Content-Type', 'application/json'));
			
			const fileName = file.split('path:')[1].split('\',')[0].split(dir)[1].toString().replace(/\\/g, '').replace(/\//g, '');
			const fileURL = 'http://' + 'localhost' + ':' + port + '/uploads/' + fileName;

			response.write(JSON.stringify({
				status:'1',
				message:'success!!!!!',
				data:{
					userid:request.params.userid+'@@@@@',
					fileURL
				}

			}))
			response.end()


			io.emit('server-client:uploadfile',{
				userid:request.params.userid,
				fileURL
			})

	});

})


io.on("connection",function(socket){
		console.log("a user connected");

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
