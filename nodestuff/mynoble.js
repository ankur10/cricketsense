var SensorTag = require('sensortag');

var last_time_accel = Date.now();
var last_time_mag = last_time_accel;
var last_time_gyro = last_time_accel;

SensorTag.discover(function(sensorTag) {
  console.log('discover');
  console.log(sensorTag);

  sensorTag.connect(function() {
    console.log('connect');



    sensorTag.discoverServicesAndCharacteristics(function() {
      console.log('discoverServicesAndCharacteristics');

      sensorTag.enableAccelerometer(function() {
        sensorTag.on('accelerometerChange', function(x, y, z) {

        	var cur_time = Date.now();
        	var delta = cur_time - last_time_accel;

        	last_time_accel = cur_time;

        	console.log("Inside accelerometerChange --->   ", delta, x, y, z);
        	// console.log(delta, x, y, z);
        });

        sensorTag.notifyAccelerometer(function() {
          console.log('notifyAccelerometer');
        });
      });


      sensorTag.enableMagnetometer(function() {

      	var period = 300;
		sensorTag.setMagnetometerPeriod(period, function(){
				console.log("inside setMagnetometerPeriod");

		        sensorTag.on('magnetometerChange', function(x, y, z) {

		        	x = x.toFixed(2);
		        	y = y.toFixed(2);
		        	z = z.toFixed(2);

		        	var cur_time = Date.now();
		        	var delta = cur_time - last_time_mag;

		        	last_time_mag = cur_time;

		        	console.log("Inside magnetometerChange --->   ", delta, x, y, z);
		        });

		        sensorTag.notifyMagnetometer(function() {
		          console.log('notifyMagnetometer');
		        });

		});

      });





      sensorTag.enableGyroscope(function() {

				console.log("inside enableGyroscope");

		        sensorTag.on('gyroscopeChange', function(x, y, z) {

		        	x = x.toFixed(2);
		        	y = y.toFixed(2);
		        	z = z.toFixed(2);

		        	var cur_time = Date.now();
		        	var delta = cur_time - last_time_gyro;

		        	last_time_gyro = cur_time;

		        	console.log("Inside gyroscopeChange --->   ", delta, x, y, z);
		        });

		        sensorTag.notifyGyroscope(function() {
		          console.log('notifyGyroscope');
		        });





      });











  
    });
  
  });

});