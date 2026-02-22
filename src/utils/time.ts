class Time {
    now(): number {
        return Date.now();
    };

    date(input?: string | number | Date): Date {
        return input ? new Date(input) : new Date();
    };
};

const time = new Time();
export default time;