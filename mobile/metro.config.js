const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// ═══════════════════════════════════════════════
// Configuración robusta para desarrollo offline
// ═══════════════════════════════════════════════

// Middleware mejorado para manejar errores de red
config.server = {
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Responder rápidamente a health checks
      if (req.url === "/status") {
        res.writeHead(200);
        res.end("OK");
        return;
      }
      
      // Manejar timeouts gracefully
      req.setTimeout(180000);
      res.setTimeout(180000);
      
      middleware(req, res, next);
    };
  },
};

// Configuración del resolver
config.resolver = {
  ...config.resolver,
  // Deshabilitar symlinks que causan problemas
  unstable_enableSymlinks: false,
  
  // Evitar conflictos de módulos duplicados
  blockList: [
    /node_modules\/.*\/node_modules\/react-native\//,
    /node_modules\/.*\/node_modules\/expo\//,
  ],
};

// Watchman para performance
config.watchman = {
  enabled: true,
  // Deshabilitar si causa problemas
  useWatchman: process.env.CI !== "true",
};

// Transformer mejorado
let expoRouterTransformer = null;
try {
  expoRouterTransformer = require.resolve("expo-router/build/metro/transformer");
} catch (error) {
  // expo-router no es requerido en esta app de navegación react-native.
}

config.transformer = {
  ...config.transformer,
  // Deshabilitar doctores de compatibilidad
  allowOptionalDependencies: true,
  ...(expoRouterTransformer ? { babelTransformerPath: expoRouterTransformer } : {}),
};

// Configuración de caché
// Logging mejorado
config.projectRoot = __dirname;

module.exports = config;
