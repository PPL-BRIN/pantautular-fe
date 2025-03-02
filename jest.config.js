const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { configFile: "./jest/babel.config.js" }],
  },
  transformIgnorePatterns: ["node_modules/(?!@amcharts)"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@amcharts/amcharts5$": "<rootDir>/__mocks__/amcharts5.js",
    "^@amcharts/amcharts5/map$": "<rootDir>/__mocks__/amcharts5-map.js",
    "^@amcharts/amcharts5-geodata/indonesiaLow$": "<rootDir>/__mocks__/amcharts5-geodata.js",
    "^@amcharts/amcharts5/themes/Animated$": "<rootDir>/__mocks__/amcharts5-themes-Animated.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};

module.exports = createJestConfig(customJestConfig);