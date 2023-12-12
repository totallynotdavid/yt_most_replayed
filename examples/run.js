const { getMostReplayedParts } = require('../src/index');

async function main(videoId) {
  const mostReplayed = await getMostReplayedParts(videoId);
  console.log(mostReplayed);
  return mostReplayed;
}

async function runTests() {
  // await main('RVx9KmrMiRM')
  // console.log('---')
  // await main('76sNmqMzUuI')
  // console.log('---')
  await main('BSRddWXSAA4')
}

runTests();