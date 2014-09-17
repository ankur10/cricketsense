/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);

        $(".buts").click(function(e){
            // console.log(e);
            var val = $(this).attr("val");

            var txt = "Button clicked --->" + val;
            console.log("Button clicked......");
            $("#msg1").html(txt);
            executeMyFunction();
        });

    },

    executeMyFunction: function(){

            console.log("Inside executeMyFunction ......");

        function onSuccessA(acceleration) {

            console.log("Inside onSuccessA ......");

            var t = ' AX: ' + acceleration.x + '\n' +
                  ' AY: ' + acceleration.y + '\n' +
                  ' AZ: ' + acceleration.z + '\n' +
                  'AT: '      + acceleration.timestamp + '\n';

            console.log(t);
            $("#msg2").html(t);
        };

        function onErrorA() {

            console.log("Inside onErrorA ......");
            
            console.log('onErrorA!');
        };

        navigator.accelerometer.getCurrentAcceleration(onSuccessA, onErrorA);

    },

    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        console.log("Inside onDeviceReady");    
        $("#msg1").html("This is inside onDeviceReady");
        console.log(device);



        function onSuccess(acceleration) {
            var t = ' DX: ' + acceleration.x + '\n' +
                  ' DY: ' + acceleration.y + '\n' +
                  ' DZ: ' + acceleration.z + '\n' +
                  'DT: '      + acceleration.timestamp + '\n';

            console.log(t);
            $("#msg2").html(t);
        };

        function onError() {
            console.log('onError!');
        };

        navigator.accelerometer.getCurrentAcceleration(onSuccess, onError);









    },

    receivedEvent: function(id) {

        console.log("Inside receivedEvent");
        $("#msg1").html("Inside receivedEvent");


        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');

        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');

        // console.log('Received Event: ' + id);
    }      
};
