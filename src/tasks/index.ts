import { clearTaskLogTask } from "./clear-task-log";
import { fetchTokenEventLogTask } from "./fetch-event-log";

export default {
  clearTaskLog: {
    task: clearTaskLogTask,
    options: {
      // ** Every day at 00:00:00
      rule: "0 0 0 * * *",
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
