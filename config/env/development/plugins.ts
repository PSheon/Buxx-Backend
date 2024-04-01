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
    enabled: false,
    config: {},
  },
  email: {
    config: {
      provider: "mailgun",
      providerOptions: {
        key: env("MAILGUN_API_KEY"),
        domain: env("MAILGUN_DOMAIN"),
        url: env("MAILGUN_URL", "https://api.mailgun.net"),
      },
      settings: {
        defaultFrom: env("MAILGUN_DEFAULT_FROM"),
        defaultReplyTo: env("MAILGUN_DEFAULT_REPLY_TO"),
      },
    },
  },
  upload: {
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
  "import-export-entries": {
    enabled: true,
    config: {},
  },
  "local-image-sharp": {
    enabled: true,
    config: {
      cacheDir: ".cache/images",
      maxAge: 2592000,
    },
  },
  "request-id": {
    enabled: true,
    config: {
      correlationIdHeader: "X-Bloom-Trace-Id",
    },
  },
});
