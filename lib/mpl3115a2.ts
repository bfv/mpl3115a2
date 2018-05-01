import * as i2cbus from 'i2c-bus';
import { CtrlReg1, CtrlReg2, CtrlReg3, CtrlReg4, CtrlReg5, PtDataCfg, FStatus } from './registers';
import { CTRL_REG1, CTRL_REG2, CTRL_REG3, CTRL_REG4, CTRL_REG5, F_DATA, F_STATUS, PT_DATA_CFG, WHO_AM_I } from './registers';
import { OUT_P_MSB, OUT_P_CSB, OUT_P_LSB, OUT_T_MSB, OUT_T_LSB } from './registers';
import { OperatingMode } from './registers';
import { PressureReading } from './reading';
import { DataBuffer } from './databuffer';

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
     * return the amount of samples in the FIFO buffer
     */
    getFifoDepth(): number {
        return this.readByte(F_STATUS) & 0b00111111;
    }

    getFifoSamples(): PressureReading[] {

        let depth = this.getFifoDepth();
        if (depth == 0) {
            return [];
        }

        let readings: PressureReading[] = [];
        for (let i = 0; i < depth; i++) {
            let buffer = this.readFirstBuffer();
            readings.push(this.convertBufferToReading(buffer));
        }

        return readings;
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
     * return true if FIFO is overflowed
     */
    isOverflowed(): boolean {
        let fstatus = this.readByte(F_STATUS);
        return (fstatus & FStatus.F_OVF) > 0;
    }

    /**
     * return true is watermark is reached
     */
    isWaterMarkReached(): boolean {
        let fstatus = this.readByte(F_STATUS);
        return (fstatus & FStatus.F_WMRK_FLAG) > 0;
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

    private calcPressure(buffer: DataBuffer): number {

        var pressure;

        // use msb, csb and bit 7&6 of lsb for integer part  (of Q18.2 fixed point)
        pressure = (((buffer.p_msb << 8) + buffer.p_csb) << 2) + ((buffer.p_lsb & 0b11000000) >> 6);

        // add fractional part, 2 bit => resolution = 0.25 Pa
        pressure += ((buffer.p_lsb & 0b00100000) >> 5) / 2;
        pressure += ((buffer.p_lsb & 0b00010000) >> 4) / 4;

        return pressure / 100;  // return hPa (millibar)
    }

    private convertBufferToReading(buffer: DataBuffer): PressureReading {

        return {
            barometer: this.calcPressure(buffer),
            mode: this.operatingMode,
            temperature: this.toCelsius(buffer)
        };
    }

    private getReading(mode: OperatingMode) {

        if (this.standy && !this.readSingleValue) {
            throw new Error('Device is in standby mode; cannot get readings');
        }

        while((this.readByte(0x00) & 0x08) === 0) {}

        let buffer = new DataBuffer();

        buffer.p_msb = this.readByte(OUT_P_MSB);
        buffer.p_csb = this.readByte(OUT_P_CSB);
        buffer.p_lsb = this.readByte(OUT_P_LSB);

        buffer.t_msb = this.readByte(OUT_T_MSB);
        buffer.t_lsb = this.readByte(OUT_T_LSB);

        //var tempWord = this.bus.readWordSync(this.deviceAddress, OUT_T_MSB);

        return {
            barometer: this.calcPressure(buffer),
            mode: mode,
            temperature: this.toCelsius(buffer),
        };
    }  // getReading

    /**
     * read the F_DATA buffer 5 times to fetch the oldest sample.
     */
    private readFirstBuffer(): DataBuffer {

        let buffer = new DataBuffer();

        buffer.p_msb = this.readByte(F_DATA);
        buffer.p_csb = this.readByte(F_DATA);
        buffer.p_lsb = this.readByte(F_DATA);
        buffer.t_msb = this.readByte(F_DATA);
        buffer.t_lsb = this.readByte(F_DATA);

        return buffer;
    }

    private readByte(register: number): number {
        return this.bus.readByteSync(this.deviceAddress, register);
    }

    private toCelsius(buffer: DataBuffer): number {
        let rawTemp = (buffer.t_lsb << 8) | (buffer.t_msb & 0xff);
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