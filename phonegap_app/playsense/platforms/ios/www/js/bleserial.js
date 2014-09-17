

var app = {
    macAddress: "3B204569-899A-BF4B-5C5C-3A35515211DF",  // get your mac address from bluetoothSerial.list
    chars: "",


    // ----------------------------------
    //
    initialize: function() {
        this.bindEvents();
    },


    // ----------------------------------
    //
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        connectButton.addEventListener('touchend', app.manageConnection, false);

       $(".click_button").click(function(e){
            // console.log("Clicked caught for click_button");        
            var val = $(this).attr("val");
            // console.log(val);            
            app.functionTurnOnButton();
        });
    },



    // ----------------------------------
    //
    functionTurnOnButton: function() {
        // console.log("inside functionTurnOnButton");
        // console.log("----------------");

        var num = Math.floor((Math.random() * 30) + 10);

        var num = 10;
        // console.log("Executing loops=", num);
        var delay = 0;
        for (i = 0; i < num; i++) { 
            delay = i*100;
            setTimeout(app.passValueOverBLE, delay);
        }   

        // always send the last signal as zero
        setTimeout(app.functionTurnOffButton, delay);
    },



    // ----------------------------------
    //
    passValueOverBLE: function() {

        var val = "1";
        var x = Math.random();   
        if(x < 0.2){
            val = "0";
        }else{
            val = "1";
        }

        bluetoothSerial.write(
            val, 
            function(e){
                // console.log("Data successful written -->", val);
                // console.log(e);
            }, 
            function(e){
                // console.log("Error in writing --->", val);
                // console.log(e);
            }
        );
    },


    // ----------------------------------
    //    
    functionTurnOffButton: function() {
        bluetoothSerial.write(
            "0", 
            function(e){
                // console.log("Data successful written");
                // console.log(e);
            }, 
            function(e){
                // console.log("Error in writing");
                // console.log(e);
            }
        );

    },


    // ----------------------------------
    //
    onDeviceReady: function() {
        var listPorts = function() {
            // list the available BT ports:
            bluetoothSerial.list(
                function(results) {
                    app.display(JSON.stringify(results));
                    // console.log(results);

                    var first_result = results[0];

                    var device_uuid = first_result["uuid"];
                    if(device_uuid === app.macAddress){
                        // console.log("CONNECTING AUTOMATICALLY on onDeviceReady for uuid = ", device_uuid);
                        app.manageConnection();
                    }
                },
                function(error) {
                    app.display(JSON.stringify(error));
                }
            );
        }

        // if isEnabled returns failure, this function is called:
        var notEnabled = function() {
            app.display("Bluetooth is not enabled.")
        }

         // check if Bluetooth is on:
        bluetoothSerial.isEnabled(
            listPorts,
            notEnabled
        );
    },

    // ----------------------------------
    //    
    manageConnection: function() {

        // connect() will get called only if isConnected() (below)
        // returns failure. In other words, if not connected, then connect:
        var connect = function () {
            // if not connected, do this:
            // clear the screen and display an attempt to connect
            app.clear();
            // app.display("Attempting to connect. " +
            //     "Make sure the serial port is open on the target device.");

            // attempt to connect:
            bluetoothSerial.connect(
                app.macAddress,  // device to connect to
                app.openPort,    // start listening if you succeed
                app.showError    // show the error if you fail
            );
        };

        // disconnect() will get called only if isConnected() (below)
        // returns success  In other words, if  connected, then disconnect:
        var disconnect = function () {
            app.display("attempting to disconnect");
            // if connected, do this:
            bluetoothSerial.disconnect(
                app.closePort,     // stop listening to the port
                app.showError      // show the error if you fail
            );
        };

        // here's the real action of the manageConnection function:
        bluetoothSerial.isConnected(disconnect, connect);
    },

    // ----------------------------------
    //
    openPort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Connected to: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        // set up a listener to listen for newlines
        // and display any new data that's come in since
        // the last newline:
        bluetoothSerial.subscribe('\n', function (data) {
            app.clear();
            app.display(data);
        });
    },


    // ----------------------------------
    //
    closePort: function() {
        app.display("Disconnected from: " + app.macAddress);
        connectButton.innerHTML = "Connect";
        bluetoothSerial.unsubscribe(
            function (data) {
                app.display(data);
            },
            app.showError
        );
    },

    // ----------------------------------
    //
    showError: function(error) {
        app.display(error);
    },


    // ----------------------------------
    //
    display: function(message) {
        var display = document.getElementById("message"), // the message div
            lineBreak = document.createElement("br"),     // a line break
            label = document.createTextNode(message);     // create the label

        display.appendChild(lineBreak);          // add a line break
        display.appendChild(label);              // add the message node
    },


    // ----------------------------------
    //
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    }
};      // end of app

