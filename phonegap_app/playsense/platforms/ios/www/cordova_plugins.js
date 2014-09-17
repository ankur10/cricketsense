cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.randdusing.bluetoothle/www/bluetoothle.js",
        "id": "com.randdusing.bluetoothle.BluetoothLe",
        "clobbers": [
            "window.bluetoothle"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.console/www/console-via-logger.js",
        "id": "org.apache.cordova.console.console",
        "clobbers": [
            "console"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.console/www/logger.js",
        "id": "org.apache.cordova.console.logger",
        "clobbers": [
            "cordova.logger"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.randdusing.bluetoothle": "1.0.2",
    "org.apache.cordova.console": "0.2.10"
}
// BOTTOM OF METADATA
});