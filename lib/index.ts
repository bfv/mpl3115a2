
import * as i2cbus from 'i2c-bus';
import * as registers from './registers';
import * as c from './registerconstants';
import { Readings } from './readings';

export class MPL3115A2 {

    public deviceAddress = 0x60;

    private bus: i2cbus.I2cBus;

    constructor() {
        this.bus = i2cbus.openSync(1);
    }

    init() {
        this.bus.writeByteSync(this.deviceAddress, registers.CTRL_REG1, c.CtrlReg1.OSR128);
        this.bus.writeByteSync(this.deviceAddress, registers.PT_DATA_CFG, 0b00000111);
        this.bus.writeByteSync(this.deviceAddress, registers.CTRL_REG1, c.CtrlReg1.OSR128 | c.CtrlReg1.SBYB);
    }

    getReadings(): Readings {

        while((this.bus.readByteSync(this.deviceAddress, 0x00) & 0x08) === 0) {}

        var p_msb = this.bus.readByteSync(this.deviceAddress, registers.OUT_P_MSB);
        var p_csb = this.bus.readByteSync(this.deviceAddress, registers.OUT_P_CSB);
        var p_lsb = this.bus.readByteSync(this.deviceAddress, registers.OUT_P_LSB);

        var tempWord = this.bus.readWordSync(this.deviceAddress, registers.OUT_T_MSB);

        return {
            pressure: this.calcPressure(p_msb, p_csb, p_lsb),
            temperature: this.toCelsius(tempWord),
            altitude: -99999
        };
    }

    private calcPressure(msb: number, csb: number, lsb: number): number {

        var pressure;

        // use msb, csb and bit 7&6 of lsb for integer part  (of Q18.2 fixed point)
        pressure = (((msb << 8) + csb) << 2) + ((lsb & 0b11000000) >> 6);

        // add fractional part, 2 bit => resolution = 0.25 Pa
        pressure += ((lsb & 0b00100000) >> 5) / 2;
        pressure += ((lsb & 0b00010000) >> 4) / 4;

        return pressure / 100;  // return hPa (millibar)
    }

    private toCelsius(rawTemp: number): number {

        var halfDegrees = ((rawTemp & 0xff) << 1) + (rawTemp >> 15);

        if ((halfDegrees & 0x100) === 0) {
            return halfDegrees / 2; // Temp +ve
        }

        return -((~halfDegrees & 0xff) / 2); // Temp -ve
    }
}