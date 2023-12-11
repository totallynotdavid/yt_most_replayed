const puppeteer = require('puppeteer');

async function getMostReplayedParts(videoId) {
  const browserOptions = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };

  const browser = await puppeteer.launch(browserOptions);
  const page = await browser.newPage();
  await page.goto(`https://www.youtube.com/watch?v=${videoId}`);

  let data = await extractJSONData(page);
  if (!data) {
    data = await extractHeatMapData(page, videoId);
  }

  await browser.close();
  return data;
}

async function extractJSONData(page) {
  await page.waitForSelector('script', { timeout: 5000 }).catch(() => console.log('Timeout waiting for script tags'));

  try {
    return await page.evaluate(() => {
      const scripts = Array.from(document.scripts);
      for (let script of scripts) {
        if (script.textContent.includes('frameworkUpdates')) {
          const match = script.textContent.match(/{.*}/s);
          if (match) {
            const json = JSON.parse(match[0]);
            if (json.frameworkUpdates?.entityBatchUpdate?.mutations[0]?.payload?.macroMarkersListEntity?.markersList) {
              return json.frameworkUpdates.entityBatchUpdate.mutations[0].payload.macroMarkersListEntity.markersList;
            }
          }
        }
      }
      return null;
    });
  } catch (e) {
    console.error('Error in JSON extraction:', e);
    return null;
  }
}

async function extractHeatMapData(page, videoId) {
  try {
    await page.waitForSelector('.ytp-heat-map-svg', { timeout: 5000 });
    await page.waitForSelector('.ytp-progress-bar', { timeout: 5000 });

    const videoLength = await page.evaluate(() => {
      const progressBar = document.querySelector('.ytp-progress-bar');
      return progressBar.getAttribute('aria-valuemax');
    });

    const heatMapContainer = await page.$('.ytp-heat-map-svg');
    if (heatMapContainer) {
      const heatMapHTML = await page.evaluate(el => el.innerHTML, heatMapContainer);
      return processHeatMapData(heatMapHTML, videoLength);
    } else {
      console.log('No heat map container found for video:', videoId);
      return null;
    }
  } catch (e) {
    console.error('Error in HeatMap extraction:', e);
    return null;
  }
}

function processHeatMapData(heatMapHTML, videoLength) {
  const pathRegex = /<path class="ytp-heat-map-path" d="([^"]+)"/;
  const match = heatMapHTML.match(pathRegex);
  if (!match) {
    console.error('No path data found in heatmap HTML.');
    return null;
  }

  const pathData = match[1];
  const segments = parsePathData(pathData);

  const replayedParts = analyzeSegments(segments, videoLength);
  return replayedParts;
}

function parsePathData(pathData) {
  const commands = pathData.split(' ');
  const segments = [];

  for (let i = 0; i < commands.length; i += 3) {
    if (commands[i] === 'M' || commands[i] === 'C') {
      const x = parseFloat(commands[i + 1]);
      const y = parseFloat(commands[i + 2]);
      segments.push({ x, y });
    }
  }
  return segments;
}

function analyzeSegments(segments, videoLength) {
  const segmentDuration = videoLength / segments.length;

  const normalizedSegments = segments.map((segment, index) => {
    const normalizedIntensity = normalizeIntensity(segment.y);

    return {
      startMillis: index * segmentDuration,
      durationMillis: segmentDuration,
      intensityScoreNormalized: normalizedIntensity
    };
  });

  const validSegments = normalizedSegments.filter(segment => 
    !isNaN(segment.intensityScoreNormalized) && segment.intensityScoreNormalized !== undefined
  );

  return {
    markerType: 'MARKER_TYPE_HEATMAP',
    markers: validSegments
  };
}

function normalizeIntensity(yValue) {
  const maxYValue = 999;
  if (isNaN(yValue) || yValue === undefined) {
    return 0;
  }

  const invertedY = maxYValue - yValue;

  const normalizedIntensity = invertedY / maxYValue;
  return normalizedIntensity;
}

module.exports = {
  getMostReplayedParts
};
