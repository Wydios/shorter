interface LoggerConfig {
    locale: string,
    timeZone: string,
    hour12: boolean
};

const timeConfig: LoggerConfig = {
    locale: "de-DE",
    timeZone: "Europe/Berlin",
    hour12: false
};

function formatMessage(args: unknown[]): string {
    return args.map(arg => {
        if (typeof arg === "object") {
            return JSON.stringify(arg);
        }

        return String(arg);
    }).join(" ");
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

function logMessage(type: string, color: number, ...args: unknown[]): void {
    const message = formatMessage(args);

    const timePart = `\x1b[97m${getTime()}\x1b[0m`;
    const coloredType = `\x1b[${color}m${type}\x1b[0m`;
    const messagePart = `\x1b[${color}m${message}\x1b[0m`;

    console.log(`[${timePart} | ${coloredType}]: ${messagePart}`);
};

export function log(...args: unknown[]): void {
    logMessage("LOG", 32, ...args);
};

export function info(...args: unknown[]): void {
    logMessage("INF", 34, ...args);
};

export function warn(...args: unknown[]): void {
    logMessage("WRN", 33, ...args);
};

export function error(...args: unknown[]): void {
    logMessage("ERR", 31, ...args);
};