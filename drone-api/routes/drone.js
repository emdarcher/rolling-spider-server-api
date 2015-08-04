// routing for drone api commands


var RollingSpider = require('rolling-spider');
var rollingSpider;

var drone_data = {
  Bluetooth_uuid:"auto",
  signal_strength:"0",
  flying:false,
  battery:0,
  speed:0,
  steps:0
};

function connectDrone( cb ){
    
}

var init_running = true;
exports.init_drone = function(uuid, cb ){
    var error = false;
    //connect and setup drone
    rollingSpider = new RollingSpider(uuid);
    drone_data.Bluetooth_uuid = uuid;
    rollingSpider.connect(function(err){
        if(err){ 
            error = err;
            console.log('error connecting to drone ' + uuid);
        } else {
            console.log('connected to drone ' + uuid);
            rollingSpider.setup(function(err) {
                if(err){
                    error = err;
                    console.log('error setting up drone ' + uuid);
                } else {
                    rollingSpider.calibrate(); 
                    rollingSpider.startPing();
                    rollingSpider.signalStrength(function(err, rssi){
                        if(err) throw err;
                        drone_data.signal_strength = rssi;
                    });
                    drone_data.battery = rollingSpider.status.battery;
                    drone_data.flying = rollingSpider.status.flying;
                    console.log('setup drone ' + uuid);
                }
            });
        }
    });
    init_running = false;
    return cb(error);
};

exports.getDroneData = function(req, res, next){
    console.log('sending data for drone');
    res.json(drone_data);
    return next();
};


