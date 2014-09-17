var SensorTag = require('sensortag');
 
SensorTag.discover(function(sensorTag) {
  console.log('discover');
  console.log(sensorTag);

  sensorTag.connect(function() {
    console.log('connect');



    sensorTag.discoverServicesAndCharacteristics(function() {
      console.log('discoverServicesAndCharacteristics');

      sensorTag.enableHumidity(function() {

        sensorTag.on('humidityChange', function(temperature, humidity) {
          console.log('\ttemperature = %d °C', temperature.toFixed(1));
          console.log('\thumidity = %d %', humidity.toFixed(1));
        });

        sensorTag.notifyHumidity(function() {
          console.log('notifyHumidity');
        });

      });



  
    });
  
  });

});