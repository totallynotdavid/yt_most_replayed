function extractPointsFromPath(pathData) {
  const commandDataPairs = pathData.match(/[a-zA-Z][^a-zA-Z]*/g)
  let maxY = 0
  const points = []
  let currentX = 0,
    currentY = 0

  // First pass: Calculate maxY for M and L commands
  for (const pair of commandDataPairs) {
    const command = pair[0]
    const dataNumbers = pair
      .substring(1)
      .trim()
      .split(/[\s,]+/)
      .map(parseFloat)

    // Skip if no numbers are present
    if (dataNumbers.length === 0) continue

    if (command === "M" || command === "L") {
      for (let i = 1; i < dataNumbers.length; i += 2) {
        maxY = Math.max(maxY, dataNumbers[i])
      }
    }
  }

  // Second pass: Calculate points with inverted Y
  for (const pair of commandDataPairs) {
    const command = pair[0]
    const dataNumbers = pair
      .substring(1)
      .trim()
      .split(/[\s,]+/)
      .map(parseFloat)

    // Skip if no numbers are present
    if (dataNumbers.length === 0) continue

    switch (command) {
      case "M":
      case "L":
        currentX = dataNumbers[0]
        currentY = maxY - dataNumbers[1]
        points.push({ x: currentX, y: currentY })
        break
    }
  }

  return points
}

module.exports = {
  extractPointsFromPath,
}
