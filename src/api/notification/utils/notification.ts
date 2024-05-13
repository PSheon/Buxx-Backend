export const getWelcomeNotificationContent = ({ notifier }) => {
  /* TODO: handle JsonValue issue here */
  return {
    time: 1714365988539,
    blocks: [
      {
        id: "uxTQRkVH28",
        type: "paragraph",
        data: {
          text: `Hello ${notifier.username}, Welcome...`,
        },
      },
    ],
    version: "2.29.1",
  } as any;
};
