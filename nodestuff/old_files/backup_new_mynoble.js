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

            setInterval(async_measuredata, 1500);
        });

    });

});


var ctr = 1;

function measureData() {

    var cur_time = Date.now();

    var ax, ay, az, gx, gy, gz, mx, my, mz;

    sensorTag.readAccelerometer(function(x, y, z) {
        ax = x, ay = y, az = z;

        sensorTag.readMagnetometer(function(x1, y1, z1) {
            mx = x1, my = y1, mz = z1;

            sensorTag.readGyroscope(function(x2, y2, z2) {
                gx = x2, gy = y2, gz = z2;

                var time_taken = Date.now() - cur_time;
                console.log(ctr, time_taken, ax, ay, az, gx, gy, gz, mx, my, mz);
                ctr = ctr + 1;
                measureData();
            });


        });


    });

}



// setInterval(async_measuredata, 500);

function async_measuredata() {

    var cur_time = Date.now();


    sensorTag.readGyroscope(function(x, y, z) {
        var time_taken = Date.now() - cur_time;

        console.log("Inside readGyroscope --->   ", time_taken, x, y, z);
        array_gyroscope.push({
            x: x,
            y: y,
            z: z
        });
    });


    sensorTag.readMagnetometer(function(x, y, z) {

        var time_taken = Date.now() - cur_time;

        console.log("Inside readMagnetometer --->   ", time_taken, x, y, z);
        array_magnetometer.push({
            x: x,
            y: y,
            z: z
        });
    });

    sensorTag.readAccelerometer(function(x, y, z) {

        var time_taken = Date.now() - cur_time;

        console.log("Inside readAccelerometer --->   ", time_taken, x, y, z);
        array_accelerometer.push({
            x: x,
            y: y,
            z: z
        });
    });

}



setInterval(sendDataOnwards, 500);


var array_accelerometer = [];
var array_gyroscope = [];
var array_magnetometer = [];


function sendDataOnwards() {

    var accelerometer_data = array_accelerometer.shift();
    var gyroscope_data = array_gyroscope.shift();
    var magnetometer_data = array_magnetometer.shift();

    if (accelerometer_data && gyroscope_data && magnetometer_data) {

        var h = {};
        h.accelerometer_data = accelerometer_data;
        h.gyroscope_data = gyroscope_data;
        h.magnetometer_data = magnetometer_data;
        h.time_stamp = Date.now();

        console.log(h);
    } else {
        console.log("unnnn  accelerometer_data=", accelerometer_data);
        console.log("unnnn  gyroscope_data=", gyroscope_data);
        console.log("unnnn  magnetometer_data=", magnetometer_data);
    }

}
