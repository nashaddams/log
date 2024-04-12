# log

A very basic logging utility with no dependencies.

[![JSR](https://jsr.io/badges/@nashaddams/log)](https://jsr.io/@nashaddams/log)
[![JSR Score](https://jsr.io/badges/@nashaddams/log/score)](https://jsr.io/@nashaddams/log)

**Console logging**

```ts
import { Log } from "@nashaddams/log";

const log = Log.init();

log.debug(...); // No output with default log level `warn`
log.info(...);  // No output with default log level `warn`
log.warn(...);  // 2024-03-01T12:34:56.789Z WARN ...
log.error(...); // 2024-03-01T12:34:56.789Z ERROR ...
```

**File logging**

```ts
import { Log } from "@nashaddams/log";

const log = Log.init({
  level: "debug",
  target: ["file"],
  prefix: "[consumer]",
  filePath: "consumer.log",
});

log.debug(...); // 2024-03-01T12:34:56.789Z DEBUG [consumer] ...
log.info(...);  // 2024-03-01T12:34:56.789Z INFO [consumer] ...
log.warn(...);  // 2024-03-01T12:34:56.789Z WARN [consumer] ...
log.error(...); // 2024-03-01T12:34:56.789Z ERROR [consumer] ...
```
