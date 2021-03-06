var REDIS_SERVER_HOST = "localhost";
var REDIS_SERVER_PORT = 6379;

// configure redis settings
var redis = require("redis");
var client1 = redis.createClient(REDIS_SERVER_PORT, REDIS_SERVER_HOST);
var client2 = redis.createClient(REDIS_SERVER_PORT, REDIS_SERVER_HOST);


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



var SensorTag = require('sensortag');

var sensorTag = null;

var array_accelerometer = [];
var array_gyroscope = [];
var array_magnetometer = [];
var channel_name_sensor = "sensor_value_updated";



var KEY_ACCEL_DATA = "key_accelerometer_data";
var KEY_GYRO_DATA = "key_gyroscope_data";
var KEY_MAGNETO_DATA = "key_magenetometer_data";

var time_accel = Date.now();
var time_gyro = Date.now();
var time_mag = Date.now();


// Gyroscope Meter
var GYRO_PERIOD_UUID = 'f000aa5304514000b000000000000000'
SensorTag.prototype.setGyroscopePeriod = function(period, callback) {
    console.log("Inside my setGyroscopePeriod");
    this.writePeriodCharacteristic(GYRO_PERIOD_UUID, period, callback);
};


SensorTag.discover(function(tag) {

    sensorTag = tag;
    console.log('discover');
    console.log(sensorTag);

    sensorTag.connect(function() {
        console.log('connect');

        sensorTag.discoverServicesAndCharacteristics(function() {
            console.log('discoverServicesAndCharacteristics');


            // -------------------------------------------------
            // Accelerometer
            sensorTag.enableAccelerometer(function() {

                var period = 50;
                sensorTag.setAccelerometerPeriod(period, function() {
                    sensorTag.notifyAccelerometer(function() {
                        console.log('notifyAccelerometer');

                        sensorTag.on('accelerometerChange', function(x, y, z) {
                            // console.log("inside accelerometerChange --->", x, y, z);
                            var val = x + "," + y + "," + z;
                            client1.set(KEY_ACCEL_DATA, val);
                            client1.publish(channel_name_sensor, KEY_ACCEL_DATA);

                            var n = Date.now();
                            var t = n - time_accel;
                            time_accel = n;
                            console.log("Accel Time taken (in ms) ---> ", t);
                        });

                    });
                });
            });


            // -------------------------------------------------
            // Magnetometer
            sensorTag.enableMagnetometer(function() {

                var period = 50;
                sensorTag.setMagnetometerPeriod(period, function() {
                    sensorTag.notifyMagnetometer(function() {
                        console.log('notifyMagnetometer');

                        sensorTag.on('magnetometerChange', function(x, y, z) {
                            // console.log("inside magnetometerChange --->", x, y, z);
                            var val = x + "," + y + "," + z;
                            client1.set(KEY_MAGNETO_DATA, val);
                            client1.publish(channel_name_sensor, KEY_MAGNETO_DATA);


                            var n = Date.now();
                            var t = n - time_mag;
                            time_mag = n;
                            // console.log("Mag Time taken (in ms) ---> ", t);                            
                        });
                    });
                });
            });



            // -------------------------------------------------
            // Gyroscope
            sensorTag.enableGyroscope(function() {

                var period = 50;
                sensorTag.setGyroscopePeriod(period, function() {
                    sensorTag.notifyGyroscope(function() {
                        console.log('notifyGyroscope');

                        sensorTag.on('gyroscopeChange', function(x, y, z) {
                            // console.log("inside gyroscopeChange --->", x, y, z);
                            var val = x + "," + y + "," + z;
                            client1.set(KEY_GYRO_DATA, val);
                            client1.publish(channel_name_sensor, KEY_GYRO_DATA);

                            var n = Date.now();
                            var t = n - time_gyro;
                            time_gyro = n;
                            console.log("Gyro Time taken (in ms) ---> ", t);
                        });

                    });

                });
            });

        });

    });

});





// --------------------------------
// Read and send data

client2.subscribe(channel_name_sensor);

var last_time = Date.now();

client2.on("message", function(channel, msg) {

    if (channel === channel_name_sensor) {
        fetchDataFromRedisandSendOnSocket();
    }
});



setInterval(fetchDataFromRedisandSendOnSocket, send_data_period);


// -----------------------------------------------------
function fetchDataFromRedisandSendOnSocket() {
    var redis_keys_arr = [KEY_ACCEL_DATA, KEY_GYRO_DATA, KEY_MAGNETO_DATA];
    client1.mget(redis_keys_arr, function(err, results) {

        if (!err) {

            var accel_arr = [],
                gyro_arr = [],
                magneto_arr = [];

            var accel_hash = {},
                gyro_hash = {},
                magneto_hash = {};

            var accel_data = results[0].split(",");
            accel_hash.x = parseFloat(accel_data[0], 10);
            accel_hash.y = parseFloat(accel_data[1], 10);
            accel_hash.z = parseFloat(accel_data[2], 10);


            var gyro_data = results[1].split(",");
            gyro_hash.x = parseFloat(gyro_data[0], 10);
            gyro_hash.y = parseFloat(gyro_data[1], 10);
            gyro_hash.z = parseFloat(gyro_data[2], 10);


            var magneto_data = results[2].split(",");
            magneto_hash.x = parseFloat(magneto_data[0], 10);
            magneto_hash.y = parseFloat(magneto_data[1], 10);
            magneto_hash.z = parseFloat(magneto_data[2], 10);

            var h = {};
            h.accelerometer_data = accel_hash;
            h.gyroscope_data = gyro_hash;
            h.magnetometer_data = magneto_hash;
            h.time_stamp = Date.now();

            var t = h.time_stamp - last_time;
            last_time = h.time_stamp;

            io.emit('ti_sensor_tag_data', {
                ti_sensor_tag_data: h
            });

        } else {
            console.log("error in fetching data from Redis for", redis_keys_arr);
        }
    });



}
