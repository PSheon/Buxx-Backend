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
    enabled: true,
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
    enabled: true,
    config: {
      provider: "aws-s3",
      providerOptions: {
        baseUrl: env("CDN_URL"),
        rootPath: env("CDN_ROOT_PATH"),
        s3Options: {
          credentials: {
            accessKeyId: env("AWS_ACCESS_KEY_ID"),
            secretAccessKey: env("AWS_ACCESS_SECRET"),
          },
          region: env("AWS_REGION"),
          params: {
            ACL: env("AWS_ACL", "public-read"),
            signedUrlExpires: env("AWS_SIGNED_URL_EXPIRES", 15 * 60),
            Bucket: env("AWS_BUCKET"),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
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
      correlationIdHeader: "X-Buxx-Trace-Id",
    },
  },
});
