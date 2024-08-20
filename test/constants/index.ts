/* Mock Users */
export const mockBuxxTeamUsers = [
  {
    username: "Buxx Admin",
    email: "admin@buxx.finance",
    provider: "local",
    password: "abc1234",
    role: 1,
    confirmed: false,
    blocked: null,
  },
  {
    username: "Buxx Team",
    email: "pr@buxx.finance",
    provider: "local",
    password: "abc1234",
    role: 1,
    confirmed: false,
    blocked: null,
    referralRank: 1,
    referralPath: "_2_",
  },
];

export const mockUsers = [...Array(200).keys()].map((i) => ({
  username: `User ${i.toString().padStart(3, "0")}`,
  email: `user_${i.toString().padStart(3, "0")}@buxx.finance`,
  provider: "local",
  password: "abc1234",
  role: 1,
  confirmed: false,
  blocked: null,
}));

/* Mock Referrals */
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

export const mockReferrals = [
  { user: 3, referrer: 2, level: 5, rank: 2, path: "_2_3_" },
  { user: 4, referrer: 2, level: 4, rank: 2, path: "_2_4_" },
  { user: 5, referrer: 2, level: 4, rank: 2, path: "_2_5_" },
  { user: 31, referrer: 3, level: 4, rank: 3, path: "_2_3_31_" },
  { user: 32, referrer: 3, level: 4, rank: 3, path: "_2_3_32_" },
  { user: 33, referrer: 3, level: 4, rank: 3, path: "_2_3_33_" },
  { user: 41, referrer: 4, level: 4, rank: 3, path: "_2_4_41_" },
  { user: 42, referrer: 4, level: 4, rank: 3, path: "_2_4_42_" },
  { user: 43, referrer: 4, level: 4, rank: 3, path: "_2_4_43_" },
  { user: 51, referrer: 5, level: 4, rank: 3, path: "_2_5_51_" },
  { user: 52, referrer: 5, level: 4, rank: 3, path: "_2_5_52_" },
  { user: 53, referrer: 5, level: 4, rank: 3, path: "_2_5_53_" },
  { user: 131, referrer: 31, level: 4, rank: 4, path: "_2_3_31_131_" },
  { user: 132, referrer: 31, level: 4, rank: 4, path: "_2_3_31_132_" },
  { user: 133, referrer: 31, level: 4, rank: 4, path: "_2_3_31_133_" },
  { user: 134, referrer: 32, level: 4, rank: 4, path: "_2_3_32_134_" },
  { user: 135, referrer: 32, level: 4, rank: 4, path: "_2_3_32_135_" },
  { user: 136, referrer: 32, level: 4, rank: 4, path: "_2_3_32_136_" },
  { user: 137, referrer: 33, level: 4, rank: 4, path: "_2_3_33_137_" },
  { user: 138, referrer: 33, level: 4, rank: 4, path: "_2_3_33_138_" },
  { user: 139, referrer: 33, level: 4, rank: 4, path: "_2_3_33_139_" },
  { user: 141, referrer: 41, level: 4, rank: 4, path: "_2_4_41_141_" },
  { user: 142, referrer: 41, level: 4, rank: 4, path: "_2_4_41_142_" },
  { user: 143, referrer: 41, level: 4, rank: 4, path: "_2_4_41_143_" },
  { user: 144, referrer: 42, level: 4, rank: 4, path: "_2_4_42_144_" },
  { user: 145, referrer: 42, level: 4, rank: 4, path: "_2_4_42_145_" },
  { user: 146, referrer: 42, level: 4, rank: 4, path: "_2_4_42_146_" },
  { user: 147, referrer: 43, level: 4, rank: 4, path: "_2_4_43_147_" },
  { user: 148, referrer: 43, level: 4, rank: 4, path: "_2_4_43_148_" },
  { user: 149, referrer: 43, level: 4, rank: 4, path: "_2_4_43_149_" },
  { user: 151, referrer: 51, level: 4, rank: 4, path: "_2_5_51_151_" },
  { user: 152, referrer: 51, level: 4, rank: 4, path: "_2_5_51_152_" },
  { user: 153, referrer: 51, level: 4, rank: 4, path: "_2_5_51_153_" },
  { user: 154, referrer: 52, level: 4, rank: 4, path: "_2_5_52_154_" },
  { user: 155, referrer: 52, level: 4, rank: 4, path: "_2_5_52_155_" },
  { user: 156, referrer: 52, level: 4, rank: 4, path: "_2_5_52_156_" },
  { user: 157, referrer: 53, level: 4, rank: 4, path: "_2_5_53_157_" },
  { user: 158, referrer: 53, level: 4, rank: 4, path: "_2_5_53_158_" },
  { user: 159, referrer: 53, level: 4, rank: 4, path: "_2_5_53_159_" },
];

/* Mock ClaimedRewardRecords */
export const mockClaimedRewardRecords = [
  { userId: 3, balance: 100 },
  { userId: 4, balance: 100 },
  { userId: 5, balance: 100 },
  { userId: 31, balance: 300 },
  { userId: 32, balance: 300 },
  { userId: 33, balance: 300 },
  { userId: 41, balance: 300 },
  { userId: 42, balance: 300 },
  { userId: 43, balance: 300 },
  { userId: 51, balance: 300 },
  { userId: 52, balance: 300 },
  { userId: 53, balance: 300 },
  { userId: 131, balance: 500 },
  { userId: 132, balance: 500 },
  { userId: 133, balance: 500 },
  { userId: 134, balance: 500 },
  { userId: 135, balance: 500 },
  { userId: 136, balance: 500 },
  { userId: 137, balance: 500 },
  { userId: 138, balance: 500 },
  { userId: 139, balance: 500 },
  { userId: 141, balance: 500 },
  { userId: 142, balance: 500 },
  { userId: 143, balance: 500 },
  { userId: 144, balance: 500 },
  { userId: 145, balance: 500 },
  { userId: 146, balance: 500 },
  { userId: 147, balance: 500 },
  { userId: 148, balance: 500 },
  { userId: 149, balance: 500 },
  { userId: 151, balance: 500 },
  { userId: 152, balance: 500 },
  { userId: 153, balance: 500 },
  { userId: 154, balance: 500 },
  { userId: 155, balance: 500 },
  { userId: 156, balance: 500 },
  { userId: 157, balance: 500 },
  { userId: 158, balance: 500 },
  { userId: 159, balance: 500 },
].map((item) => ({
  user: item.userId,
  chain: "Ethereum Sepolia",
  rewardCurrency: "USDT",
  balance: item.balance,
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
}));
