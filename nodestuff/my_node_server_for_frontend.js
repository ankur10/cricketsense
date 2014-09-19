

var REDIS_SERVER_HOST = "localhost";
var REDIS_SERVER_PORT = 6379;

// configure redis settings
var redis = require("redis");
var redis_client = redis.createClient(REDIS_SERVER_PORT, REDIS_SERVER_HOST);


var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(4545);

function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
        function(err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}



io.on('connection', function (socket) {
  
  socket.emit('ankur_news', { hello: 'world says hello.....' });
  


  // send socket data
  socket.on('fetch_redis_sensor_data', function (values) {

    var key_name = values.shot_value;
    redis_client.hgetall(key_name, function(err, d) {
        var x = JSON.parse(d.json_data);
        console.log("sending json data over socket");
        socket.emit('sensor_data', { sensor_data: x });
    });
  });


  socket.on('myconnected', function (data) {
    console.log("inside myconnected");
    console.log(data);
  });
  


});



