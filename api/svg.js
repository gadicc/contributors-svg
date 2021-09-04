const fetch = require("node-fetch");

const TEST_MODE = !!process.env.TEST_MODE;

const SKIP = ["semantic-release-bot", "renovate-bot"];

async function dataUrl(url) {
  const res = await fetch(url);
  if (res.ok) {
    const buffer = await res.buffer();
    return (
      "data:" +
      res.headers.get("content-type") +
      ";base64," +
      buffer.toString("base64")
    );
  }
}

module.exports = async (req, res) => {
  const user = req.query.user;
  const repo = req.query.repo;
  const dataUri = req.query.dataUri === "false" ? false : true;

  const url = `https://github.com/${user}/${repo}/graphs/contributors-data`;

  let data;
  if (TEST_MODE) {
    data = require("../test.js");
  } else {
    const dataRes = await fetch(url, {
      headers: {
        accept: "application/json",
      },
    });
    data = await dataRes.json();
  }

  // By default GitHub contrib graph gives avatars with s=60
  const SIZE = req.query.size
    ? req.query.size > 460
      ? 460
      : req.query.size
    : 60;

  const RADIUS = SIZE / 2;
  const IMG_W = RADIUS * 2;
  const IMG_H = RADIUS * 2;
  const MARGIN = 10;
  const MARGIN_X = MARGIN;
  const MARGIN_Y = MARGIN;
  const MAX_COLS = 10;
  const MAX_WIDTH = IMG_W * MAX_COLS;

  let totalRows = 1;

  let x = 0;
  let y = 0;

  let innerSvg = "";

  data.sort((a, b) => b.total - a.total);

  for (let contrib of data) {
    const author = contrib.author;
    if (SKIP.includes(author.login)) continue;

    // https://avatars.githubusercontent.com/u/381978?s=60&amp;v=4
    const parsedAvatarUrl = author.avatar
      .replace(/&/g, "&amp;")
      .replace(/\?s=\d+/, `?s=${SIZE}`);
    const avatarUrl =
      TEST_MODE || !dataUri ? parsedAvatarUrl : await dataUrl(parsedAvatarUrl);

    innerSvg +=
      `  <a xlink:href="https://github.com/${author.login}" target="_blank" rel="nofollow" id="${author.login}">\n` +
      `    <clipPath id="cp-${author.login}">\n` +
      `      <circle r="${RADIUS}" cx="${x + RADIUS}" cy="${y + RADIUS}" />\n` +
      `    </clipPath>\n` +
      `    <image x="${x}" y="${y}" clip-path="url(#cp-${author.login})" width="${IMG_W}" height="${IMG_H}" xlink:href="${avatarUrl}" />  \n` +
      `    <title>${author.login} (${contrib.total})</title>\n` +
      `  </a>\n`;

    x += IMG_W + MARGIN_X;

    if (x > MAX_WIDTH) {
      x = 0;
      y += IMG_H + MARGIN_Y;
      totalRows++;
    }
  }

  const width = MAX_WIDTH + MARGIN_X * 2;
  const height = y;

  let svg =
    "<svg\n" +
    '  xmlns="http://www.w3.org/2000/svg"\n' +
    '  xmlns:xlink="http://www.w3.org/1999/xlink"\n' +
    `  width="${width}"\n` +
    `  height="${height}"\n` +
    ">\n" +
    "  <style>\n" +
    "  </style>\n";

  svg += innerSvg + "</svg>\n";

  res.setHeader("cache-control", "public, max-age=60");
  res.setHeader("content-type", "image/svg+xml; charset=utf-8");
  res.end(svg);
};
