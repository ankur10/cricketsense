// Global Error Handler
process.on('uncaughtException', function (err) {
  console.log(err.stack);
});


var express = require('express');
var express_app = express();
var request = require("request");
var fs = require('fs');
var arguments = require('optimist');
var _under = require('underscore');
var director = require('director');

var CONFIG = require('config');
var DEFAULT_CONFIG_MODE = "localhost";

//-------------------------------------------------------
// check arguments
arguments = arguments.argv;
if (arguments.mode === undefined)  {
  CONFIG = CONFIG[DEFAULT_CONFIG_MODE];
}else{
  CONFIG = CONFIG[arguments.mode];
}

//-------------------------------------------------------
//settings

if( CONFIG === undefined) {
  console.log("Node JS Server Config file missing. Check config directory.");
  console.log("***************************************");
  console.log("\n\nExiting ...\n\n");
  console.log("***************************************");
  process.exit(1);
}

var NODEJS_SERVER_PORT = CONFIG.this_server_port;
var API_SERVER = "http://" + CONFIG.api_server;
var REDIS_SERVER_HOST = CONFIG.redis_server;
var REDIS_SERVER_PORT = CONFIG.redis_port;

// configure redis settings
var redis = require("redis");
var redis_client = redis.createClient(REDIS_SERVER_PORT, REDIS_SERVER_HOST);



//-------------------------------------------------------
// start the server
var io = require('socket.io').listen(express_app.listen(NODEJS_SERVER_PORT));

// socket.io settings recommended
// source: https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
// io.enable('browser client minification');  // send minified client
// io.enable('browser client etag');          // apply etag caching logic based on version number
// io.enable('browser client gzip');          // gzip the file
// io.set('log level', 1);                    // reduce logging

// enable all transports (optional if you want flashsocket support, please note that some hosting
// providers do not allow you to create servers that listen on a port different than 80 or their
// default port)
io.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
]);


console.log("NODE JS Server started listening at " + NODEJS_SERVER_PORT);
console.log("API server at " + API_SERVER);


//-------------------------------------------------------
function displayLogMessage(mystr){
  console.log("***********************");
  console.log(mystr);
  console.log("***********************");
}


//-------------------------------------------------------
// Routers

express_app.get('/', function(req, res){
  res.send('hello world from Nodejs Server');
});


express_app.get('/tv_node_server/', function(req, res){
  console.log(req);
  console.log(res);

  console.log("reached.....1");
  res.send('tv_node_server ---> hello world from Nodejs Server');
});


express_app.get('/api_get_hierarchy', function(req, res){
  apiGetHierarchy(req, res);
});

express_app.get('/api_get_region_to_counties_mappings', function(req, res){
  console.log("Inside express_app.get('/api_get_region_to_counties_mappings'");
  apiRegionToCountiesMappings(req, res);
});


express_app.get('/api_get_all_possible_departments_list', function(req, res){
  apiGetAllPossibleDepartmentsList(req, res);
});


express_app.get('/api_categories_affinity', function(req, res){
  apiGetCategoriesAffinityData(req, res);
});


express_app.get('/api_get_all_regions_all_categories_data', function(req, res){
  apiGetAllRegionsAllCategoriesData(req, res);
});


express_app.get('/api_get_price_point_ending_data', function(req, res){
  console.log('In Price Point Ending');
  apiGetPricePointEndingData(req, res);
});

express_app.get('/api_get_item_data', function(req, res){
    console.log('In Item Data');
    apiGetItemData(req, res);
});


express_app.get('/api_get_item_all_market_data', function(req, res){
    console.log('In Item Market Data');
    apiGetItemAllMarketData(req, res);
});


express_app.get('/api_get_item_instock_by_store', function(req, res){
    console.log('In Item Instock data');
    apiGetItemInstockByStore(req, res);
});

express_app.get('/api_get_savings_catcher_data', function(req, res){
  apiGetSavingsCatcherDataForAGivenUPC(req, res);
});

