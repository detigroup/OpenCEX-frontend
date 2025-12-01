const PaySystems = {
  cauri: "cauri",
  payeer: "payeer",
  sepa: "sepa",
};

export default {
  supportedLanguages: ["en", "ru", "vn"],
  defaultLanguage: "ru",
  currentWithdrawCardPaySystem: PaySystems.cauri,
  currentTopUpCardPaySystem: PaySystems.cauri,
  PaySystems,
};
