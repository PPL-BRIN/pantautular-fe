<<<<<<< HEAD
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
=======
module.exports = {
  preset: "ts-jest", // Untuk TypeScript
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }], // Tambahin regex biar JSX/TSX bisa diproses
  },
  "transformIgnorePatterns": [
    "node_modules/(?!@amcharts|d3-|internmap)"
  ],
  moduleNameMapper: {
    // "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    // "@amcharts/amcharts5$": "<rootDir>/__mocks__/@amcharts/amcharts5.js",
    // "@amcharts/amcharts5/map$": "<rootDir>/__mocks__/@amcharts/amcharts5/map.js",
    // '^@/components/(.*)$': '<rootDir>/components/$1'
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/app/$1",
>>>>>>> 98e445727dc389488c686ec0e24731deb434ea42
    "^@amcharts/amcharts5$": "<rootDir>/__mocks__/amcharts5.js",
    "^@amcharts/amcharts5/map$": "<rootDir>/__mocks__/amcharts5-map.js",
    "^@amcharts/amcharts5/themes/Animated$": "<rootDir>/__mocks__/amcharts5-themes-Animated.js",
    "^@amcharts/amcharts5-geodata/indonesiaLow$": "<rootDir>/__mocks__/amcharts5-geodata-indonesiaLow.js"
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
<<<<<<< HEAD

module.exports = createJestConfig(customJestConfig);
=======
>>>>>>> 98e445727dc389488c686ec0e24731deb434ea42
