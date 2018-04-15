
export const STATUS = 0x00;
export const OUT_P_MSB = 0x01;
export const OUT_P_CSB = 0x02;
export const OUT_P_LSB = 0x03;
export const OUT_T_MSB = 0x04;
export const OUT_T_LSB = 0x05;
export const DR_STATUS = 0x06;
export const OUT_P_DELTA_MSB = 0x07;
export const OUT_P_DELTA_CSB = 0x08;
export const OUT_P_DELTA_LSB = 0x09;
export const OUT_T_DELTA_MSB = 0x0a;
export const OUT_T_DELTA_LSB = 0x0b;
export const WHO_AM_I = 0x0c;
export const PT_DATA_CFG = 0x13;
export const CTRL_REG1 = 0x26;

// export class Registers {

// }

export enum CtrlReg1 {
    ALT = 0b10000000,
    OSR1 = 0b00000000,
    OSR2 = 0b00001000,
    OSR4 = 0b00010000,
    OSR8 = 0b00011000,
    OSR16 = 0b00100000,
    OSR32 = 0b00101000,
    OSR64 = 0b00110000,
    OSR128 = 0b00111000,
    RST = 0b00000100,
    OST = 0b00000010,
    SBYB = 0b00000001
}