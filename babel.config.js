module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@shared": "./shared",
            "@components": "./components",
            "@hooks":    "./hooks",
            // …etc
          },
        },
      ],
    ],
  };
};
