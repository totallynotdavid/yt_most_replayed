function getTopReplayedParts(data, parts) {
  if (!data || !data.markers) {
    return []
  }

  // Sort the markers by intensityScoreNormalized in descending order
  const sortedMarkers = data.markers.sort(
    (a, b) => b.intensityScoreNormalized - a.intensityScoreNormalized,
  )

  // Take the top 'parts' markers
  const topMarkers = sortedMarkers.slice(0, parts)

  // Format the output
  return topMarkers.map((marker, index) => ({
    position: index + 1,
    start: Math.round(Number(marker.startMillis) / 1000),
    end: Math.round(
      (Number(marker.startMillis) + Number(marker.durationMillis)) / 1000,
    ),
  }))
}

module.exports = {
  getTopReplayedParts,
}
