/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

export type RootDrawerNavParams = {
  HomeNav: undefined;
  AccountNav: undefined;
  PaymentNav: undefined;
  ContactUsNav: undefined;
  SettingsNav: undefined;
  AboutNav: undefined;
  HelpNav: undefined;
  NotFound: undefined;
  NotificationNav: undefined;
};

export type BottomTabParamList = {
  TabOne: undefined;
  TabTwo: undefined;
};

export type TabOneParamList = {
  TabOneScreen: undefined;
};

export type TabTwoParamList = {
  TabTwoScreen: undefined;
};

export type RootStackUnauthenticated = {
  SignIn: undefined;
  SignUp: undefined;
  ConfirmAccount: undefined;
  ForgotPassword: undefined;
  RecoveryPassword: undefined;
}

export type RootDrawerNavigation = {
  HomeNav: undefined;
  AccountNav: undefined;
  PaymentMethodNav: undefined;
  ContactUsNav: undefined;
  SettingsNav: undefined;
  AboutNav: undefined;
  HelpNav: undefined;
}

export type HomeNavigation = {
  Home: undefined;
  SendBlink: undefined;
  Packages: undefined;
  RequestBlink: undefined;
  Register: undefined;
  CompletedRequestBlink: undefined;
  DownloadBlink: undefined;
  ConfirmBlink: undefined;
  NotificationNav: undefined;
  HaveCode: undefined;
  ConfirmStandBy: undefined;
  CashMoney: undefined;
  UpCashMoney: undefined;
  DownCashMoney: undefined;
}

export type AccountNavigation = {
  Account: undefined;
};

export type NotificationNavigation = {
  Notification: undefined;
}
