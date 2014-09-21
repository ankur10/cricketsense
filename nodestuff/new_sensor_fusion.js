var fs = require('fs');
var filters = require('filters');

var REDIS_SERVER_HOST = "localhost";
var REDIS_SERVER_PORT = 6379;

// configure redis settings
var redis = require("redis");
var redis_client = redis.createClient(REDIS_SERVER_PORT, REDIS_SERVER_HOST);


// TO DO: 
// 1. detect motion - better algo
// 2. complimentary filter for gyroscope data
// 3. process magnetometer
// 4. try different window size to smooth accel data
// 5. 

var KEY_NEW_SENSOR_DATA = "new_sensor_data_available";

// var filename = "shot6.csv";
// startProcessing(filename);


checkPresenceOfNewData();
setInterval(checkPresenceOfNewData, 1000);



// -------------------------------------------------
function checkPresenceOfNewData() {
    redis_client.get(KEY_NEW_SENSOR_DATA, function(err, val) {
        console.log(err, val);
        if (val === "1") {
            // reset new_sensor_data_available
            redis_client.set(KEY_NEW_SENSOR_DATA, 0);

            console.log("New data detected");
            var filename = "sensor_data.txt";
            startProcessing(filename);
        } else {
            console.log("new data not found");
        }
    });
}


// -------------------------------------------------
function startProcessing(filename) {

    // var filename = "shot6.csv";

    fs.readFile(filename, 'utf8', function(err, data) {

        if (!err) {

            // check if data length is ok. 
            // min threshold lines
            var min_threshold_for_valid_file = 4;

            if (data && data.length > min_threshold_for_valid_file) {

                var raw_signal_data = readRawSignalData(data);
                var processed_signal_data = processRawSignalData(raw_signal_data);

                // put this in Redis
                var cur_time = Date.now();
                var key_name = "shot_" + cur_time;
                storeDataInRedis(key_name, processed_signal_data);
            }
        } else {
            console.log("Registered an error while reading from sensor file -> ", err);
        }

    });
}


// -------------------------------------------------
function storeDataInRedis(key_name, data) {

    // put this in Redis
    var h = {};
    h.json_data = JSON.stringify(data);
    redis_client.hmset(key_name, h, function(err) {
        // console.log(err);
    });

    redis_client.hgetall(key_name, function(err, d) {
        var x = JSON.parse(d.json_data);
        // console.log(x);
        console.log("Length --->", x.length);
        console.log(x[5]);
    });


    // // update keys
    // redis_client.sadd("all_shots", key_name, function(err, d) {
    //     console.log(err, d);
    // });

    // update keys
    redis_client.rpush("all_shots_list", key_name, function(err, d) {

        console.log("----------------------");
        console.log("all_shots_list liste,,,,,,")
        console.log(err, d);
        console.log("----------------------");
    });
}


// -------------------------------------------------
function readRawSignalData(data) {
    var data_array = [];
    var lines = data.split("\n");

    lines.forEach(function(d) {
        d = d.trim();
        var tmp = d.split(",");

        if (tmp && tmp.length > 1) {

            var myhash = {};

            var col_num = 0; // starting_column number

            // time
            myhash.time_stamp = +tmp[col_num];
            col_num = col_num + 1;

            // accelerometer data
            myhash.accelerometer = {
                x: +tmp[col_num],
                y: +tmp[col_num + 1],
                z: +tmp[col_num + 2]
            }
            col_num = col_num + 3;

            // gyroscope data
            myhash.gyroscope = {
                x: +tmp[col_num],
                y: +tmp[col_num + 1],
                z: +tmp[col_num + 2]
            }
            col_num = col_num + 3;

            // magnetometer data
            myhash.magnetometer = {
                x: +tmp[col_num],
                y: +tmp[col_num + 1],
                z: +tmp[col_num + 2]
            }

            data_array.push(myhash);
        }
    });

    return data_array;
}




// -------------------------------------------------
function getAverageValueForGivenRows_New(rows) {

    var avg_value_arr = [];

    rows.forEach(function(d) {

        var h = d.accelerometer;
        var val = h.x; // compare x accel value

        avg_value_arr.push(val);
    });

    var tmp_total = 0;
    avg_value_arr.forEach(function(a) {
        tmp_total += a;
    });

    var avg_value = 0;
    if (avg_value_arr.length > 0) {
        avg_value = tmp_total / avg_value_arr.length;
    }

    avg_value = avg_value.toFixed(3);
    avg_value = +avg_value;
    return avg_value;
}




