var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(4545);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', function (socket) {
  
  socket.emit('news', { hello: 'world says hello.....' });
  
  socket.on('my other event', function (data) {
    console.log("inside my other event");    
    console.log(data);
  });


  socket.on('myconnected', function (data) {
    console.log("inside myconnected");
    console.log(data);
  });
  

  socket.on('device_motion_event', function (data) {
    console.log("inside device_motion_event");
    console.log(data);

    console.log("sending data to device_event_returned");
    io.emit('device_event_channel', { device_motion_event: data});

  });


  socket.on('device_orientation_event', function (data) {
    console.log("inside device_orientation_event");
    console.log(data);

    console.log("sending data to device_event_returned");
    io.emit('device_orientation_channel', { device_orientation_event: data});

  });


});


