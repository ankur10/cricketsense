
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



var SensorTag = require('sensortag');

var sensorTag = null;

var array_accelerometer = [];
var array_gyroscope = [];
var array_magnetometer = [];


SensorTag.discover(function(tag) {

    sensorTag = tag;
    console.log('discover');
    console.log(sensorTag);

    sensorTag.connect(function() {
        console.log('connect');

        sensorTag.discoverServicesAndCharacteristics(function() {
            console.log('discoverServicesAndCharacteristics');

            var accelerometer_enabled = false;
            var gyroscope_enabled = false;
            var magnetometer_enabled = false;

            sensorTag.enableAccelerometer(function() {
                sensorTag.notifyAccelerometer(function() {
                    console.log('notifyAccelerometer');
                    accel_enabled = true;
                });
            });


            sensorTag.enableMagnetometer(function() {

                var period = 300;
                sensorTag.setMagnetometerPeriod(period, function() {
                    sensorTag.notifyMagnetometer(function() {
                        console.log('notifyMagnetometer');
                        magnetometer_enabled = true;
                    });
                });
            });

            sensorTag.enableGyroscope(function() {
                sensorTag.notifyGyroscope(function() {
                    console.log('notifyGyroscope');
                    gyroscope_enabled = true;
                });
            });

            var flag = true;

            setInterval(async_measuredata, 500);
        });

    });

});


// --------------------------------
function async_measuredata() {

    var cur_time = Date.now();

    sensorTag.readGyroscope(function(x, y, z) {
        var time_taken = Date.now() - cur_time;

        // console.log("Inside readGyroscope --->   ", time_taken, x, y, z);
        array_gyroscope.push({
            x: x,
            y: y,
            z: z
        });
    });

    sensorTag.readMagnetometer(function(x, y, z) {

        var time_taken = Date.now() - cur_time;

        // console.log("Inside readMagnetometer --->   ", time_taken, x, y, z);
        array_magnetometer.push({
            x: x,
            y: y,
            z: z
        });
    });

    sensorTag.readAccelerometer(function(x, y, z) {

        var time_taken = Date.now() - cur_time;

        // console.log("Inside readAccelerometer --->   ", time_taken, x, y, z);
        array_accelerometer.push({
            x: x,
            y: y,
            z: z
        });
    });

}



// --------------------------------
// Send data

var time_interval_send_data = 300;  // in ms
setInterval(sendDataOnwards, time_interval_send_data);

function sendDataOnwards() {

    var accel_data = null;
    var gyro_data = null;
    var magneto_data = null;

    if(array_accelerometer.length > 0){
    	accel_data = array_accelerometer[0];
    }
    if(array_gyroscope.length > 0){
    	gyro_data = array_gyroscope[0];
    }
    if(array_accelerometer.length > 0){
    	magneto_data = array_magnetometer[0];
    }


    if (accel_data && gyro_data && magneto_data) {

        var h = {};
        h.accelerometer_data = accel_data;
        h.gyroscope_data = gyro_data;
        h.magnetometer_data = magneto_data;
        h.time_stamp = Date.now();

        console.log(h);

		io.emit('ti_sensor_tag_data', { ti_sensor_tag_data: h});

		array_accelerometer.shift();
		array_gyroscope.shift();
		array_magnetometer.shift();


    } else {
        // console.log("unnnn  accelerometer_data=", accelerometer_data);
        // console.log("unnnn  gyroscope_data=", gyroscope_data);
        // console.log("unnnn  magnetometer_data=", magnetometer_data);
    }

}
