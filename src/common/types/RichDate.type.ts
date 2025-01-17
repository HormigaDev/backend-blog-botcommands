export class RDate extends Date {
    constructor(year: number, month: number, day: number) {
        super(year, month, day);
    }

    toFormat(format = 'Y-M-D') {
        return format
            .replace('D', '' + this.getDate())
            .replace('M', '' + this.getMonth() + 1)
            .replace('Y', '' + this.getFullYear())
            .replace('h', '' + this.getHours())
            .replace('m', '' + this.getMinutes());
    }
}