// -------------------------------------------------
function detectMotionAndProcessRawSignal(data) {

    var processed_motion_array = [];

    var data_len = data.length;

    var MIN_THRESHOLD = 5;

    // if there is not enough data, just copy it
    if (data_len < MIN_THRESHOLD) {
        processed_motion_array = data;
        return processed_motion_array;
    }

    // get the average of first N values
    var FRONT_THRESHOLD = 5;
    var front_values = data.slice(0, FRONT_THRESHOLD);
    var front_avg_value = getAverageValueForGivenRows_New(front_values);


    // get the average of last N values
    var BACK_THRESHOLD = 5;
    var back_values = data.slice(-1 * BACK_THRESHOLD);
    var back_avg_value = getAverageValueForGivenRows_New(back_values);

    // remove constant values from the front
    var motion_detected = false;
    data.forEach(function(row) {

        var h = row.accelerometer;
        var val = h.x; // compare x accel value

        if (motion_detected) {
            processed_motion_array.push(row);
        } else if (val != front_avg_value) {
            processed_motion_array.push(row);
            motion_detected = true;
        }
    });

    // remove constant lines from the back
    var last_line_pointer = processed_motion_array.length - 1;
    var flag = true;
    while (flag) {

        var row = processed_motion_array[last_line_pointer];

        var h = row.accelerometer;
        var val = h.x; // compare x accel value

        if (val === back_avg_value) {
            last_line_pointer--;
        } else {
            flag = false;
        }
    }

    var some_end_buffer_lines = 3;

    var truncated_array = processed_motion_array.slice(0, last_line_pointer + some_end_buffer_lines);

    return truncated_array;
}



// -------------------------------------------------
function processRawSignalData(raw_data) {

    // detect motion
    // var processed_array = detectMotionAndProcessRawSignal(raw_data);

    var processed_array = raw_data;

    // smooth accelerometer data
    var data_with_smooth_accelerometer_data = smoothAccelerometerData(processed_array);

    // update gyroscope data
    var data_with_updated_gyroscope_data = smoothGyroscopeData(processed_array, data_with_smooth_accelerometer_data);

    // calculate velocity, position, displacement vectors
    var vectors_array = calculateVelocityAndAngularAndDisplacementAndPositionVectors(processed_array, data_with_smooth_accelerometer_data, data_with_updated_gyroscope_data);

    // combine all data 
    var data_hash = {}
    data_hash.raw_data = processed_array;
    data_hash.smooth_accelerometer_data = data_with_smooth_accelerometer_data;
    data_hash.smooth_gyroscope_data = data_with_updated_gyroscope_data;
    data_hash.vectors_array = vectors_array;

    var combined_data_array = combineAllDataPoints(data_hash);
    return combined_data_array;
}


// -------------------------------------------------
// Smooth Accelerometer data
function smoothAccelerometerData(data_array) {

    var processed_array = [];

    var x_values = [];
    var y_values = [];
    var z_values = [];

    data_array.forEach(function(d) {
        var vals = d.accelerometer;
        x_values.push(vals.x);
        y_values.push(vals.y);
        z_values.push(vals.z);
    });


    // TO DO:
    // TRY DIFFERENT MEDIAN WINDOW SIZE

    var median_window = 5;

    var processed_x_values = filters.median(x_values, median_window);
    var processed_y_values = filters.median(y_values, median_window);
    var processed_z_values = filters.median(z_values, median_window);

    processed_x_values = x_values;
    processed_y_values = y_values;
    processed_z_values = z_values;

    var len = data_array.length;

    for (var index = 0; index < len; index++) {
        var h = {};
        h.x = processed_x_values[index];
        h.y = processed_y_values[index];
        h.z = processed_z_values[index];

        processed_array.push(h);
    }

    return processed_array;
}



// -------------------------------------------------
// Smooth Gyroscope data
function smoothGyroscopeData(data_array, smooth_accelerometer_data_array) {

    var processed_array = [];

    var x_values = [];
    var y_values = [];
    var z_values = [];

    data_array.forEach(function(d) {
        var vals = d.gyroscope;
        x_values.push(vals.x);
        y_values.push(vals.y);
        z_values.push(vals.z);
    });

    var median_window = 5;

    var processed_x_values = filters.median(x_values, median_window);
    var processed_y_values = filters.median(y_values, median_window);
    var processed_z_values = filters.median(z_values, median_window);


    processed_x_values = x_values;
    processed_y_values = y_values;
    processed_z_values = z_values;


    // TO DO:
    // IMPLEMENT COMPLIMENTARY FILTER HERE


    var len = data_array.length;

    for (var index = 0; index < len; index++) {
        var h = {};
        h.x = processed_x_values[index];
        h.y = processed_y_values[index];
        h.z = processed_z_values[index];

        processed_array.push(h);
    }

    return processed_array;
}




