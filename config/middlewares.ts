export default [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "bloom-rwa.s3.ap-northeast-1.amazonaws.com",
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "bloom-rwa.s3.ap-northeast-1.amazonaws.com",
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      origin: [
        (process.env.FRONTEND_URL as string) || "http://localhost:8080",
        (process.env.BACKEND_URL as string) || "http://localhost:1337",
      ],
      headers: "*",
    },
  },
  {
    name: "strapi::poweredBy",
    config: { poweredBy: "PSheon <pauljiangweb3@gmail.com>" },
  },
  "strapi::query",
  { name: "strapi::body", config: { jsonLimit: "25mb" } },
  "strapi::session",
  {
    name: "strapi::favicon",
    config: {
      path: "./public/favicon.ico",
    },
  },
  "strapi::public",
  "plugin::request-id.request-id",
];
