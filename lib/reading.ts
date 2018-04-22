
import { OperatingMode }  from './registers';
export interface PressureReading {
    barometer: number;
    mode: OperatingMode;
    temperature: number;
}

