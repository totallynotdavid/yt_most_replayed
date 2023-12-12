function extractPointsFromPath(pathData) {
  const commandDataPairs = pathData.match(/[a-zA-Z][^a-zA-Z]*/g);
  let maxY = 0;
  const points = [];
  let currentX = 0, currentY = 0;

  // First pass: Calculate maxY
  for (const pair of commandDataPairs) {
    const command = pair[0];
    const dataNumbers = pair.substring(1).trim().split(/[\s,]+/).map(parseFloat);

    if (command === 'C') {
      maxY = Math.max(maxY, dataNumbers[1], dataNumbers[3], dataNumbers[5]);
    } else if (command === 'M') {
      maxY = Math.max(maxY, dataNumbers[1]);
    }
  }

  // Second pass: Calculate points with inverted Y
  for (const pair of commandDataPairs) {
    const command = pair[0];
    const dataNumbers = pair.substring(1).trim().split(/[\s,]+/).map(parseFloat);

    switch (command) {
      case 'M':
        currentX = dataNumbers[0];
        currentY = maxY - dataNumbers[1];
        points.push({ x: currentX, y: currentY });
        break;
      case 'C':
        currentX = dataNumbers[4];
        currentY = maxY - dataNumbers[5];
        points.push({ x: currentX, y: currentY });
        break;
    }
  }

  return points;
}

module.exports = {
  extractPointsFromPath
};