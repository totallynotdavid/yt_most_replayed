const puppeteer = require("puppeteer")
const { checkForAds, waitForAdSkip } = require("./youtube_ads")
const { extractYoutubeJsonData } = require("./youtubeJsonExtractor")
const { extractYoutubeSvgHeatmap } = require("./youtubeSvgHeatmapExtractor")
const { getTopReplayedParts } = require("./youtubeHeatmapSorter")

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

  let data = await extractYoutubeJsonData(page)
  let videoLength = null
  if (!data) {
    const result = await extractYoutubeSvgHeatmap(page, videoId)
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
