var express = require('express'); 
var app = express();
var http = require('http')
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var bodyParser = require('body-parser');


// app.use('/', express.static(__dirname + '/public')); 

app.use(express.static(__dirname+'/',{index:'index.html'})); 

var port = 80


app.use(
	bodyParser.urlencoded({extended: true ,limit: '10mb'})
)

app.post('/uploadFile', (request, response)=>{
    response.header('Access-Control-Allow-Origin', '*')
    
    // parse a file upload
    var mime = require('mime');
    var formidable = require('formidable');
    var util = require('util');

    var form = new formidable.IncomingForm();

    var dir = !!process.platform.match(/^win/) ? '\\uploads\\' : '/uploads/';

    form.uploadDir = __dirname + dir;
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
        var file = util.inspect(files);
        

        // console.log(file.split('path:'))

        var ar = file.match(/name\:(.+)\,/)
        console.log(ar[1])

        response.writeHead(200, getHeaders('Content-Type', 'application/json'));
				
        var fileName = file.split('path:')[1].split('\',')[0].split(dir)[1].toString().replace(/\\/g, '').replace(/\//g, '');
        // var fileURL = 'http://' + app.address + ':' + port + '/uploads/' + fileName;

        // var fileURL = 'http://' + 'localhost:80' + '/uploads/' + fileName;
        var fileURL = 'http://' + 'localhost:80' + '/uploads/' + ar[1].trim().replace(/\'/g,'')


        console.log('fileURL: ', fileURL);

        //console.log(app)
        response.write(JSON.stringify({
            fileURL: fileURL
        }));
        response.end();
    });
 
})

server.listen(port);
console.log( `at ${port}!`)

io.on("connection",function(socket){
    console.log("a user connected");

    socket.on("disconnect",function(){
        console.log("a user disconnect");
        io.emit("server-client:disconnect",{
            user_id : socket.name
        });
    });

    socket.on("client-server:join",function(data){
        var userid = data.userid;
        socket.name = userid;
        io.emit("server-client:join",{
            msg : "join ok",
            userid : userid
        });
    });

    socket.on("client-server:message",function(data){
        io.emit("server-client:message",data);
    });

});


