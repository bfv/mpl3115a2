
import { MPL3115A2 } from './index';
import { CtrlReg2 } from './registers';

let device = new MPL3115A2();

device.toStandby();
device.setSampleTime(CtrlReg2.ST_2);
device.toActive();

setTimeout(() => {
    console.log('FIFO buffer size:', device.getFifoDepth());
    device.toStandby();
}, 10000);