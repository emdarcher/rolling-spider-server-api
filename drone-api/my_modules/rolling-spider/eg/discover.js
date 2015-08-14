'use strict';

var Drone = require('../');
var noble = require('noble');
var knownDevices = [];

if (this.ble.state === 'poweredOn') {
  start()
} else {
  noble.on('stateChange', start);
}

function start () {
  noble.startScanning();

  noble.on('discover', function(peripheral) {
    if (!Drone.isDronePeripheral(peripheral)) {
      return; // not a rolling spider
    }

    var details = {
      name: peripheral.advertisement.localName,
      uuid: peripheral.uuid,
      rssi: peripheral.rssi
    };

    knownDevices.push(details);
    console.log(knownDevices.length + ': ' + details.name + ' (' + details.uuid + '), RSSI ' + details.rssi);
  });
}
