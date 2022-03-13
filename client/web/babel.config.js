module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: 'last 2 chrome versions and last 2 firefox versions',
        modules: false,
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [['babel-plugin-styled-components', { pure: true }]],
};
