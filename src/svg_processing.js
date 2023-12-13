/*
 * This script joins to SVG paths and returns ONE cleaned path data string.
 * It is written to work with paths obtained from YouTube heatmaps.
 * Writing this script was a nigthmare, but it works. I'm not going to touch it again. Ever.
 * Oh, hello there future me. I see you're trying to fix something. Good luck. REALLY. You'll need it.
 */

function pathToCoordinates(pathData) {
  const commandRegex = /([a-zA-Z])([^a-zA-Z]*)/g
  let match
  let coordinates = []

  while ((match = commandRegex.exec(pathData)) !== null) {
    const args = match[2]
      .trim()
      .split(/[\s,]+/)
      .map(Number)

    for (let i = 0; i < args.length; i += 2) {
      coordinates.push({ x: args[i], y: args[i + 1] })
    }
  }

  return coordinates
}

function convertCoordinatesToPathData(coordinates) {
  let pathData = ""

  if (coordinates.length > 0) {
    pathData += `M ${coordinates[0].x},${coordinates[0].y} `
  }

  for (let i = 1; i < coordinates.length; i++) {
    pathData += `L ${coordinates[i].x},${coordinates[i].y} `
  }

  return pathData.trim()
}

function adjustPathCoordinates(paths) {
  let adjustedPaths = []
  let lastX = 0,
    lastY = 0

  paths.forEach((path) => {
    let coordinates = pathToCoordinates(path)

    let deltaX = lastX - coordinates[0].x
    let deltaY = lastY - coordinates[0].y

    let adjustedPath = coordinates.map((coord) => {
      return { x: coord.x + deltaX, y: coord.y + deltaY }
    })

    lastX = adjustedPath[adjustedPath.length - 1].x
    lastY = adjustedPath[adjustedPath.length - 1].y

    adjustedPaths.push(convertCoordinatesToPathData(adjustedPath))
  })

  return adjustedPaths
}

function removeArtifacts(pathData) {
  const jointRegex = /L (\d+,\d+) M \1/g

  const pathDataArray = pathData.split(" ")
  let removalIndices = []

  // Find indices of the joint parts
  let match
  while ((match = jointRegex.exec(pathData)) !== null) {
    // Calculate the number of elements before the joint in the array
    const elementsBefore = pathData.substring(0, match.index).split(" ").length
    const jointIndexInArray = elementsBefore - 1 // Subtract 1 as split includes the joint element itself

    // Mark indices for removal (-6 to -1, and +1 to +9 relative to the joint)
    for (let i = -6; i <= -1; i++) {
      removalIndices.push(jointIndexInArray + i)
    }
    for (let i = 1; i <= 9; i++) {
      removalIndices.push(jointIndexInArray + i)
    }
  }

  // Remove marked indices in reverse order to avoid index shifting
  removalIndices.sort((a, b) => b - a)
  removalIndices.forEach((index) => {
    if (index >= 0 && index < pathDataArray.length) {
      pathDataArray.splice(index, 1)
    }
  })

  return pathDataArray.join(" ")
}

function processSVG(fileName) {
  const svgData = fileName
  const pathRegex = /<path[^>]*d="([^"]*)"/g
  let match
  let paths = []

  while ((match = pathRegex.exec(svgData)) !== null) {
    paths.push(match[1])
  }

  const adjustedPaths = adjustPathCoordinates(paths)
  const combinedPath = adjustedPaths.join(" ")
  const cleanedPath = removeArtifacts(combinedPath)
  return cleanedPath
}

module.exports = {
  processSVG,
}
