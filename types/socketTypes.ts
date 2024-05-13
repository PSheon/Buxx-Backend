export type SystemStatusType = {
  os: {
    name: string;
    type: string;
    arch: string;
    nodeVersion: string;
  };
  db: {
    name: string;
  };
  cpu: {
    model: string;
    count: number;
    usagePercentageHistory: number[];
  };
  memory: {
    totalGb: number;
    usagePercentageHistory: number[];
  };
  drive: {
    totalGb: number;
    usedGb: number;
  };
  process: {
    totalCountHistory: number[];
  };
  log: {
    system: string;
  };
};
