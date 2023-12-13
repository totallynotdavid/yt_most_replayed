const puppeteer = require("puppeteer")
const { checkForAds, waitForAdSkip } = require("./youtube_ads")
const { extractJSONData } = require("./json_extractor")
const { extractHeatMapData } = require("./heatmap_extractor")
const { getTopReplayedParts } = require("./sort_worker")

async function getMostReplayedParts(videoId, parts = 1) {
  const browserOptions = {
    headless: "new",
  }

  const browser = await puppeteer.launch(browserOptions)
  const page = await browser.newPage()
  await page.goto(`https://www.youtube.com/watch?v=${videoId}`)

  const adExists = await checkForAds(page)
  if (adExists) {
    await waitForAdSkip(page)
  }

  let data = await extractJSONData(page)
  let videoLength = null
  if (!data) {
    const result = await extractHeatMapData(page, videoId)
    data = result.heatMapData
    videoLength = result.videoLength
  }

  await browser.close()

  const replayedParts = await getTopReplayedParts(data, parts)
  return { replayedParts, videoLength }
}

module.exports = {
  getMostReplayedParts,
}
