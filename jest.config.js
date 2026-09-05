module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@notifee/react-native$': '<rootDir>/src/__mocks__/@notifee/react-native.ts',
    '^expo-notifications$': '<rootDir>/src/__mocks__/expo-notifications.ts',
    '^react-native$': '<rootDir>/src/__mocks__/react-native.ts',
    '^react-native-android-widget$': '<rootDir>/src/__mocks__/react-native-android-widget.ts',
    '(\\.{1,2}/)+services/widgetSyncService': '<rootDir>/src/__mocks__/widgetSyncService.ts',
  },
};

