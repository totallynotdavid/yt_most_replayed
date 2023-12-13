async function extractYoutubeJsonData(page) {
  await page
    .waitForSelector("script", { timeout: 5000 })
    .catch(() => console.log("Timeout waiting for script tags"))

  try {
    return await page.evaluate(() => {
      const scripts = Array.from(document.scripts)
      for (let script of scripts) {
        if (script.textContent.includes("frameworkUpdates")) {
          const match = script.textContent.match(/{.*}/s)
          if (match) {
            const json = JSON.parse(match[0])
            if (
              json.frameworkUpdates?.entityBatchUpdate?.mutations[0]?.payload
                ?.macroMarkersListEntity?.markersList
            ) {
              return json.frameworkUpdates.entityBatchUpdate.mutations[0]
                .payload.macroMarkersListEntity.markersList
            }
          }
        }
      }
      return null
    })
  } catch (e) {
    console.error("Error in JSON extraction:", e)
    return null
  }
}

module.exports = {
  extractYoutubeJsonData,
}
