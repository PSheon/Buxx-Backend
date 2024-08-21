import { backupDB } from "./backup-db";
import { fetchTokenEventLogTask } from "./fetch-event-log";

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
};
