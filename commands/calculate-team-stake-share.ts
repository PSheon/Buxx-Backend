import strapi from "@strapi/strapi";
import fs from "fs";

import subDays from "date-fns/subDays";
import startOfWeek from "date-fns/startOfWeek";
import endOfWeek from "date-fns/endOfWeek";

const calculateTeamStakeShare = async () => {
  const appContext = await strapi.compile();
  const app = await strapi(appContext).load();
  const knex = app.db.connection;

  const BATCH_SIZE = 100;
  let teamStakeShareResult = [];
  let completedCount = 0;

  const totalReferralsCount = await app.entityService.count(
    "api::referral.referral",
    {
      filters: {
        createdAt: {
          $gte: startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }),
          $lt: endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }),
        },
      },
    }
  );

  while (completedCount < totalReferralsCount) {
    const referrals = await app.entityService.findMany(
      "api::referral.referral",
      {
        filters: {
          createdAt: {
            $gte: startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }),
            $lt: endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }),
          },
        },
        populate: ["user"],
        sort: "lastTeamShareSettlementDate:asc",
        start: completedCount,
        limit: BATCH_SIZE,
      }
    );

    if (referrals.length === 0) {
      break;
    }

    // @ts-ignore
    for await (const referral of referrals) {
      const userId = referral.user.id;
      const startDateTime = new Date(
        new Date().setDate(new Date().getDate() - new Date().getDay() - 6)
      ).setHours(0, 0, 0, 0);
      const endDateTime = new Date(
        new Date().setDate(new Date().getDate() - new Date().getDay())
      ).setHours(23, 59, 59, 999);

      const result = await knex.raw(
        `
          WITH base_user_data AS (
            SELECT *
            FROM referrals r
            JOIN referrals_user_links rul ON r.id = rul.referral_id
            WHERE rul.user_id = ?
          ),
          claimed_rewards_data AS (
            SELECT
              br.user_id AS base_user_id,
              SUM(CASE WHEN r.rank = br.rank + 1 THEN crr.balance ELSE 0 END) AS rank1_total,
              SUM(CASE WHEN r.rank = br.rank + 2 THEN crr.balance ELSE 0 END) AS rank2_total,
              SUM(CASE WHEN r.rank = br.rank + 3 THEN crr.balance ELSE 0 END) AS rank3_total,
              SUM(CASE WHEN r.rank > br.rank + 3 THEN crr.balance ELSE 0 END) AS rank_gt3_total
            FROM claimed_reward_records crr
            JOIN claimed_reward_records_user_links crul ON crr.id = crul.claimed_reward_record_id
            JOIN referrals_user_links rul ON crul.user_id = rul.user_id
            JOIN referrals r ON rul.referral_id = r.id
            JOIN base_user_data br ON r.path LIKE CONCAT(br.path, '%')
            WHERE crr.created_at >= ?
              AND crr.created_at < ?
            GROUP BY br.user_id
          )
          SELECT
            COALESCE(SUM(
              CASE
                WHEN br.level = 4 THEN crd.rank1_total * 0.05
                WHEN br.level = 5 THEN crd.rank1_total * 0.10
                WHEN br.level = 6 THEN crd.rank1_total * 0.20
                WHEN br.level = 7 THEN
                  crd.rank1_total * 0.20 +
                  crd.rank2_total * 0.10
                WHEN br.level = 8 THEN
                  crd.rank1_total * 0.20 +
                  crd.rank2_total * 0.10 +
                  crd.rank3_total * 0.05
                WHEN br.level = 9 THEN
                  crd.rank1_total * 0.20 +
                  crd.rank2_total * 0.10 +
                  crd.rank3_total * 0.05 +
                  crd.rank_gt3_total * 0.005
                ELSE 0
              END
            ), 0) AS total_claimed_rewards
          FROM base_user_data br
          JOIN claimed_rewards_data crd ON br.user_id = crd.base_user_id
        `,
        [userId, startDateTime, endDateTime]
      );
      const totalClaimedRewards = result[0].total_claimed_rewards;

      teamStakeShareResult.push({
        referralId: referral.id,
        userId,
        totalClaimedRewards,
      });
      console.log(
        `Referral ID: ${referral.id}, Total Claimed Rewards: ${totalClaimedRewards}`
      );
    }

    completedCount += referrals.length;
  }

  fs.writeFileSync(
    "team-stake-share-result.json",
    JSON.stringify(teamStakeShareResult, null, 2)
  );

  app.server.destroy();
  app.stop(0);
};

calculateTeamStakeShare();
