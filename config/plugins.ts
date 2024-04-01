export default ({ env }) => ({
  documentation: {
    enabled: true,
    config: {
      info: {
        version: "0.0.1",
      },
    },
  },
  sentry: {
    enabled: true,
    config: {
      dsn: env("SENTRY_DSN"),
      sendMetadata: true,
    },
  },
});
