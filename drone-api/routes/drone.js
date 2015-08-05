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
    if(uuid) drone_data.Bluetooth_uuid = uuid;
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
                    rollingSpider.on('battery', function(){
                        drone_data.battery = rollingSpider.status.battery;
                    });
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
    rollingSpider.calibrate(function(err){
        if(err) throw err;
        var cmdTimeout = setTimeout(function(){
            res.send(500, {"error":"takeoff command taking too long"});
            return next();
        }, 8000);
        rollingSpider.takeOff(function(){
            console.log('drone took off, now hovering');
            clearTimeout(cmdTimeout);
            //get_data_from_drone(function(e){if(e)throw e;});
            //return res.send({"message":"drone took off, now hovering"});
            res.send({"message":"drone took off, now hovering"});
            //rollingSpider.calibrate();   
            return next();
        });
        
    });
    //next();
    return next();
};

exports.droneLand = function(req, res, next) {
    console.log('making drone land');
    rollingSpider.calibrate(function(err){
        if(err)throw err;
        var cmdTimeout = setTimeout(function(){
            res.send(500, {"error":"land command taking too long"});
            return next();
        }, 8000);
        rollingSpider.land(function(){
            console.log('drone has landed');
            clearTimeout(cmdTimeout);
            //get_data_from_drone(function(e){if(e)throw e;});
            //return res.send({"message":"drone has landed"});
            res.send({"message":"drone has landed"});
            //return next();
        });
        
    });
//    next();
    return next();
};

exports.droneEmergency = function(req, res, next) {
    console.log('sending emergency command');
    rollingSpider.emergency(function(){
        console.log('drone executed emergency command');
        res.send({"message":"drone executed emergency command"});
    });
    return next(); 
};

/*
 * cmdDetails = {
 *  cmd_func: <rs_func>,
 *  cmd_name: <funcname>,
 *  options: {
 *      speed: <speed>,
 *      steps: <steps>
 *  }
 * };
 * */
function driveCmd(req, res, next, cmdDetails) {
    //executes a drive type command
    var error = false;
    console.log('calling driveCmd with ' + cmdDetails.cmd_name);
    Object.keys(cmdDetails.options).forEach(function(key){
        var item = cmdDetails.options[key];
        if( typeof item !== "number" ){
            console.log(item + ' is not a number!');
            return res.json(400, {"error": item + " is not a number!"});
        } else if (!((item >= 0) && (item <= 100))){
            console.log(item + " is not in range 0-100!");
            return res.json(400, {"error": item + " is not in range 0-100!"});  
        }
    });
    console.log('sending ' + cmdDetails.cmd_name + ' command');
    
    cmdDetails.cmd_func(cmdDetails.options, function (){
        console.log('drone executed ' + cmdDetails.cmd_name + ' command');
        return res.json({"message":"drone executed " 
                            + cmdDetails.cmd_name
                            + " command"});
    });
    next();

}

exports.droneForward = function(req, res, next) {
    //var json_options = req.params;
    console.log('called path to forward function');
    var details = {
        //cmd_func: rollingSpider.forward,
        cmd_func: function(opt, cb){ rollingSpider.forward(opt,cb); },
        cmd_name: "forward",
        options: {
            speed: req.params.speed,
            steps: req.params.steps 
        }
    }; 
    driveCmd(req, res, next, details);
    return next();
};
