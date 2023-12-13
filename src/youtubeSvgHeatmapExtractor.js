const { extractPointsFromPath } = require("./svgPathAnalysis")
const { processSVG } = require("./svg_processing")

async function extractYoutubeSvgHeatmap(
  page,
  videoId,
  retryCount = 0,
  maxRetries = 3,
) {
  try {
    await page.waitForSelector(".ytp-heat-map-svg", { timeout: 5000 })
    await page.waitForSelector(".ytp-progress-bar", { timeout: 5000 })

    const videoLength = await page.evaluate(() => {
      const progressBar = document.querySelector(".ytp-progress-bar")
      return progressBar.getAttribute("aria-valuemax")
    })

    const heatMapContainers = await page.$$(".ytp-heat-map-svg")
    if (heatMapContainers.length > 0) {
      let combinedHeatMapSVG = ""

      for (const container of heatMapContainers) {
        const heatMapSVG = await page.evaluate((el) => el.outerHTML, container)
        combinedHeatMapSVG += heatMapSVG
      }

      return {
        heatMapData: processHeatMapData(combinedHeatMapSVG, videoLength),
        videoLength: parseInt(videoLength, 10),
      }
    } else {
      console.log("No heat map container found for video:", videoId)
      return null
    }
  } catch (e) {
    if (retryCount < maxRetries) {
      console.log(`Retrying... Attempt ${retryCount + 1} of ${maxRetries}`)
      await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
      return extractYoutubeSvgHeatmap(page, videoId, retryCount + 1, maxRetries)
    } else {
      console.error(
        "Maximum retries reached. Unable to find required selectors:",
        e,
      )
      return null
    }
  }
}

function processHeatMapData(heatMapHTML, videoLength) {
  const pathData = processSVG(heatMapHTML)
  const segments = extractPointsFromPath(pathData)
  const replayedParts = analyzeSegments(segments, videoLength)
  return replayedParts
}

function analyzeSegments(segments, videoLength) {
  const segmentDuration = videoLength / segments.length
  const validSegments = segments.filter(
    (segment) => !isNaN(segment.y) && segment.y !== undefined,
  )
  const maxYValue = validSegments.reduce(
    (max, segment) => Math.max(max, segment.y),
    validSegments[0].y,
  )

  const normalizedSegments = validSegments.map((segment, index) => {
    const normalizedIntensity = normalizeIntensity(segment.y, maxYValue)
    return {
      startMillis: index * segmentDuration * 1000,
      durationMillis: segmentDuration * 1000,
      intensityScoreNormalized: normalizedIntensity,
    }
  })

  return {
    markerType: "MARKER_TYPE_HEATMAP",
    markers: normalizedSegments,
  }
}

function normalizeIntensity(yValue, maxYValue) {
  if (isNaN(yValue) || yValue === undefined) {
    return 0
  }

  const normalizedIntensity = yValue / maxYValue
  return normalizedIntensity
}

module.exports = {
  extractYoutubeSvgHeatmap,
}