// -------------------------------------------------
function calculateVelocityAndAngularAndDisplacementAndPositionVectors(data_array, smooth_accelerometer_data_array, smooth_gyroscope_data) {

    var processed_array = [];

    var initial_velocity = {
        x: 0,
        y: 0,
        z: 0
    };

    var initial_position = {
        x: 0,
        y: 0,
        z: 0
    };

    var initial_angular_position = {
        x: 0,
        y: 0,
        z: 0
    };


    var first_item = data_array.shift();
    smooth_accelerometer_data_array.shift();

    var starting_time_stamp = first_item.time_stamp;

    data_array.forEach(function(d, index) {

        var time_stamp = d.time_stamp;
        var time_delta = time_stamp - starting_time_stamp; // in ms
        time_delta = time_delta / 1000; // in seconds

        // v = u + at
        var velocity_vector = {};
        velocity_vector.x = initial_velocity.x + smooth_accelerometer_data_array[index].x * time_delta;
        velocity_vector.y = initial_velocity.y + smooth_accelerometer_data_array[index].y * time_delta;
        velocity_vector.z = initial_velocity.z + smooth_accelerometer_data_array[index].z * time_delta;
        velocity_vector = fixDecimalPlacesForAGivenVector(velocity_vector);

        // s = ut + at^2/2
        var displacement_vector = {};
        displacement_vector.x = (initial_velocity.x * time_delta) + (0.5 * smooth_accelerometer_data_array[index].x + time_delta ^ 2);
        displacement_vector.y = (initial_velocity.y * time_delta) + (0.5 * smooth_accelerometer_data_array[index].y + time_delta ^ 2);
        displacement_vector.z = (initial_velocity.z * time_delta) + (0.5 * smooth_accelerometer_data_array[index].z + time_delta ^ 2);
        displacement_vector = fixDecimalPlacesForAGivenVector(displacement_vector);

        // exact coordinates
        var position_vector = {};
        position_vector.x = initial_position.x + displacement_vector.x;
        position_vector.y = initial_position.y + displacement_vector.y;
        position_vector.z = initial_position.z + displacement_vector.z;
        position_vector = fixDecimalPlacesForAGivenVector(position_vector);

        // angular position
        var angular_vector = {};
        angular_vector.x = initial_angular_position.x + smooth_gyroscope_data[index].x * time_delta;
        angular_vector.y = initial_angular_position.y + smooth_gyroscope_data[index].y * time_delta;
        angular_vector.z = initial_angular_position.z + smooth_gyroscope_data[index].z * time_delta;
        angular_vector = fixDecimalPlacesForAGivenVector(angular_vector);


        var myhash = {};
        myhash.velocity = velocity_vector;
        myhash.displacement = displacement_vector;
        myhash.position = position_vector;
        myhash.angular_vector = angular_vector;

        processed_array.push(myhash);

        // for next loop
        starting_time_stamp = time_stamp;
        initial_velocity = velocity_vector;
        initial_position = position_vector;
        initial_angular_position = angular_vector;
    })

    return processed_array;
}


// -------------------------------------------------
function fixDecimalPlacesForAGivenVector(vector) {

    var num_dec = 3;

    var new_vector = {};
    new_vector.x = +(vector.x).toFixed(num_dec);
    new_vector.y = +(vector.y).toFixed(num_dec);
    new_vector.z = +(vector.z).toFixed(num_dec);

    return new_vector;
}


// -------------------------------------------------
function combineAllDataPoints(data_points_hash) {

    var points_array = [];

    var len = data_points_hash.raw_data.length;

    for (var index = 0; index < len; index++) {

        var time_stamp = data_points_hash.raw_data[index].time_stamp;
        var raw_data = data_points_hash.raw_data[index];

        var processed_data = {};
        processed_data.accelerometer = data_points_hash.smooth_accelerometer_data[index];
        processed_data.gyroscope = data_points_hash.smooth_gyroscope_data[index];


        var various_vectors = data_points_hash.vectors_array[index];
        processed_data.velocity = various_vectors.velocity;
        processed_data.displacement = various_vectors.displacement;
        processed_data.position = various_vectors.position;
        processed_data.angular_vector = various_vectors.angular_vector;

        var myhash = {};
        myhash.time_stamp = time_stamp;
        myhash.raw_data = raw_data;
        myhash.processed_data = processed_data;

        points_array.push(myhash);
    }

    return points_array;
}
