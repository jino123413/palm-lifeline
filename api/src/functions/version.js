import { app } from "@azure/functions";

app.http("version", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "version",
  handler: async () => {
    return {
      jsonBody: {
        appName: process.env.APP_NAME ?? "unknown-app",
        appVersion: process.env.APP_VERSION ?? "dev",
        nodeVersion: process.version,
        runtime: "azure-functions-node-v4",
      },
    };
  },
});
