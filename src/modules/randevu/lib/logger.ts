/* Basit logger — üretimde pino gibi bir kütüphane ile değiştirilebilir */
type LogLevel = "info" | "warn" | "error" | "debug";

function log(level: LogLevel, data: Record<string, unknown>, message: string) {
  const entry = {
    level,
    time: new Date().toISOString(),
    msg: message,
    ...data,
  };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info:  (data: Record<string, unknown>, msg: string) => log("info",  data, msg),
  warn:  (data: Record<string, unknown>, msg: string) => log("warn",  data, msg),
  error: (data: Record<string, unknown>, msg: string) => log("error", data, msg),
  debug: (data: Record<string, unknown>, msg: string) => log("debug", data, msg),
};
