const fetch = require('node-fetch');

const RADIUS = 32;
const IMG_W = 64;
const IMG_H = 64;
const MARGIN_X = 10;
const MARGIN_Y = 10;
const MAX_WIDTH = 890;
const SKIP = [ "semantic-release-bot", "renovate-bot" ];

async function dataUrl(url) {
  const res = await fetch(url);
  if (res.ok) {
    const buffer = await res.buffer();
    return "data:" + res.headers.get("content-type") + ";base64,"
      + buffer.toString('base64');
  }
}

module.exports = async (req, res) => {
  const user = req.query.user;
  const repo = req.query.repo;
  const url = `https://github.com/${user}/${repo}/graphs/contributors-data`;

  const dataRes = await fetch(url, {
    "headers": {
      "accept": "application/json",
    },
  });
  
  const data = await dataRes.json();

  let svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="890" height="143">\n'
    + "  <style>\n"
    + "  </style>\n";
  
  let line = 0;
  let x = 0;
  let y = 0;
  data.sort((a,b) => b.total - a.total);
  for (let contrib of data) {
    const author = contrib.author;
    if (SKIP.includes(author.login))
      continue;
      
    //const avatarUrl = author.avatar.replace(/&/g,'&amp;');
    const avatarUrl = await dataUrl(author.avatar);
    
    svg += `  <a xlink:href="https://github.com/${author.login}" target="_blank" rel="nofollow sponsored" id="${author.login}">\n`
      + `    <clipPath id="circ-${author.login}">\n`
      + `      <circle r="32" cx="${x+RADIUS}" cy="${y+RADIUS}" />\n`
      + `    </clipPath>\n`
      + `    <image x="${x}" y="${y}" clip-path="url(#circ-${author.login})" width="${IMG_W}" height="${IMG_H}" xlink:href="${avatarUrl}" />  \n`
      + `    <title>${author.login} (${contrib.total})</title>\n`
      + `  </a>\n`;
    x += IMG_W + MARGIN_X;
  }
  
  svg += '</svg>\n';
  
  res.setHeader('cache-control', 'public, max-age=60');
  res.setHeader('content-type', 'image/svg+xml; charset=utf-8');
  res.end(svg);
  
};
