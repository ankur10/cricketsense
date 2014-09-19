var fs = require('fs');

// configure redis settings
var REDIS_SERVER_HOST = "localhost";
var REDIS_SERVER_PORT = 6379;

var redis = require("redis");
var client1 = redis.createClient(REDIS_SERVER_PORT, REDIS_SERVER_HOST);


var SensorTag = require('sensortag');

var sensorTag = null;

var array_accelerometer = [];
var array_gyroscope = [];
var array_magnetometer = [];

var time_accel = Date.now();
var time_gyro = Date.now();
var time_mag = Date.now();


var KEY_ACCEL_DATA = "key_accelerometer_data";
var KEY_GYRO_DATA = "key_gyroscope_data";
var KEY_MAGNETO_DATA = "key_magenetometer_data";


// Gyroscope Period
var GYRO_PERIOD_UUID = 'f000aa5304514000b000000000000000'
SensorTag.prototype.setGyroscopePeriod = function(period, callback) {
    console.log("Inside my setGyroscopePeriod");
    this.writePeriodCharacteristic(GYRO_PERIOD_UUID, period, callback);
};



// Discover Sensortag
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

                var period = 140;
                sensorTag.setAccelerometerPeriod(period, function() {
                    sensorTag.notifyAccelerometer(function() {
                        console.log('notifyAccelerometer');

                        sensorTag.on('accelerometerChange', function(x, y, z) {
                            console.log("inside accelerometerChange --->", x, y, z);
                            var val = x + "," + y + "," + z;
                            client1.set(KEY_ACCEL_DATA, val);

                            fetchDataFromRedisandSaveInAFile();
                            
                            var n = Date.now();
                            var t = n - time_accel;
                            time_accel = n;
                            // console.log("Accel Time taken (in ms) ---> ", t);
                        });

                    });
                });
            });


            // -------------------------------------------------
            // Magnetometer
            sensorTag.enableMagnetometer(function() {

                var period = 160;
                sensorTag.setMagnetometerPeriod(period, function() {
                    sensorTag.notifyMagnetometer(function() {
                        console.log('notifyMagnetometer');

                        sensorTag.on('magnetometerChange', function(x, y, z) {
                            // console.log("inside magnetometerChange --->", x, y, z);
                            var val = x + "," + y + "," + z;
                            client1.set(KEY_MAGNETO_DATA, val);

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

                var period = 200;
                sensorTag.setGyroscopePeriod(period, function() {
                    sensorTag.notifyGyroscope(function() {
                        console.log('notifyGyroscope');

                        sensorTag.on('gyroscopeChange', function(x, y, z) {
                            // console.log("inside gyroscopeChange --->", x, y, z);
                            var val = x + "," + y + "," + z;
                            client1.set(KEY_GYRO_DATA, val);

                            var n = Date.now();
                            var t = n - time_gyro;
                            time_gyro = n;
                            // console.log("Gyro Time taken (in ms) ---> ", t);
                        });

                    });

                });
            });

        });

    });

});



var last_time = Date.now();


var send_data_period = 100;
// setInterval(fetchDataFromRedisandSaveInAFile, send_data_period);


var wstream = fs.createWriteStream('sensor_data.txt');


// -----------------------------------------------------
function fetchDataFromRedisandSaveInAFile() {
    var redis_keys_arr = [KEY_ACCEL_DATA, KEY_GYRO_DATA, KEY_MAGNETO_DATA];
    client1.mget(redis_keys_arr, function(err, results) {
        if (!err) {

            if (results.length > 0 && results[0] != null) {

                var accel_hash = {},
                    gyro_hash = {},
                    magneto_hash = {};

                var accel_data = results[0].split(",");
                accel_hash.x = parseFloat(accel_data[0], 10).toFixed(3);
                accel_hash.y = parseFloat(accel_data[1], 10).toFixed(3);
                accel_hash.z = parseFloat(accel_data[2], 10).toFixed(3);

                var gyro_data = results[1].split(",");
                gyro_hash.x = parseFloat(gyro_data[0], 10).toFixed(3);
                gyro_hash.y = parseFloat(gyro_data[1], 10).toFixed(3);
                gyro_hash.z = parseFloat(gyro_data[2], 10).toFixed(3);

                var magneto_data = results[2].split(",");
                magneto_hash.x = parseFloat(magneto_data[0], 10).toFixed(3);
                magneto_hash.y = parseFloat(magneto_data[1], 10).toFixed(3);
                magneto_hash.z = parseFloat(magneto_data[2], 10).toFixed(3);

                // write to file
                var time_stamp = Date.now();
                var txt_to_write = time_stamp + ",";
                txt_to_write += accel_hash.x + "," + accel_hash.y + "," + accel_hash.z + ",";
                txt_to_write += gyro_hash.x + "," + gyro_hash.y + "," + gyro_hash.z + ",";
                txt_to_write += magneto_hash.x + "," + magneto_hash.y + "," + magneto_hash.z;
                txt_to_write += "\n";

                console.log(txt_to_write);
                wstream.write(txt_to_write);
            }
        } else {
            console.log("error in fetching data from Redis for", redis_keys_arr);
        }
    });

}