express_app.get('/cache_urls', function(req, res){
  startCaching(req, res);
});


//-------------------------------------------------------
function apiGetAllPossibleDepartmentsList(req, res){

  var url = API_SERVER + "/prism/get_list_of_all_departments";
  console.log(url);

  var options = {};
  options["url"] = url;
  options["hash_key"] = url;
  options["req"] = req;
  options["res"] = res;
  options["expire_time"] = 10*60*60*24;

  options["callback_function"] = function(opt, data_returned){
    var res = opt["res"];
    var data_to_send = JSON.parse(data_returned);
    res.jsonp(data_to_send);
  };

  getAPIDataAndExecuteCallbackFunction(options);
}


// ----------
function process_all_departments(data_to_send){
  var entries = data_to_send['department_list'];

  var arr = [];
  _under.each(entries, function(entry){
    var h = {};
    var display_name = "";
    var dept_id = entry["id"];

    var path = entry["path"];
    var path_array = path.split("/");
    var len = path_array.length;
    var last_element = path_array[len-2];



    h["dept_id"] = entry["id"];
    h["display_name"] = last_element;

    arr.push(h);
  });
}


//-------------------------------------------------------
function apiGetCategoriesAffinityData(req, res){

  var dept_id = req.query.dept_id;
  var url = API_SERVER + "/prism/api_categories_affinity?dept_id=" + dept_id;
  console.log(url);

  var options = {};
  options["url"] = url;
  options["hash_key"] = url;
  options["req"] = req;
  options["res"] = res;
  options["expire_time"] = 10*60*60*24;

  options["callback_function"] = function(opt, data_returned){
    var res = opt["res"];
    var data_to_send = JSON.parse(data_returned);
    res.jsonp(data_to_send);
  };

  getAPIDataAndExecuteCallbackFunction(options);
}


//-------------------------------------------------------
function apiGetSavingsCatcherDataForAGivenUPC(req, res){
  // var url = API_SERVER + "/prism/get_department_hierarchy";

  var upc = req.query.upc;

  var url = API_SERVER + "/item/get_savings_catcher_data?upc=" + upc;

  var options = {};
  options["url"] = url;
  options["hash_key"] = url;
  options["req"] = req;
  options["res"] = res;
  options["expire_time"] = 10*60*60*24;

  options["callback_function"] = function(opt, data_returned){
    var res = opt["res"];
    var data_to_send = JSON.parse(data_returned);
    res.jsonp(data_to_send);
  };

  getAPIDataAndExecuteCallbackFunction(options);
}


//-------------------------------------------------------
function apiGetHierarchy(req, res){
  // var url = API_SERVER + "/prism/get_department_hierarchy";

  var url = API_SERVER + "/prism/get_dept_and_market_hierarchy";

  var options = {};
  options["url"] = url;
  options["hash_key"] = url;
  options["req"] = req;
  options["res"] = res;
  options["expire_time"] = 10*60*60*24;

  options["callback_function"] = function(opt, data_returned){
    var res = opt["res"];
    var data_to_send = JSON.parse(data_returned);
    res.jsonp(data_to_send);
  };

  getAPIDataAndExecuteCallbackFunction(options);
}

//-------------------------------------------------------
function apiGetPricePointEndingData(req,res){

  var dept_id = req.query.dept_id;
  var url = API_SERVER + "/prism/api_get_price_point_ending_data?dept_id="+dept_id ;
  var options = {};
  options["url"] = url;
  options["hash_key"] = url;
  options["req"] = req;
  options["res"] = res;
  options["expire_time"] = 10*60*60*24;

  options["callback_function"] = function(opt, data_returned){
    var res = opt["res"];
    var data_to_send = JSON.parse(data_returned);
    // console.log(data_to_send);
    res.jsonp(data_to_send);
  };

  getAPIDataAndExecuteCallbackFunction(options);
}


