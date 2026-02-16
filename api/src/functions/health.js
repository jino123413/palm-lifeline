import { app } from "@azure/functions";

app.http("health", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "health",
  handler: async () => {
    const appName = process.env.APP_NAME ?? "unknown-app";
    const appVersion = process.env.APP_VERSION ?? "dev";
    const now = new Date().toISOString();

    return {
      jsonBody: {
        ok: true,
        appName,
        appVersion,
        now,
      },
    };
  },
});
