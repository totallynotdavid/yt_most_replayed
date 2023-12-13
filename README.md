# YouTube Heat Map Data Extraction

This project uses Puppeteer to obtain the most replayed sections in a YouTube video by analyzing the heat map and JSON data. It's effective but not foolproof, especially for longer videos (+40 min) where accuracy may decline.

> ⚠️ Help is needed to improve the accuracy of the segments. This is a rudimentary implementation.

Some of the features are:

- Extract YouTube video heat map data.
- Identify frequently replayed sections.
- Manage ads during data extraction.

To install this package, just run>

```bash
pnpm install yt_most_replayed
```

## Usage

`getMostReplayedParts(videoId, parts)` extracts the most replayed parts of a YouTube video.

- `videoId`: The YouTube video's unique ID.
- `parts`: Number of top replayed parts to return.

Example:

```javascript
const { getMostReplayedParts } = require("yt_most_replayed")

getMostReplayedParts("dQw4w9WgXcQ", 3)
  .then((data) => console.log(data))
  .catch((error) => console.error(error))
```

`extractYoutubeSvgHeatmap(page, videoId, retryCount, maxRetries)` is an internal function to extract heat map data from a YouTube page.

`processHeatMapData(heatMapHTML, videoLength)` processes the extracted heat map HTML and video length to determine replayed parts.

`analyzeSegments(segments, videoLength)` analyzes segments extracted from the heat map for replay intensity.

`extractYoutubeJsonData(page)` extracts JSON data from a YouTube video page for additional insights.

## Contributing

Contributions are welcome. Please submit pull requests with improvements or bug fixes.

## License

This project is open-sourced under the MIT License.

---

**Note**: This project is not affiliated with or endorsed by YouTube. It is intended for educational and research purposes only. Use responsibly and adhere to YouTube's Terms of Service.