function apiGetItemData(req,res){
    var upc = req.query.upc;
    var market_id = req.query.market_id;

    var url = API_SERVER + "/item/api_get_all_item_data?upc="+ upc + "&market_id=" + market_id;
    var options = {};
    options["url"] = url;
    options["hash_key"] = url;
    options["req"] = req;
    options["res"] = res;
    options["expire_time"] = 10*60*60*24;

    options["callback_function"] = function(opt, data_returned){
        var res = opt["res"];
        var data_to_send = JSON.parse(data_returned);
        // console.log(data_to_send);
        res.jsonp(data_to_send);
    };
    getAPIDataAndExecuteCallbackFunction(options);
}

function apiGetItemInstockByStore(req,res){
    var upc = req.query.upc;

    var url = API_SERVER + "/mapdata/get_store_instocks?upc="+ upc;
    var options = {};
    options["url"] = url;
    options["hash_key"] = url;
    options["req"] = req;
    options["res"] = res;
    options["expire_time"] = 10*60*60*24;

    options["callback_function"] = function(opt, data_returned){
        var res = opt["res"];
        var data_to_send = JSON.parse(data_returned);
        // console.log(data_to_send);
        res.jsonp(data_to_send);
    };
    getAPIDataAndExecuteCallbackFunction(options);
}

function apiGetItemAllMarketData(req,res){
    var upc = req.query.upc;

    var url = API_SERVER + "/item/api_get_all_markets_data_for_item?upc="+ upc ;
    var options = {};
    options["url"] = url;
    options["hash_key"] = url;
    options["req"] = req;
    options["res"] = res;
    options["expire_time"] = 10*60*60*24;

    options["callback_function"] = function(opt, data_returned){
        var res = opt["res"];
        var data_to_send = JSON.parse(data_returned);
        // console.log(data_to_send);
        res.jsonp(data_to_send);
    };
    getAPIDataAndExecuteCallbackFunction(options);
}

//-------------------------------------------------------
function apiGetAllRegionsAllCategoriesData(req,res){

  var dept_id = req.query.dept_id;
  var period = req.query.period;
  var url = API_SERVER + "/prism/api_get_all_regions_all_categories_data?dept_id=" + dept_id + "&period=" + period;

  var options = {};
  options["url"] = url;
  options["hash_key"] = url;
  options["req"] = req;
  options["res"] = res;
  options["expire_time"] = 10*60*60*24;
  // options["expire_time"] = 0;

  options["callback_function"] = function(opt, data_returned){
    var res = opt["res"];
    var data_to_send = JSON.parse(data_returned);
    // console.log(data_to_send);
    res.jsonp(data_to_send);
  };

  getAPIDataAndExecuteCallbackFunction(options);
}



//-------------------------------------------------------
function apiRegionToCountiesMappings(req, res){

  // console.log(req);
  console.log("Inside apiRegionToCountiesMappings");

  var url = API_SERVER + "/mapdata/get_region_to_counties_list_mappings_only";
  var options = {};
  options["url"] = url;
  options["hash_key"] = url;
  options["req"] = req;
  options["res"] = res;
  options["expire_time"] = 10*60*60*24;

  options["callback_function"] = function(opt, data_returned){
    var res = opt["res"];
    var data_to_send = JSON.parse(data_returned);
    res.jsonp(data_to_send);
  };

  getAPIDataAndExecuteCallbackFunction(options);
}


//-------------------------------------------------------
function getAPIDataAndExecuteCallbackFunction(options){

  var url = options["url"];
  var callback_function = options["callback_function"];
  var hash_key = options["hash_key"];

  var from_cache = options["from_cache"];
  if(_under.isEqual(from_cache, undefined)){
      from_cache = "yes";
  }

  if(_under.isEqual(from_cache, "no")){
      fetchDataAndExecuteCallbackFunction(options);
  }else{
    // check if Redis has data for this url
    redis_client.hgetall(hash_key, function (redis_err, redis_data) {

      if(_under.isEqual(redis_data, null)){
        displayLogMessage("Data ** NOT ** found in Redis for key=" + hash_key);
        fetchDataAndExecuteCallbackFunction(options);
      }else{
        displayLogMessage("DATA FOUND IN REDIS FOR KEY=" + hash_key);
        var api_data = redis_data.api_data;
        callback_function(options, api_data);
      }
    });
  }
}

