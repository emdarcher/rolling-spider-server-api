//server

var restify = require('restify');

var server = restify.createServer({
    name: 'drone-api',
    version: '0.1.0'
});

//parsers
server.use(restify.bodyParser());
server.use(restify.acceptParser(server.acceptable));

//special handling for curl clients
server.pre(restify.pre.userAgentConnection());

//use PORT varaiable from shell or 77777
var port = process.env.PORT || 7777;


// get drone UUID from shell variable
var drone_bt_uuid = process.env.DRONE_BT_UUID;
// get api url prefix, else default /drone-api
var prefix_path = process.env.DRONE_API_PREFIX || '/drone-api';
// get value which tells if it is using wheels
var wheels_on = process.env.DRONE_WHEELS || true;

var drone_init_data = {
    uuid: drone_bt_uuid,
    wheels: wheels_on
};

//var debug_val = process.env.DRONE_DEBUG;

//drone api module
var drone = require('./routes/drone');

//base middleware
server.use( function(req,res,next){
    //show something happening
    console.log('Something is happening');
    next(); //go to next route
});

//test route
server.get(prefix_path + '/', function(req,res,next){
    res.json({ message: "welcome to the drone control server! "
                        + "The api can be accesed at /drone"});
    return next();
});

// routes directed to functions in /routes/drone.js
server.get( prefix_path + '/drone/',            drone.getDroneData ); 
server.post(prefix_path + '/drone/calibrate/',  drone.droneCalibrate ); 
server.post(prefix_path + '/drone/takeOff/',    drone.droneTakeOff ); 
server.post(prefix_path + '/drone/land/',       drone.droneLand ); 
server.post(prefix_path + '/drone/emergency/',  drone.droneEmergency ); 
server.post(prefix_path + '/drone/forward/',    drone.droneForward ); 
server.post(prefix_path + '/drone/backward/',   drone.droneBackward ); 
server.post(prefix_path + '/drone/up/',         drone.droneUp ); 
server.post(prefix_path + '/drone/down/',       drone.droneDown ); 
server.post(prefix_path + '/drone/right/',      drone.droneRight ); 
server.post(prefix_path + '/drone/left/',       drone.droneLeft ); 
server.post(prefix_path + '/drone/tiltRight/',  drone.droneTiltRight ); 
server.post(prefix_path + '/drone/tiltLeft/',   drone.droneTiltLeft ); 
server.post(prefix_path + '/drone/turnRight/',  drone.droneTurnRight ); 
server.post(prefix_path + '/drone/turnLeft/',   drone.droneTurnLeft ); 
server.post(prefix_path + '/drone/frontFlip/',  drone.droneFrontFlip ); 
server.post(prefix_path + '/drone/backFlip/',   drone.droneBackFlip ); 
server.post(prefix_path + '/drone/rightFlip/',  drone.droneRightFlip ); 
server.post(prefix_path + '/drone/leftFlip/',   drone.droneLeftFlip ); 

// start the server
server.listen(port, function() {
    console.log("Listening on port: " + port);
});
//init the drone 
drone.init_drone(drone_init_data,function(err){
    if(err){ throw err;} else {
        console.log('done initializing drone');
    }
});


