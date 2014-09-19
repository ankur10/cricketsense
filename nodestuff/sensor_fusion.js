var fs = require('fs');


var filename = "shot2.csv"
var processed_file_name = "processed_" + filename;


startProcessing();


// -------------------------------------------------
function startProcessing() {
    fs.readFile(filename, 'utf8', function(err, data) {

        var relevant_data = processFileAndReturnData(data);
        detectMotionAndProcessData(relevant_data);
    });
}




// -------------------------------------------------
function detectMotionAndProcessData(data) {

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
    var COL_NUM = 2; // check second column of the array
    var front_values = data.slice(0, FRONT_THRESHOLD);
    var front_avg_value = getAverageValueForGivenRows(front_values, COL_NUM);


    // get the average of last N values
    var BACK_THRESHOLD = 5;
    var COL_NUM = 2; // check second column of the array
    var back_values = data.slice(-1 * BACK_THRESHOLD);
    var back_avg_value = getAverageValueForGivenRows(back_values, COL_NUM);


    // remove constant values from the front
    var motion_detected = false;
    data.forEach(function(row) {
        var val = row[COL_NUM - 1];
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
        var val = row[COL_NUM - 1];
        if (val === back_avg_value) {
            last_line_pointer--;
        } else {
            flag = false;
        }
    }

    var some_end_buffer_lines = 3;

    var new_array = processed_motion_array.slice(0, last_line_pointer + some_end_buffer_lines);
    new_array.forEach(function(arr) {

        var txt = arr.join(",");
        // console.log(txt);
    });

    var wstream = fs.createWriteStream(processed_file_name);
    new_array.forEach(function(arr) {
        var txt = arr.join(",");
        txt = txt + "\n";
        wstream.write(txt);
    });

    wstream.end();


    // Calculate Velocity Vectors
    processDataForVelocityVectors();
}


// -------------------------------------------------
function processDataForVelocityVectors() {

    // -------------------------------------------------
    fs.readFile(processed_file_name, 'utf8', function(err, data) {

        var relevant_data = processFileAndReturnData(data);

        var time_column = 0;
        var accel_column_x = 1;
        var accel_column_y = 2;
        var accel_column_z = 3;

        var initial_velocity_x = 0;
        var initial_time = 0;

        var time_diff = 0;

        var final_velocity_vector_array = [];


        // first observation
        var first = relevant_data.shift();

        var start_time = first[time_column];
        var initial_velocity = {
            x: 0,
            y: 0,
            z: 0,
        };


        // initial values
        // start with zero values
        var vector_values = {
            t: start_time,
            vx: initial_velocity.x,
            vy: initial_velocity.y,
            vz: initial_velocity.z,
            vf: 0,
            ax: 0,
            ay: 0,
            az: 0            
        }
        final_velocity_vector_array.push(vector_values);

        // run through the loop
        relevant_data.forEach(function(row) {

            var accel = {};
            accel.x = row[accel_column_x];
            accel.y = row[accel_column_y];
            accel.z = row[accel_column_z];

            var time_diff = row[time_column] - start_time; // this is ms
            time_diff = time_diff / 1000; // convert this into seconds

            var new_velocity = {};
            new_velocity.x = initial_velocity.x + time_diff * accel.x;
            new_velocity.y = initial_velocity.y + time_diff * accel.y;
            new_velocity.z = initial_velocity.z + time_diff * accel.z;

            new_velocity.x = +(new_velocity.x).toFixed(3);
            new_velocity.y = +(new_velocity.y).toFixed(3);
            new_velocity.z = +(new_velocity.z).toFixed(3);

            var total_velocity = Math.sqrt((new_velocity.x * new_velocity.x) + (new_velocity.y * new_velocity.y) + (new_velocity.z * new_velocity.z));
            total_velocity = +total_velocity.toFixed(3);

            var vector_values = {
                t: row[time_column],
                vx: new_velocity.x,
                vy: new_velocity.y,
                vz: new_velocity.z,
                vf: total_velocity,
                ax: accel.x,
                ay: accel.y,
                az: accel.z
            }

            final_velocity_vector_array.push(vector_values);

            console.log(vector_values);

            initial_velocity = new_velocity;
            start_time = row[time_column];
        });



        var filename_tmp = "velocity_" + processed_file_name;
        var wstream = fs.createWriteStream(filename_tmp);
        var txt = "t,vx,vy,vz,vf,ax,ay,az\n";
        wstream.write(txt);

        final_velocity_vector_array.forEach(function(h) {

            var txt = "";
            txt += h.t + ",";
            txt += h.vx + ",";
            txt += h.vy + ",";
            txt += h.vz + ",";
            txt += h.vf + ",";
            txt += h.ax + ",";
            txt += h.ay + ",";
            txt += h.az;
            txt = txt + "\n";
            wstream.write(txt);
        });

        wstream.end();

    });

}




// -------------------------------------------------
function getAverageValueForGivenRows(rows, col_num) {

    var avg_value_arr = [];

    rows.forEach(function(arr) {
        var val = arr[col_num - 1];
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
function processFileAndReturnData(data) {
    var relevant_data = [];
    var lines = data.split("\n");
    lines.forEach(function(d) {
        d = d.trim();
        var tmp = d.split(",");
        if (tmp && tmp.length > 1) {
            // convert all values into integer values
            var h = [];
            tmp.forEach(function(x) {
                x = +x;
                h.push(x);
            })
            relevant_data.push(h);
        }
    });

    return relevant_data;
}