//-------------------------------------------------------
function fetchDataAndExecuteCallbackFunction(options){
  var url = options["url"];
  var callback_function = options["callback_function"];
  var hash_key = options["hash_key"];

  // expiry time
  var expire_time = options["expire_time"];
  if(_under.isEqual(expire_time, undefined)){
      var default_expiry_time = 10*24*60*60;   // 1 day
      expire_time = default_expiry_time;
  }
  expire_time = parseInt(expire_time);

  // fetch the url
  request(url, function(error, response, body) {
    var api_data = JSON.parse(body);
    var data = JSON.stringify(api_data);
    // displayLogMessage(data);

    // save the data in Redis
    redis_client.hset(hash_key, "api_data", data);
    redis_client.expire(hash_key, expire_time, function(err){
      if (!(_under.isEqual(err, null))){
        displayLogMessage(err);
      }
    });

    displayLogMessage("Data saved in redis for key = " + hash_key);
    callback_function(options, data);
  });
}


//-------------------------------------------------------
function processAPIReturnedData(options, data_returned){
  var tmp_hash = {};
  tmp_hash["command"] = "api_data_returned";
  tmp_hash["metric_type"] = options["metric_type"];
  tmp_hash["dept_id"] = options["dept_id"];
  tmp_hash["market_id"] = options["market_id"];
  tmp_hash["data_passed"] = JSON.parse(data_returned);
  tmp_hash["mode"] = "category";

  var channels_array = options["channels_array"];

  // send data to all channel present in the array
  _under.each(channels_array, function(ch){
    io.sockets.emit(ch, tmp_hash);
  });
}


//-------------------------------------------------------
function sendDataToMaster(options, data_returned){
  var h = {};
  h["command"] = "api_data_returned";
  h["metric_type"] = options["metric_type"];
  h["department_id"] = options["dept_id"];
  h["market_id"] = options["market_id"];
  h["data_passed"] = JSON.parse(data_returned);
  var channel = options["channel_to_send"];
  if(typeof channel !== "string"){
      var num_channels = channel && channel.length;
      for(var index=0;index<num_channels;index++){
          io.sockets.emit(channel[index], h);
      }
  }else{
      io.sockets.emit(channel, h);
  }

}


//-------------------------------------------------------
function sendSignalToShowSpinners(user_id,avoid_channel){

  var tmp_hash = {};
  tmp_hash["command"] = "show_spinner";
  var channels_array = ["master_screen", "slave_screen2", "slave_screen3"];

  // send data to all channel present in the array
  _under.each(channels_array, function(ch){
    if(!(avoid_channel && avoid_channel==ch)){
        var ch_name = user_id + "_" + ch;
        io.sockets.emit(ch_name, tmp_hash);
    }
  });
}


//-------------------------------------------------------
function fetchCategoryData(data){
  console.log("Inside fetchCategoryData");
  console.log(data);

  // show spinner of all screens
  var user_id = data["user_id"];
  sendSignalToShowSpinners(user_id);

  var dept_id = data["dept_id"];
  var market_id = data["market_id"];
  var user_id = data["user_id"];

  var path_url = "/prism/api_category_pages_detail?dept_id=" + dept_id + "&market_id=" + market_id;
  var url = API_SERVER + path_url;
  var hash_key = url;

  var options = {};
  options["url"] = url;
  options["hash_key"] = hash_key;
  options["dept_id"] = dept_id;
  options["market_id"] = market_id;
  options["callback_function"] = sendDataToMaster;
  options["expire_time"] = 10*60*60*24;

  var channel_to_send = [user_id + "_" + "master_screen",user_id + "_" + "slave_screen2",user_id + "_" + "slave_screen3"];
  options["channel_to_send"] = channel_to_send;
  getAPIDataAndExecuteCallbackFunction(options);
}

