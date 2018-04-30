import * as i2cbus from 'i2c-bus';
import { CtrlReg1, CtrlReg2, CtrlReg3, CtrlReg4, CtrlReg5, PtDataCfg, OUT_T_LSB } from './registers';
import { CTRL_REG1, CTRL_REG2, CTRL_REG3, CTRL_REG4, CTRL_REG5,PT_DATA_CFG, WHO_AM_I } from './registers';
import { OUT_P_MSB, OUT_P_CSB, OUT_P_LSB, OUT_T_MSB } from './registers';
import { OperatingMode } from './registers';
import { PressureReading } from './reading';
import { PressureDataBuffer, TemperatureDataBuffer } from './databuffer';

export class MPL3115A2 {

    public deviceAddress = 0x60;

    /**
     * Get standby status
     * @return true if device is standy
     */
    get standy(): boolean {
        let value = this.readByte(CTRL_REG1);
        return ((value & CtrlReg1.SBYB) === 0);
    }

    /**
     * The operatingMode property (R/W) can be either OperatingMode.Barometer (0 = default) or 1 (Altimeter)
     *
     */
    private _operatingMode: OperatingMode = OperatingMode.Barometer;
    get operatingMode(): OperatingMode {
        return this._operatingMode;
    }
    set operatingMode(value: OperatingMode) {
        this._operatingMode = value;
    }

    private bus: i2cbus.I2cBus;
    private readSingleValue = false;

    constructor() {
        this.bus = i2cbus.openSync(1);
    }

    /**
     * Read the pressure and temperature out of the registers
     * @return PressureReading
     */
    getPressureReading(): PressureReading {
        return this.getReading(this.operatingMode);
    }

    /**
     * Get a single reading and leaves the device standy. Don't mix this with either active modes.
     * If no mode is specified, the current operating of the device is taken.
     *
     * @param mode specifies the mode for the reading
     * @return PressureReading
     */
    getSinglePressureReading(mode?: OperatingMode): PressureReading {

        if (mode === undefined) {
            mode = this.operatingMode;
        }

        // reset
        let value = (mode * CtrlReg1.ALT) | CtrlReg1.OSR128 | CtrlReg1.SBYB;
        this.writeByte(CTRL_REG1, value);

        value = CtrlReg1.OSR128 | CtrlReg1.OST | (mode * CtrlReg1.ALT);

        this.readSingleValue = true;
        this.writeByte(CTRL_REG1, value);

        return this.getReading(mode);
    }

    /**
     * set the time between samples. The enum denotes seconds.
    */
    setSampleTime(sampleTime: CtrlReg2) {

        if (sampleTime > 0b1111) {
            throw new Error('value is not a sample time');
        }

        let currentValue = this.readByte(CTRL_REG2) & 0b11110000;
        this.writeByte(CTRL_REG2, currentValue | sampleTime);
    }

    /**
     * Activates the device. The other CtrlReg1 settings are unaltered
     */
    toActive(): void {
        let value = this.readByte(CTRL_REG1);
        value |= CtrlReg1.SBYB;
        this.writeByte(CTRL_REG1, value);
    }

    /**
     * Brings the device in standby mode. The other CtrlReg1 settings are unaltered
     */
    toStandby(): void {
        let value = this.readByte(CTRL_REG1);
        value &= (0xff ^ CtrlReg1.SBYB);
        this.writeByte(CTRL_REG1, value);
    }

    /**
     * Returns the device identifier, 0xc4 by default
     * @return device identifier
     */
    whoAmI(): number {
        let value = this.readByte(WHO_AM_I);
        return value;
    }

    private calcPressure(buffer: PressureDataBuffer): number {

        var pressure;

        // use msb, csb and bit 7&6 of lsb for integer part  (of Q18.2 fixed point)
        pressure = (((buffer.msb << 8) + buffer.csb) << 2) + ((buffer.lsb & 0b11000000) >> 6);

        // add fractional part, 2 bit => resolution = 0.25 Pa
        pressure += ((buffer.lsb & 0b00100000) >> 5) / 2;
        pressure += ((buffer.lsb & 0b00010000) >> 4) / 4;

        return pressure / 100;  // return hPa (millibar)
    }

    private getReading(mode: OperatingMode) {

        if (this.standy && !this.readSingleValue) {
            throw new Error('Device is in standby mode; cannot get readings');
        }

        while((this.readByte(0x00) & 0x08) === 0) {}

        let pbuffer = new PressureDataBuffer();

        pbuffer.msb = this.readByte(OUT_P_MSB);
        pbuffer.csb = this.readByte(OUT_P_CSB);
        pbuffer.lsb = this.readByte(OUT_P_LSB);

        let tbuffer = new TemperatureDataBuffer();
        tbuffer.msb = this.readByte(OUT_T_MSB);
        tbuffer.lsb = this.readByte(OUT_T_LSB);

        //var tempWord = this.bus.readWordSync(this.deviceAddress, OUT_T_MSB);

        return {
            barometer: this.calcPressure(pbuffer),
            mode: mode,
            temperature: this.toCelsius(tbuffer),
        };
    }  // getReading

    private readByte(register: number): number {
        return this.bus.readByteSync(this.deviceAddress, register);
    }

    private toCelsius(buffer: TemperatureDataBuffer): number {
        let rawTemp = (buffer.msb << 8) | (buffer.lsb & 0xff);
        return this.toCelsius2(rawTemp);
    }

    private toCelsius2(rawTemp: number): number {

        var halfDegrees = ((rawTemp & 0xff) << 1) + (rawTemp >> 15);

        if ((halfDegrees & 0x100) === 0) {
            return halfDegrees / 2; // Temp +ve
        }

        return -((~halfDegrees & 0xff) / 2); // Temp -ve
    }

    private writeByte(register: number, value: number) {
        this.bus.writeByteSync(this.deviceAddress, register, value);
    }

}