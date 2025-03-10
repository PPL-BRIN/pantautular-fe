module.exports = {
    collectCoverage: true,
    collectCoverageFrom: [
      "app/**/*.{ts,tsx}",
      "!app/layout.tsx",
      "lib/**/*.{ts,tsx}",
      "!components/ui/**",
    ],
    preset: "ts-jest", // Untuk TypeScript
    testEnvironment: "jsdom",
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }], // Tambahin regex biar JSX/TSX bisa diproses
    },
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/app/$1",
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      "^@amcharts/amcharts5$": "<rootDir>/__mocks__/amcharts5.js",
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  };
  