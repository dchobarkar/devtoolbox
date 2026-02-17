export interface TimestampResult {
  valid: boolean;
  error?: string;
  timestampMs?: number;
  localString?: string;
  utcString?: string;
  iso?: string;
  rfc2822?: string;
  unixSeconds?: number;
  unixMs?: number;
  relative?: string;
}

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const YEAR = 365.25 * DAY;

const formatRelative = (ms: number): string => {
  const now = Date.now();
  const diff = ms - now;
  const abs = Math.abs(diff);
  const sign = diff >= 0 ? "in " : "";
  const suffix = diff < 0 ? " ago" : "";

  if (abs < SEC) return diff < 0 ? "just now" : "right now";
  if (abs < MIN)
    return `${sign}${Math.round(abs / SEC)} second${abs >= 2 * SEC ? "s" : ""}${suffix}`;
  if (abs < HOUR)
    return `${sign}${Math.round(abs / MIN)} minute${abs >= 2 * MIN ? "s" : ""}${suffix}`;
  if (abs < DAY)
    return `${sign}${Math.round(abs / HOUR)} hour${abs >= 2 * HOUR ? "s" : ""}${suffix}`;
  if (abs < YEAR)
    return `${sign}${Math.round(abs / DAY)} day${abs >= 2 * DAY ? "s" : ""}${suffix}`;
  return `${sign}${Math.round(abs / YEAR)} year${abs >= 2 * YEAR ? "s" : ""}${suffix}`;
};

const toRfc2822 = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const tzOffset = -date.getTimezoneOffset();
  const tzSign = tzOffset >= 0 ? "+" : "-";
  const tzHours = Math.floor(Math.abs(tzOffset) / 60);
  const tzMins = Math.abs(tzOffset) % 60;
  const tzStr = `${tzSign}${pad(tzHours)}${pad(tzMins)}`;
  return `${days[date.getDay()]}, ${pad(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${tzStr}`;
};

const buildResult = (timestampMs: number): TimestampResult => {
  const d = new Date(timestampMs);
  const iso = d.toISOString();
  const rfc2822 = toRfc2822(d);
  const unixSeconds = Math.floor(timestampMs / SEC);
  const unixMs = Math.round(timestampMs);
  return {
    valid: true,
    timestampMs,
    localString: d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "medium",
    }),
    utcString: d.toUTCString(),
    iso,
    rfc2822,
    unixSeconds,
    unixMs,
    relative: formatRelative(timestampMs),
  };
};

const parseTimestamp = (input: string): TimestampResult => {
  const raw = input.trim();
  if (!raw) {
    return { valid: false, error: "Enter a timestamp or date" };
  }

  const num = Number(raw);
  if (
    Number.isFinite(num) &&
    raw.replace(/^[-+]?\d*\.?\d*([eE][-+]?\d+)?$/, "") === ""
  ) {
    const absStr = raw.replace(/^-/, "");
    const digits =
      absStr.replace(/\.|e\d+/gi, "").replace(/^0+/, "").length || 1;
    let timestampMs: number;
    if (digits <= 10) {
      timestampMs = num * SEC;
    } else if (digits <= 13) {
      timestampMs = num; // ms
    } else if (digits <= 16) {
      timestampMs = num / 1000; // µs -> ms
    } else {
      timestampMs = num / 1_000_000; // ns -> ms
    }
    if (
      !Number.isFinite(timestampMs) ||
      timestampMs < -8.64e15 ||
      timestampMs > 8.64e15
    ) {
      return { valid: false, error: "Timestamp out of valid date range" };
    }
    return buildResult(timestampMs);
  }

  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) {
    return { valid: false, error: "Could not parse as timestamp or date" };
  }
  return buildResult(parsed);
};

const nowUnixSeconds = (): number => {
  return Math.floor(Date.now() / SEC);
};

const nowUnixMs = (): number => {
  return Date.now();
};

export { parseTimestamp, nowUnixSeconds, nowUnixMs };
