export default ({ env }) => ({
  documentation: {
    enabled: false,
    config: {},
  },
  sentry: {
    enabled: false,
    config: {},
  },
  email: {
    enabled: false,
    config: {},
  },
  upload: {
    enabled: true,
    config: {
      provider: "local",
      sizeLimit: 15 * 1024 * 1024,
    },
  },
  "strapi-blurhash": {
    enabled: true,
    config: {
      regenerateOnUpdate: true,
    },
  },
  "config-sync": {
    enabled: true,
    config: {
      syncDir: "config/sync/",
    },
  },
  "generate-data": {
    enabled: false,
    config: {},
  },
  "import-export-entries": {
    enabled: false,
    config: {},
  },
  "local-image-sharp": {
    enabled: false,
    config: {},
  },
  "request-id": {
    enabled: true,
    config: {
      correlationIdHeader: "X-Buxx-Trace-Id",
    },
  },
});
