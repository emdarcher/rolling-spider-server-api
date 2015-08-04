//server
//

var restify = require('restify');

var server = restify.createServer({
    name: 'drone-api',
    version: '0.1.0'
});

//parsers
server.use(restify.bodyParser());
server.use(restify.queryParser());
server.use(restify.acceptParser(server.acceptable));


//special handling for curl clients
server.pre(restify.pre.userAgentConnection());

//use PORT varaiable from shell or 77777
var port = process.env.PORT || 7777;


// get drone UUID from shell variable
var drone_bt_uuid = process.env.DRONE_BT_UUID;
//

//drone api module
var drone = require('./routes/drone');

//base middleware
server.use(function(req,res,next){
    //show something happening
    console.log('Something is happening');
    next(); //go to next route
});

//test route
server.get('/', function(req,res,next){
    res.json({ message: "welcom to the drone control server! "
                        + "The api can be accesed at /drone"});
    return next();
});


// routes directed to functions in /routes/drone.js
server.get('/drone/', drone.getDroneData ); 


// start the server
server.listen(port, function() {
    console.log("Listening on port: " + port);
});
//init the drone 
drone.init_drone(function(err){
    if(err){ throw err;} else {
        console.log('done initializing drone');
    }
});

// initialize the drone


