import strapi from "@strapi/strapi";

const initDB = async () => {
  const appContext = await strapi.compile();
  const app = await strapi(appContext).load();

  /* Update user exp and points */
  await app.db.query("plugin::users-permissions.user").updateMany({
    where: {
      $or: [
        {
          exp: { $gt: 0 },
        },
        {
          points: { $gt: 0 },
        },
      ],
    },
    data: {
      exp: 0,
      points: 0,
    },
  });

  /* Delete access log */
  await app.db.query("api::access-log.access-log").deleteMany();

  /* Delete activity log */
  await app.db.query("api::activity-log.activity-log").deleteMany();

  /* Delete daily check record */
  await app.db.query("api::daily-check-record.daily-check-record").deleteMany();

  /* Delete event log */
  await app.db.query("api::event-log.event-log").deleteMany();

  /* Delete notification */
  await app.db.query("api::notification.notification").deleteMany();

  /* Delete earning record */
  await app.db.query("api::earning-record.earning-record").deleteMany();

  /* Update referral */
  await app.db.query("api::referral.referral").updateMany({
    where: {},
    data: {
      stakedValue: 0,
      level: 1,
    },
  });

  /* Delete sync event log task log */
  await app.db
    .query("api::sync-event-log-task-log.sync-event-log-task-log")
    .deleteMany();

  /* Delete token */
  await app.db.query("api::token.token").deleteMany();

  app.server.destroy();
  app.stop(0);
};

initDB();
