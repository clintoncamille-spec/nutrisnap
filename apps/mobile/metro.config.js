const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo (pnpm) support: watch the workspace root so changes to
// packages/shared and packages/config are picked up. Symlink handling is
// already on by default in this Expo SDK's Metro config, so it's not
// re-declared here.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// packages/shared carries its own react/@types/react devDependency purely
// so it can be typechecked in isolation — force Metro to always bundle
// this app's own react/react-native instead, even for files reached
// through packages/shared, so the app never ends up with two React
// instances (which crashes with "Invalid hook call").
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
