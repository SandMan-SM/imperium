export const SUCCESS_EMPIRE = {
  name: "Success Empire",
  applicationPath: "/apply/",
  applicationUrl: "https://secretimperium.com/apply/",
  phone: "+18014581756",
  displayPhone: "801-458-1756",
  smsMessage: "I would like to learn more about success empire.",
  applicationQuestion: "What would you like to build or change by joining Success Empire?",
} as const;

export const SUCCESS_EMPIRE_SMS = `sms:${SUCCESS_EMPIRE.phone}?body=${encodeURIComponent(SUCCESS_EMPIRE.smsMessage)}`;
