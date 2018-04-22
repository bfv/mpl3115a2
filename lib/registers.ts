
/* register definitions according to:
 * https://www.nxp.com/docs/en/data-sheet/MPL3115A2.pdf
 * see also: https://www.nxp.com/docs/en/application-note/AN4519.pdf
 */

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
export const WHO_AM_I = 0x0c;           // read-only, contains device identifier (0xC4)

// The F_STATUS contains info on the FIFO buffer which support up to 32 samples
export const F_STATUS = 0x0d;

// the first 6 bits are called F_CNT0 - F_CNT5 and contain the size of the FIFO buffer
export enum FStatus {
    F_OVF = 0b10000000,           // 1 = overflow event detected
    F_WMRK_FLAG = 0b01000000      // 1 = FIFO watermark event detected. FIFO sample count greater than watermark value
}

/* F_DATA is a read-only register which contains the P & T bytes values:
1st read OUT_P_MSB (oldest)
2nd read OUT_P_CSB (oldest)
3rd read OUT_P_LSB (oldest)
4th read OUT_T_MSB (oldest)
5th read OUT_T_LSB (oldest)
*/
export const F_DATA = 0x0e;       // read-only sample values

export const F_SETUP = 0x0f;

export enum FSetup {
  F_MODE1 = 0b10000000,  // 01 circle when overflowed
  F_MODE0 = 0b01000000   // 10 stop new samples when overflowed
  // F_WMRK[5:0] set the amount of samples to trigger a watermark interupt
}

// the number of ticks of data since the last byte of the FIFO was written
export const TIME_DLY = 0x10;

export const SYSMOD = 0x11;
export enum Sysmod {
    SYSMOD = 0x00     // 0 = standby, 1 = active
}

export const INT_SOURCE = 0x12;
export enum IntSource {
  SRC_DRDY = 0b10000000,
  SRC_FIFO = 0b01000000,
  SRC_PW = 0b00100000,
  SRC_TW = 0b00010000,
  SRC_PTH = 0b00001000,
  SRC_TTH = 0b00000100,
  SRC_PCHG = 0b0000010,
  SRC_TCHG = 0b0000001
}

export const PT_DATA_CFG = 0x13;
export enum PtDataCfg {
    DREM = 0b00000100,  // Deta event ready mode
    PDEFE = 0b0000010,  // Data event flag enable (pressure)
    TDEFE = 0b0000001   // Data event flag enable (temperature)
}

/* skipping a few... */

export const CTRL_REG1 = 0x26;
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
export enum OperatingMode {
    Barometer = 0,
    Altimeter = 1
}

export const CTRL_REG2 = 0x27;
export enum CtrlReg2 {
    LOAD_OUTPUT = 0b00100000,
    ALARM_SEL = 0b00010000,
    // ST[3:0] = x, where 2^x is the number of second between samples
}

export const CTRL_REG3 = 0x28;
export enum CtrlReg3 {
    IPOL1 = 0b00100000,
    PP_OD1 = 0b00010000,
    IPOL2 = 0b00000010,
    PP_OD2 = 0b00000001
}

// control which interupt are enabled
export const CTRL_REG4 = 0x29;
export enum CtrlReg4 {
    INT_EN_DRDY = 0b10000000,
    INT_EN_FIFO = 0b01000000,
    INT_EN_PW = 0b00100000,
    INT_EN_TW = 0b00010000,
    INT_EN_PTH = 0b00001000,
    INT_EN_TTH = 0b00000100,
    INT_EN_PCHG = 0b0000010,
    INT_EN_TCHG = 0b0000001
}

// control  to which pins are routed 0 = int2, 1 = int1
export const CTRL_REG5 = 0x30;
export enum CtrlReg5 {
    INT_EN_DRDY = 0b10000000,
    INT_EN_FIFO = 0b01000000,
    INT_EN_PW = 0b00100000,
    INT_EN_TW = 0b00010000,
    INT_EN_PTH = 0b00001000,
    INT_EN_TTH = 0b00000100,
    INT_EN_PCHG = 0b0000010,
    INT_EN_TCHG = 0b0000001
}