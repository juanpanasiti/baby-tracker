export const Platform = {
  OS: 'android',
  select: (obj: any) => obj.android || obj.default,
};

export const Vibration = {
  vibrate: jest.fn(),
  cancel: jest.fn(),
};

export const AppState = {
  addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  currentState: 'active',
};

export const StyleSheet = {
  create: (styles: any) => styles,
};

export default {
  Platform,
  Vibration,
  AppState,
  StyleSheet,
};
