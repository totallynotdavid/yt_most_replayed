async function waitForAdSkip(videoPage, maxWaitTime = 15000) {
  const startTime = Date.now()

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Check if the maximum waiting time has been exceeded
    if (Date.now() - startTime > maxWaitTime) {
      console.log(
        "Maximum wait time exceeded. Proceeding with non-skippable ad or no ad.",
      )
      break
    }

    try {
      const skipButton = await videoPage
        .$(".ytp-ad-skip-button", { timeout: 1000 })
        .catch(() => null)
      if (skipButton) {
        const isHidden = await skipButton.evaluate(
          (el) => el.offsetParent === null,
        )
        const isDisabled = await skipButton.evaluate((el) => el.disabled)
        if (!isHidden && !isDisabled) {
          console.log("Ad is skippable. Skipping...")
          await skipButton.click()
          break
        }
      }
      // Shorter wait before re-checking for the skip button
      await videoPage.waitForTimeout(500)
    } catch (error) {
      console.error("Error during ad skip check:", error)
      break
    }
  }
}

async function checkForAds(page) {
  const adElement = await page.$(".ytp-ad-player-overlay")
  return adElement !== null
}

module.exports = {
  waitForAdSkip,
  checkForAds,
}
