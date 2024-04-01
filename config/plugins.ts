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
});
