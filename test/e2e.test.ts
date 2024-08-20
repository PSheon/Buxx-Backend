import { cleanupStrapi, setupStrapi } from "./helpers/strapi";

import {
  mockBuxxTeamUsers,
  mockUsers,
  mockReferrals,
  mockClaimedRewardRecords,
} from "./constants";

beforeAll(async () => {
  await setupStrapi();
});

afterAll(async () => {
  await cleanupStrapi();
});

it("should create mock users", async () => {
  await strapi.query("plugin::users-permissions.user").createMany({
    data: mockBuxxTeamUsers.concat(mockUsers),
  });

  const usersCount = await strapi
    .query("plugin::users-permissions.user")
    .count();

  expect(usersCount).toBe(202);
});

it("should create mock referrals", async () => {
  // 2
  // │
  // ├── 3
  // │   │
  // │   ├── 31
  // │   │   ├── 131
  // │   │   ├── 132
  // │   │   └── 133
  // │   │
  // │   ├── 32
  // │   │   ├── 134
  // │   │   ├── 135
  // │   │   └── 136
  // │   │
  // │   └── 33
  // │       ├── 137
  // │       ├── 138
  // │       └── 139
  // │
  // ├── 4
  // │   │
  // │   ├── 41
  // │   │   ├── 141
  // │   │   ├── 142
  // │   │   └── 143
  // │   │
  // │   ├── 42
  // │   │   ├── 144
  // │   │   ├── 145
  // │   │   └── 146
  // │   │
  // │   └── 43
  // │       ├── 147
  // │       ├── 148
  // │       └── 149
  // │
  // └── 5
  //     │
  //     ├── 51
  //     │   ├── 151
  //     │   ├── 152
  //     │   └── 153
  //     │
  //     ├── 52
  //     │   ├── 154
  //     │   ├── 155
  //     │   └── 156
  //     │
  //     └── 53
  //         ├── 157
  //         ├── 158
  //         └── 159

  for (const referral of mockReferrals) {
    await strapi.query("api::referral.referral").create({
      data: referral,
    });
  }

  const referralsCount = await strapi.query("api::referral.referral").count();

  expect(referralsCount).toBe(39);
});

it("should create mock claimedRewardRecords", async () => {
  for (const claimedRewardRecords of mockClaimedRewardRecords) {
    await strapi
      .query("api::claimed-reward-record.claimed-reward-record")
      .create({
        data: claimedRewardRecords,
        populate: ["user"],
      });
  }

  const claimedRewardRecordsCount = await strapi
    .query("api::claimed-reward-record.claimed-reward-record")
    .count();

  expect(claimedRewardRecordsCount).toBe(39);
});

it("should calculate team stake share", async () => {
  const knex = strapi.db.connection;

  const userId = 3;
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

  expect(result[0].total_claimed_rewards).toBe(90);
});
