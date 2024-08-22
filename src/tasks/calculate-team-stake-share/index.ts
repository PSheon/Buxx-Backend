/**
 * Calculate Team Stake Share Task
 */

import { Strapi } from "@strapi/strapi";

import subDays from "date-fns/subDays";
import startOfWeek from "date-fns/startOfWeek";
import endOfWeek from "date-fns/endOfWeek";

export const calculateTeamStakeShareTask = async ({
  strapi,
}: {
  strapi: Strapi;
}) => {
  const knex = strapi.db.connection;
  const BATCH_SIZE = 100;

  let calculateTeamShareLogId = null;
  let totalCalculateCount = 0;
  let completedCount = 0;

  // ** Step. Find last week's calculate team share log
  const currentCalculateTeamShareEntities = await strapi.entityService.findMany(
    "api::calculate-team-share-log.calculate-team-share-log",
    {
      filters: {
        settlementStartDate: startOfWeek(subDays(new Date(), 7), {
          weekStartsOn: 1,
        }),
        settlementEndDate: endOfWeek(subDays(new Date(), 7), {
          weekStartsOn: 1,
        }),
      },
      sort: "createdAt:desc",
    }
  );
  if (currentCalculateTeamShareEntities.length !== 0) {
    calculateTeamShareLogId = currentCalculateTeamShareEntities[0].id;
    totalCalculateCount =
      currentCalculateTeamShareEntities[0].totalCalculateCount;
  } else {
    const totalReferralsCount = await strapi.entityService.count(
      "api::referral.referral",
      {
        filters: {
          lastTeamShareSettlementDate: {
            $gte: startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }),
            $lt: endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }),
          },
        },
      }
    );

    const calculateTeamShareLogEntity = await strapi.entityService.create(
      "api::calculate-team-share-log.calculate-team-share-log",
      {
        data: {
          settlementStartDate: startOfWeek(subDays(new Date(), 7), {
            weekStartsOn: 1,
          }),
          settlementEndDate: endOfWeek(subDays(new Date(), 7), {
            weekStartsOn: 1,
          }),
          totalCalculateCount: totalReferralsCount,
        },
      }
    );

    calculateTeamShareLogId = calculateTeamShareLogEntity.id;
    totalCalculateCount = totalReferralsCount;
  }

  // ** Step. Start calculate batch
  const mainStartFlag = Date.now();
  while (completedCount < totalCalculateCount) {
    const referrals = await strapi.entityService.findMany(
      "api::referral.referral",
      {
        filters: {
          lastTeamShareSettlementDate: {
            $gte: startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }),
            $lt: endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }),
          },
        },
        populate: ["user"],
        sort: "lastTeamShareSettlementDate:asc",
        start: 0,
        limit: BATCH_SIZE,
      }
    );
    if (referrals.length === 0) {
      break;
    }

    for await (const referral of referrals) {
      const userId = referral.user.id;
      const startDateTime = new Date(
        new Date().setDate(new Date().getDate() - new Date().getDay() - 6)
      ).setHours(0, 0, 0, 0);
      const endDateTime = new Date(
        new Date().setDate(new Date().getDate() - new Date().getDay())
      ).setHours(23, 59, 59, 999);

      const queryStartFlag = Date.now();
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
      const queryEndFlag = Date.now();

      // ** Create earning record
      await strapi
        .service("api::earning-record.earning-record")
        .logEarningRecord({
          type: "TeamStakeShare",
          user: referral.user,
          earningExp: totalClaimedRewards * 5,
          earningPoints: totalClaimedRewards,
          receipt: {
            type: "TeamStakeShare",
            userId: referral.user.id,
            exp: totalClaimedRewards * 5,
            points: totalClaimedRewards,
            queryExecutionTime: queryEndFlag - queryStartFlag,
          },
        });

      // ** Update lastTeamShareSettlementDate
      await strapi.entityService.update("api::referral.referral", referral.id, {
        data: {
          // @ts-ignore
          lastTeamShareSettlementDate: new Date(),
        },
      });

      console.log(
        `Referral ID: ${
          referral.id
        }, Total Claimed Rewards: ${totalClaimedRewards}, Query execution time: ${
          queryEndFlag - queryStartFlag
        } ms`
      );
    }

    completedCount += referrals.length;
  }
  const mainEndFlag = Date.now();

  // ** Update calculateTeamShareLog
  await strapi.entityService.update(
    "api::calculate-team-share-log.calculate-team-share-log",
    calculateTeamShareLogId,
    {
      data: {
        totalQueryExecutionTimeMs: mainEndFlag - mainStartFlag,
      },
    }
  );
};
