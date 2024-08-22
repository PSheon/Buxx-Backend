import { backupDB } from "./backup-db";
import { fetchTokenEventLogTask } from "./fetch-event-log";
import { calculateTeamStakeShareTask } from "./calculate-team-stake-share";

export default {
  backupDB: {
    task: backupDB,
    options: {
      // ** Everyday at 03:00:00
      rule: "0 0 3 * * *",
    },
  },
  fetchTokenTransactions: {
    task: fetchTokenEventLogTask,
    options: {
      // ** Every 30 seconds
      rule: "*/30 * * * * *",
    },
  },
  calculateTeamStakeShare: {
    task: calculateTeamStakeShareTask,
    options: {
      // ** Every Monday at 03:05:00
      rule: "5 0 3 * * 1",
    },
  },
};
