const nextConfig = require("eslint-config-next/core-web-vitals");

module.exports = [
  ...nextConfig,
  {
    ignores: ["node_modules", ".next", "chakra-react-shim.js", "chakra-react-shim.mjs"],
  },
];
