// ----------------------------------------------------
//
var pointsArrayObject = function(timeInterval) {

    var addDataPoint;
    timeInterval = timeInterval || 1;

    var timeBase = Math.floor(new Date().getTime() / 1000);

    this.addNewDataPoint = function(data, pt_passed) {
        var index = data[0].length;
        data.forEach(function(series, i) {

            var nx = (index * timeInterval) + timeBase;

            var ny = pt_passed[i];

            var pt = {};
            pt.x = nx;
            pt.y = ny;
            series.push(pt)
        });
    };

    this.removeData = function(data) {
        data.forEach(function(series) {

            var len = series.length;
            if (len > 100) {
                series.shift();
            }
        });
        timeBase += timeInterval;
    };
};

// ----------------------------------------------------
//
var playSenseGraphObject = function() {

    var _psenseObject = this;

    var seriesData = [
        [],
        [],
        []
    ];
    var points_array_object = new pointsArrayObject(150);
    var graph = null;

    var origin_x = 0;
    var origin_y = 0;
    var origin_z = 0;

    var rot_x = 0,
        rot_y = 0,
        rot_z = 0;

    var value_type;
    var chart_div, legend_div;


    // ----------------------------------------------------
    //
    _psenseObject.init = function(options) {
        chart_div = options.chart_div;
        legend_div = options.legend_div;
        value_type = options.value_type;
    }


    // ----------------------------------------------------
    //
    _psenseObject.drawRickshawChart = function() {

        var palette = new Rickshaw.Color.Palette({
            scheme: 'spectrum2000'
        });

        // instantiate our graph!

        graph = new Rickshaw.Graph({
            element: document.getElementById(chart_div),
            width: 1400,
            height: 400,
            renderer: 'line',
            stroke: true,
            preserve: true,
            min: "auto",
            series: [{
                color: "#FF0000",
                data: seriesData[0],
                name: 'X'
            }, {
                color: "#00FF00",
                data: seriesData[1],
                name: 'Y'
            }, {
                color: "#0000FF",
                data: seriesData[2],
                name: 'Z'
            }]
        });


        graph.render();

        var ticksTreatment = 'glow';

        // var xAxis = new Rickshaw.Graph.Axis.Time( {
        //  graph: graph,
        //  ticksTreatment: ticksTreatment,
        //  timeFixture: new Rickshaw.Fixtures.Time.Local()
        // } );
        // xAxis.render();

        var yAxis = new Rickshaw.Graph.Axis.Y({
            graph: graph,
            // tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
            // ticksTreatment: ticksTreatment
        });
        yAxis.render();

        var legend = new Rickshaw.Graph.Legend({
            graph: graph,
            element: document.querySelector(legend_div)
        });

        var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
            graph: graph,
            legend: legend
        });

        var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
            graph: graph,
            legend: legend
        });

    }



    // ----------------------------------------------------
    //
    _psenseObject.plotData = function(data) {

        // update rickshaw chart
        points_array_object.removeData(seriesData);

        var pts_array = [data.x, data.y, data.z];
        points_array_object.addNewDataPoint(seriesData, pts_array);

        graph.update();

    }



}
