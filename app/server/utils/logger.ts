interface LoggerConfig {
    locale: string,
    timeZone: string,
    hour12: boolean
};

// Change these values if you want another language or timezone.
// German:  locale: "de-DE", timeZone: "Europe/Berlin", hour12: false
// English: locale: "en-US", timeZone: "America/New_York", hour12: true
const timeConfig: LoggerConfig = {
    locale: "de-DE",
    timeZone: "Europe/Berlin",
    hour12: false
};

function getTime(): string {
    return new Intl.DateTimeFormat(timeConfig.locale, {
        timeZone: timeConfig.timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: timeConfig.hour12
    }).format(new Date());
};

export function log(...args: unknown[]): void {
    console.log(`[${getTime()}]:`, ...args);
};

export function warn(...args: unknown[]): void {
    console.warn(`[${getTime()} | WARN]:`, ...args);
};

export function error(...args: unknown[]): void {
    console.error(`[${getTime()} | ERR]:`, ...args);
};