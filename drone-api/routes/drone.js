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

function get_data_from_drone( cb ){
    var error = false;
    console.log("getting data from drone");
    rollingSpider.signalStrength(function(err, rssi){
        if(err) error = err;
        drone_data.signal_strength = rssi;
    });
    drone_data.battery = rollingSpider.status.battery;
    drone_data.flying = rollingSpider.status.flying;
    if(error){
        console.log("error getting data from drone");
    }
//    if(cb){
        return cb(error); 
//    }
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
                    get_data_from_drone(function(e){if(e)throw e;});
                    //rollingSpider.signalStrength(function(err, rssi){
                    //    if(err) throw err;
                    //    drone_data.signal_strength = rssi;
                    //});
                    //drone_data.battery = rollingSpider.status.battery;
                    //drone_data.flying = rollingSpider.status.flying;
                    console.log('setup drone ' + uuid);
                }
                return cb(error);
            });
        }
    });
    init_running = false;
    //return cb(error);
};

exports.getDroneData = function(req, res, next){
    console.log('sending data for drone');
    get_data_from_drone(function(err){
       if(err){
            throw err; 
            res.json(500, { "error":"error getting data from drone" });
       } else {
            res.json(drone_data);
       }    
    });
    return next();
};

exports.droneCalibrate = function(req, res, next){
    console.log('calibrating the drone');
    rollingSpider.calibrate(function(err) {
        if(err){
            throw err;
            console.log('error calibrating drone');   
            res.json(500, { "error":"an error occured executing calibrate"});
        } else {
            res.json({"message":"calibrating drone trim for stability"});
        }
    });
    return next();
};

exports.droneTakeOff = function(req, res, next) {
    console.log('making drone take off');
    rollingSpider.calibrate();
    rollingSpider.takeOff(function(){
        console.log('drone took off, now hovering');
        get_data_from_drone(function(e){if(e)throw e;});
        res.json({"message":"drone took off, now hovering"});
        rollingSpider.calibrate();   
    });
    return next();
};

exports.droneLand = function(req, res, next) {
    console.log('making drone land');
    rollingSpider.calibrate();
    rollingSpider.land(function(){
        console.log('drone has landed');
        get_data_from_drone(function(e){if(e)throw e;});
        res.json({"message":"drone has landed"});
    });
    return next();
};

