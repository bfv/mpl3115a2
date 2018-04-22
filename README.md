# mpl3115a2
Node js library for the MPL3115A2.

This is very much WIP and will be extended along the way.
The code however reflects what is needed to get the MPL3115A2 and that in itself may prove usefull.

# TypeScript usage

## example
Getting temperature and pressure (altitude is not supported yet) is as esay as:

```
import { MPL3115A2 } from 'mpl3115a2';

let reader = new MPL3115A2();
let reading = reader.getSinglePressureReadings();

console.log('pressure:', reading.pressure.toFixed(4), 'hPa');
console.log('temperature:', reading.temperature.toFixed(1), '\u00B0' + 'C');
```

## MPL3115A2 class

### `operatingMode` property
The operatingMode values comes from the OperatingMode enum.
0 (default) is Barometer, 1 is Altimeter

### `standby` property
returns true is the device is in standby mode

### `toStandby` method
Sets the device in standby. Keeps the other settings for `CtrlReg1`

### `toActive` method
Set the device to active mode. Keep the other settings for `CtrlReg1`.
Whether pressure or altitude is measured depends on the `operatingMode` property.

### `getSinglePressureReading` method
Get a single reading based on the `mode` input parameter (`OperatingMode`).
If no mode is specified, the value of operatingMode will be taken.
Return an `PressureReading` object.

### `getPressureReading` method
Waits for data to be present and returns an `PressureReading` object.
If the device is in standby, an error will be thrown.

# todo
Of course the mpl3115a2 is capable of much more.
Plans are:
- reading the mpl3115a2 buffers
- setting sample times
- FIFO
- interrupts

# mpl3115a2 documentation

https://www.nxp.com/docs/en/data-sheet/MPL3115A2.pdf
https://www.nxp.com/docs/en/application-note/AN4519.pdf
