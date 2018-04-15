# mpl3115a2
Node js library for the MPL3115A2.

This is very much WIP and will be extended along the way.
The code however reflects what is needed to get the MPL3115A2 and that in itself may prove usefull.

# usage

## TypeScript
Getting temperature and pressure (altitude is not supported yet) is as esay as:

```
import { MPL3115A2 } from 'mpl3115a2';

let reader = new MPL3115A2();
reader.init();
let results = reader.getReadings();

console.log('pressure:', results.pressure.toFixed(4), 'hPa');
console.log('temperature:', results.temperature.toFixed(1), '\u00B0' + 'C');
```

# todo
Of course the mpl3115a2 is capable of much more. This will follow.
Plans are:
- include altimeter
- reading the mpl3115a2 buffers
- asynchronous operation (rxjs)
