const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo (pnpm) support: watch the workspace root so changes to
// packages/shared and packages/config are picked up, and explicitly turn
// on Metro's symlink-aware resolver — required for pnpm's symlinked
// node_modules structure. Without this, Metro fails to resolve nested
// dependencies of a workspace-linked package (e.g. NativeWind's own
// react-native-css-interop dependency) even though plain Node resolves
// them fine, because Metro defaults this off unless told otherwise.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.unstable_enableSymlinks = true;

// packages/shared declares its own react (for standalone typechecking) and
// @tanstack/react-query (a real runtime dependency) — both get installed
// as separate copies under packages/shared/node_modules by pnpm's strict
// isolation. Left alone, Metro's normal resolution SUCCEEDS in finding
// each package from wherever it's requested — just to two different
// physical copies, producing two live module instances. For react that
// breaks hooks ("Invalid hook call"); for react-query it breaks context
// (QueryClientProvider and useQuery end up with different Context
// objects, throwing "No QueryClient set" even though a provider is
// mounted). `extraNodeModules` does NOT fix this — it's only consulted
// when normal resolution fails, and normal resolution isn't failing here.
// A `resolveRequest` override is required to force these to a single
// instance regardless of which file imports them.
const singleInstanceModules = {
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
  "@tanstack/react-query": path.resolve(
    projectRoot,
    "node_modules/@tanstack/react-query",
  ),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (Object.prototype.hasOwnProperty.call(singleInstanceModules, moduleName)) {
    return context.resolveRequest(
      context,
      singleInstanceModules[moduleName],
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
