var fs = require('fs');


var REDIS_SERVER_HOST = "localhost";
var REDIS_SERVER_PORT = 6379;

// configure redis settings
var redis = require("redis");
var client1 = redis.createClient(REDIS_SERVER_PORT, REDIS_SERVER_HOST);
var client2 = redis.createClient(REDIS_SERVER_PORT, REDIS_SERVER_HOST);



// var channel_name_sensor = "sensor_value_updated";

// var ctr = 0;
// function writeToRedis() {

//     var r = Math.random();

//     client1.set("accel_values", ctr);
//     client1.publish(channel_name_sensor, ctr);
//     ctr++;
// }

// setInterval(writeToRedis, 100);




// client2.subscribe(channel_name_sensor);

// client2.on("message", function(channel, msg) {
// 	console.log(channel, msg);
// });


var keys = ["k1", "k2", "k3"];

// var kk = "k1 k2 jain";

client1.mget(keys, function(d, v){
	if(!d){
		console.log(d, v);
	}else{
		console.log("nullllll ...");
	}

	v.forEach(function(n){
		if(n){
			console.log(n);
		}
		// console.log(n);
	})
})


var wstream = fs.createWriteStream('myOutput.txt');
wstream.write('1Hello world!\n');
wstream.write('11Another line\n');
wstream.end();


var filename = "shot1.txt"

fs.readFile(filename, function(err, data){
	console.log(data);
});