function fetchItemDataAndSend(data){
    console.log("Inside fetchItemData");
    console.log(data);

    // show spinner of all screens
    var user_id = data["user_id"];
    sendSignalToShowSpinners(user_id,"master_screen");

    var upc = data["upc"]
    var market_id = data["market_id"];
    var user_id = data["user_id"];

    var path_url = "/item/api_get_upc_data?upc=" + upc + "&market_id=" + market_id;
    var url = API_SERVER + path_url;
    var hash_key = url;

    var options = {};
    options["url"] = url;
    options["hash_key"] = hash_key;
    options["upc"] = upc;
    options["market_id"] = market_id;
    options["user_id"] = data["user_id"];
    options["callback_function"] = sendItemDataToScreens;
    options["expire_time"] = 10*60*60*24;

    var channel_to_send = user_id + "_" + "master_screen";
    console.log(channel_to_send);
    options["channel_to_send"] = channel_to_send;
    getAPIDataAndExecuteCallbackFunction(options);
}

function sendItemDataToScreens(options,data_returned){
    var h = {};
    h["command"] = "fetch_item_data";
    h["mode"] = "item";
    h["data_passed"] = JSON.parse(data_returned);
    h["market_id"] = options["market_id"];
    console.log(h);
    var channels_array = ["master","slave_screen2", "slave_screen3"];

    // send data to all channel present in the array
    _under.each(channels_array, function(ch){
        var ch_name = options["user_id"] + "_" + ch;
        displayLogMessage("Sending item data to: "+ch_name);
        io.sockets.emit(ch_name, h);
    });

}



// //-------------------------------------------------------
// function fetchDepartmentHierarchy(data){

//   var channel_name = data["channel_name"];

//   var url = API_SERVER + "/prism/get_department_hierarchy";
//   var options = {};
//   options["url"] = url;
//   options["hash_key"] = url;
//   options["callback_function"] = sendDepartmentHierarchyDataToMaster;
//   options["expire_time"] = 10*60*60*24;
//   options["channel_to_send"] = channel_name;
//   getAPIDataAndExecuteCallbackFunction(options);
// }



//-------------------------------------------------------
// function sendDepartmentHierarchyDataToMaster(options, data_returned){
//   var h = {};
//   h["command"] = "department_hierarchy";
//   h["data_passed"] = JSON.parse(data_returned);
//   var channel = options["channel_to_send"];
//   io.sockets.emit(channel, h);
// }


//-------------------------------------------------------
// socket io processing
io.sockets.on('connection', function (socket) {

  // check if master has connected
  socket.on('master_screen', function (data) {
    fetchCategoryData(data);
  });

  // socket.on('get_department_hierarchy', function (data) {
  //   fetchDepartmentHierarchy(data);
  // });

  socket.on('fetch_category_data', function (data) {
    fetchCategoryData(data);
  });


  // Execute on Slave Screen 2 Connect
  socket.on('slave_screen2', function (data) {
    defaultSlaveScreenConnect(data);
  });


  // Execute on Slave Screen 3 Connect
  socket.on('slave_screen3', function (data) {
    defaultSlaveScreenConnect(data);
  });


  // process metric box clicks
  socket.on('metric_box_clicked', function (data) {
    displayLogMessage("nodejs server: metric_box_clicked: ");
    displayLogMessage(data);

    var user_id = data["user_id"];
    sendSignalToShowSpinners(user_id,"master_screen");

    var ch1 = user_id + "_" + "slave_screen2";
    var ch2 = user_id + "_" + "slave_screen3";
    data["command"] = "metric_change";

    data["channels_array"] = [ch1, ch2];
    // send data to all channel present in the array
    if(data["fetchdata"] == false){
      _under.each(data["channels_array"], function(ch){
        io.sockets.emit(ch, data);
      });
    }
    else{
      getDataForAMetricClicked(data);
    }

  });


    socket.on('period_changed', function (data) {
        displayLogMessage("nodejs server: period_changed: ");
        displayLogMessage(data);

        var user_id = data["user_id"];
        var channels_array = ["slave_screen2", "slave_screen3"];

        // send data to all channel present in the array
        _under.each(channels_array, function(ch){

        var ch_name = user_id + "_" + ch;
        io.sockets.emit(ch_name, {command:"period_changed",period:data["new_period"],mode:data["mode"]});

        });

    });

    socket.on('fetch_item_data',function(data){
        displayLogMessage("nodejs server: mode:change: ");
        displayLogMessage(data);

        fetchItemDataAndSend(data);
    });

  // socket.on('region_clicked', function (data) {
  //   displayLogMessage("nodejs server: region_clicked: ");
  //   displayLogMessage(data);

  //   data["channels_array"] = ["master_screen", "slave_screen2", "slave_screen3"];
  //   fetchCategoryData(data);
  // });


});


