import { createApp } from "./app";

// Cloud Run (and most container platforms) inject PORT; API_PORT stays for local dev overrides.
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 8787);
const { server } = createApp();

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Academic Integrity Hub API running on http://localhost:${port}`);
});
