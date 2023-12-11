const puppeteer = require('puppeteer');

async function getMostReplayedParts(videoId) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`https://www.youtube.com/watch?v=${videoId}`, { waitUntil: 'networkidle2' });

  const data = await page.evaluate(() => {
    const scripts = Array.from(document.scripts);
    console.log(`Total script tags found: ${scripts.length}`);
    for (let script of scripts) {
      if (script.textContent.includes('frameworkUpdates')) {
        const match = script.textContent.match(/{.*}/s);
        if (match) {
          try {
            const json = JSON.parse(match[0]);
            if (json.frameworkUpdates?.entityBatchUpdate?.mutations[0]?.payload?.macroMarkersListEntity?.markersList) {
              return json;
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    }
    return null;
  });

  await browser.close();

  if (!data) {
    console.error('Unable to extract JSON data from YouTube page.');
    return null;
  }

  return processMostReplayedData(data);
}

function processMostReplayedData(data) {
  const mostReplayed = data.frameworkUpdates?.entityBatchUpdate?.mutations[0]?.payload?.macroMarkersListEntity?.markersList;

  return mostReplayed;
}

module.exports = {
  getMostReplayedParts
};
