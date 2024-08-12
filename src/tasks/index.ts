import { clearTaskLogTask } from "./clear-task-log";
import { fetchTokenEventLogTask } from "./fetch-event-log";

export default {
  clearTaskLog: {
    task: clearTaskLogTask,
    options: {
      rule: "0 */3 * * * *",
    },
  },
  fetchTokenTransactions: {
    task: fetchTokenEventLogTask,
    options: {
      rule: "*/30 * * * * *",
    },
  },
};
