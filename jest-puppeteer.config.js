const server = process.env.START
  ? { command: "npm run start", port: 3000 }
  : undefined;

module.exports = {
  launch: {
    headless: process.env.BROWSER ? false : true,
    slowMo: process.env.BROWSER ? 100 : 0,
  },
  server,
};
