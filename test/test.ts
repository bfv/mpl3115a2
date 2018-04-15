
import { MPL3115A2 } from './index';
import { Readings } from './readings';

let debug = false;

let device = new MPL3115A2();

if (debug) console.log('initializing...');
device.init();

if (debug) console.log('start get readings...');
let reading = device.getReadings();
if (debug) console.log('readings received');

console.log('pressure:', reading.pressure.toFixed(4), 'hPa');
console.log('temperature:', reading.temperature.toFixed(1) + '\u00B0' + 'C');
