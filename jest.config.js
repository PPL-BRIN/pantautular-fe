module.exports = {
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
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
