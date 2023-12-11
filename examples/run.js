const { getMostReplayedParts } = require('../src/index');

async function main(videoId) {
  const mostReplayed = await getMostReplayedParts(videoId);
  console.log(mostReplayed);
  return mostReplayed;
}

async function runTests() {
  await main('RVx9KmrMiRM')
  await main('76sNmqMzUuI')
}

runTests();