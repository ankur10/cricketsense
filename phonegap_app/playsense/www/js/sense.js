
var gdevicedata_array = [];
var gdevicedata_orientation_array = [];

var app = {


    // ----------------------------------
    //
    initialize: function() {
        this.bindEvents();
    },

    // ----------------------------------
    //
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);


        window.addEventListener('devicemotion', function(eventData) {
            var h = {};
            h["acceleration"] = eventData.acceleration;
            h["rotationRate"] = eventData.rotationRate;
            app.myDeviceAcceleration(h);

        }, false);


        window.addEventListener('deviceorientation', function(eventData) {

            var alpha = app.round(eventData.alpha);
            var beta = app.round(eventData.beta);
            var gamma = app.round(eventData.gamma);

            var data = {};
            data.alpha = alpha;
            data.beta = beta;
            data.gamma = gamma;

            app.myDeviceOrientation(data);

            // console.log(data);

        }, false);

    },


    // ----------------------------------
    myDeviceAcceleration: function(data) {

      // acceeleration
      var acceleration = data.acceleration;
      var accel_x = app.round(acceleration.x);
      var accel_y = app.round(acceleration.y);
      var accel_z = app.round(acceleration.z);

      $("#accel_x").html(accel_x);
      $("#accel_y").html(accel_y);
      $("#accel_z").html(accel_z);    


      // Rotation
      var rotation = data.rotationRate;
      var rot_x = app.round(rotation.alpha);
      var rot_y = app.round(rotation.beta);
      var rot_z = app.round(rotation.gamma);

      $("#gyro_x").html(rot_x);
      $("#gyro_y").html(rot_y);
      $("#gyro_z").html(rot_z);

        var h = {};
        h["acceleration"] = data.acceleration;
        h["rotationRate"] = data.rotationRate;

        gdevicedata_array.push(h);

        // console.log("sending global_device_data to nodejs = ", h);          
        // global_socket.emit('device_motion_event', { "values": h });

    },


    // ----------------------------------
    myDeviceOrientation: function(eventData) {

          $("#mag_x").html(eventData.alpha);
          $("#mag_y").html(eventData.beta);
          $("#mag_z").html(eventData.gamma);  

            var h = {};
            h["alpha"] = eventData.alpha;
            h["beta"] = eventData.beta;
            h["gamma"] = eventData.gamma;

            gdevicedata_orientation_array.push(h);

            // console.log("sending global_device_data to nodejs = ", h);          
            // global_socket.emit('device_orientation_event', { "values": h });

    },



    // ----------------------------------
    onDeviceReady: function() {
        console.log("Inside onDeviceReady");
        global_socket.emit('myconnected', { hello: 'client says hello to node js.....' });

        setInterval(function(){
                var event_data = gdevicedata_orientation_array.pop();
                var h = {};
                h["alpha"] = event_data.alpha;
                h["beta"] = event_data.beta;
                h["gamma"] = event_data.gamma;

                // console.log("sending global_device_data to nodejs = ", h);          
                global_socket.emit('device_orientation_event', { "values": h });
            }, 
            100
        );


        setInterval(function(){
                var event_data = gdevicedata_array.pop();
                var h = {};
                h["acceleration"] = event_data.acceleration;
                h["rotationRate"] = event_data.rotationRate;

                // console.log("sending global_device_data to nodejs = ", h);          
                global_socket.emit('device_motion_event', { "values": h });
            }, 
            100
        );        




    },

    // ----------------------------------
    round: function(val) {
      var amt = 10;
      return Math.round(val * amt) /  amt;

    },

};      // end of app




