import "@testing-library/jest-native/extend-expect";

jest.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en" }],
}));
