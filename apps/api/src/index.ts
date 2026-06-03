import { createApp } from "./app";

const port = Number(process.env.API_PORT ?? 8787);
const { server } = createApp();

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Academic Integrity Hub API running on http://localhost:${port}`);
});
