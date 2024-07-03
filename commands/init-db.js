const strapi = require("@strapi/strapi");

const initDB = async () => {
  const appContext = await strapi.compile();
  const app = await strapi(appContext).load();

  /* Update user exp and points */
  await app.db.query("plugin::users-permissions.user").updateMany({
    where: {
      $or: [
        {
          exp: {
            $gt: 0,
          },
        },
        {
          points: {
            $gt: 0,
          },
        },
      ],
    },
    data: {
      exp: 0,
      points: 0,
    },
  });

  /* Delete daily check record */
  await app.db.query("api::daily-check-record.daily-check-record").deleteMany();
  /* Delete point record */
  await app.db.query("api::point-record.point-record").deleteMany();
  /* Delete referral */
  await app.db.query("api::referral.referral").deleteMany();

  /* Delete event log */
  await app.db.query("api::event-log.event-log").deleteMany();
  /* Delete token */
  await app.db.query("api::token.token").deleteMany();

  /* Delete wallet */
  await app.db.query("api::wallet.wallet").deleteMany();

  app.server.destroy();
  app.stop(0);
};

initDB();
