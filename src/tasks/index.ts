import { fetchTokenEventLogTask } from "./fetch-event-log";

export default {
  fetchTokenTransactions: {
    task: fetchTokenEventLogTask,
    options: {
      // ** Every 30 seconds
      rule: "*/30 * * * * *",
    },
  },
};
