import { fetchTokenEventLogTask } from "./fetch-event-log";

export default {
  fetchTokenTransactions: {
    task: fetchTokenEventLogTask,
    options: {
      rule: "*/30 * * * * *",
    },
  },
};