//-------------------------------------------------------
function defaultSlaveScreenConnect(data_obj) {
  getDataForAMetricClicked(data_obj);
}


//-------------------------------------------------------
function getDataForAMetricClicked(data_obj) {
  var metric_type = data_obj["metric_type"];
  var market_id = data_obj["market_id"];
  var dept_id = data_obj["dept_id"];
  var url = API_SERVER + "/prism/api_category_pages_detail?dept_id=" + dept_id + "&market_id=" + market_id;

  var options = {};
  options["url"] = url;
  options["hash_key"] = url;
  options["metric_type"] = metric_type;
  options["dept_id"] = dept_id;
  options["market_id"] = market_id;

  options["callback_function"] = processAPIReturnedData;
  options["expire_time"] = 10*60*60*24;
  // options["channel_to_send"] = "slave_screen2";

  var channels_array = [];   // default channels
  if ("channels_array" in data_obj){
    channels_array = data_obj["channels_array"];
  }

  options["channels_array"] = channels_array;

  // options["from_cache"] = "no";
  getAPIDataAndExecuteCallbackFunction(options);
}


//-------------------------------------------------------
var DEPT_IDS_ARRAY = [];
function fillDeptIdsArray(){

  var min_dept_id = 1;
  var max_dept_id = 5;

  for(var i=min_dept_id;i<=max_dept_id;i++){
    DEPT_IDS_ARRAY.push(i);
  }
}

//-------------------------------------------------------
function startCaching(req, res){

  fillDeptIdsArray();

  var num_parallel_loop = 5;
  for(var i=0;i<num_parallel_loop;i++){
    cacheCategoryPageUrls(req, res);
  }
}


//-------------------------------------------------------
function cacheCategoryPageUrls(req, res){

    if(DEPT_IDS_ARRAY.length === 0){
      console.log("DEPT_IDS_ARRAY length is zero....");
      // res.send("Caching Over");
      return ;
    }else{
      var dept_id = DEPT_IDS_ARRAY.shift();
      var market_id = 1;
      cacheUrl(req, res, dept_id, market_id);
    }
}

//-------------------------------------------------------
function cacheUrl(req, res, dept_id, market_id){
    var url = API_SERVER + "/prism/api_category_pages_detail?dept_id=" + dept_id + "&market_id=" + market_id;

    // var url = "http://www.yahoo.com/?dept_id=" + dept_id;

    var hash_key = url;
    var default_expiry_time = 10*24*60*60;   // 1 day
    expire_time = default_expiry_time;

    console.log("Fetching url=" + url);

    // fetch the url
    request(url, function(error, response, body) {

      var api_data = JSON.parse(body);
      var data = JSON.stringify(api_data);

      // var data = {};
      // data["aas"] = dept_id;

      // save the data in Redis
      redis_client.hset(hash_key, "api_data", data);
      redis_client.expire(hash_key, expire_time, function(err){
        if (!(_under.isEqual(err, null))){
          displayLogMessage(err);
        }
      });

      displayLogMessage("Data saved in redis for key = " + hash_key);

      cacheCategoryPageUrls(req, res);
    });
}

