const PROVIDER_COLORS: Record<string, string> = {
  Monetag: '#f97316',
  SDK: '#6366f1',
};

const ADS_BADGE_STYLE =
  'background:#1e293b;color:#38bdf8;padding:2px 6px;border-radius:3px;font-weight:bold';

function getProviderStyle(provider: string): string {
  const color = PROVIDER_COLORS[provider] || '#94a3b8';
  return `background:${color};color:#fff;padding:2px 6px;border-radius:3px;font-weight:bold`;
}

function formatTimestamp(): string {
  const now = performance.now();
  return `${(now / 1000).toFixed(2)}s`;
}

export interface AdLogger {
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
  group(label: string): void;
  groupEnd(): void;
  time(label: string): void;
  timeEnd(label: string): void;
}

export function createAdLogger(provider: string): AdLogger {
  const timers = new Map<string, number>();

  const providerStyle = getProviderStyle(provider);

  return {
    info(message: string, data?: unknown) {
      if (data !== undefined) {
        console.log(
          `%c ADS %c ${provider} %c ${message} [${formatTimestamp()}]`,
          ADS_BADGE_STYLE,
          providerStyle,
          'color:inherit',
          data,
        );
      } else {
        console.log(
          `%c ADS %c ${provider} %c ${message} [${formatTimestamp()}]`,
          ADS_BADGE_STYLE,
          providerStyle,
          'color:inherit',
        );
      }
    },

    warn(message: string, data?: unknown) {
      if (data !== undefined) {
        console.warn(
          `%c ADS %c ${provider} %c ${message} [${formatTimestamp()}]`,
          ADS_BADGE_STYLE,
          providerStyle,
          'color:#f59e0b;font-weight:bold',
          data,
        );
      } else {
        console.warn(
          `%c ADS %c ${provider} %c ${message} [${formatTimestamp()}]`,
          ADS_BADGE_STYLE,
          providerStyle,
          'color:#f59e0b;font-weight:bold',
        );
      }
    },

    error(message: string, data?: unknown) {
      if (data !== undefined) {
        console.error(
          `%c ADS %c ${provider} %c ${message} [${formatTimestamp()}]`,
          ADS_BADGE_STYLE,
          providerStyle,
          'color:#ef4444;font-weight:bold',
          data,
        );
      } else {
        console.error(
          `%c ADS %c ${provider} %c ${message} [${formatTimestamp()}]`,
          ADS_BADGE_STYLE,
          providerStyle,
          'color:#ef4444;font-weight:bold',
        );
      }
    },

    group(label: string) {
      console.groupCollapsed(
        `%c ADS %c ${provider} %c ${label} [${formatTimestamp()}]`,
        ADS_BADGE_STYLE,
        providerStyle,
        'color:inherit;font-weight:bold',
      );
    },

    groupEnd() {
      console.groupEnd();
    },

    time(label: string) {
      timers.set(label, performance.now());
    },

    timeEnd(label: string) {
      const start = timers.get(label);
      if (start !== undefined) {
        const duration = performance.now() - start;
        timers.delete(label);
        console.log(
          `%c ADS %c ${provider} %c ${label} took ${duration.toFixed(0)}ms`,
          ADS_BADGE_STYLE,
          providerStyle,
          'color:#38bdf8;font-style:italic',
        );
      }
    },
  };
}
