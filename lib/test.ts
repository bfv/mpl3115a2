
import { MPL3115A2 } from './index';
import { PressureReading } from './reading';
import { OperatingMode, CtrlReg1 } from './registers';

let device = new MPL3115A2();
device.operatingMode = OperatingMode.Altimeter;


let reading = device.getSinglePressureReading(OperatingMode.Barometer);

if (reading.mode == OperatingMode.Altimeter) {
    console.log('altitude:', reading.barometer, 'm');
}
else {
    console.log('pressure:', reading.barometer.toFixed(4), 'hPa');
}

console.log('temperature:', reading.temperature.toFixed(1) + '\u00B0' + 'C');

console.log('device standby:', device.standy);

// console.log('standby:', device.standy);

// device.toStandby();

// console.log('standby:', device.standy);
// console.log('who am i:', device.whoAmI());
