const fs = require('fs');

function parseSVG(fileName) {
    return fs.readFileSync(fileName, 'utf8');
}

function pathToCoordinates(pathData) {
    const commandRegex = /([a-zA-Z])([^a-zA-Z]*)/g;
    let match;
    let coordinates = [];

    while ((match = commandRegex.exec(pathData)) !== null) {
        const args = match[2].trim().split(/[\s,]+/).map(Number);

        for (let i = 0; i < args.length; i += 2) {
            coordinates.push({ x: args[i], y: args[i + 1] });
        }
    }

    return coordinates;
}

function convertCoordinatesToPathData(coordinates) {
    let pathData = '';

    if (coordinates.length > 0) {
        pathData += `M ${coordinates[0].x},${coordinates[0].y} `;
    }

    for (let i = 1; i < coordinates.length; i++) {
        pathData += `L ${coordinates[i].x},${coordinates[i].y} `;
    }

    return pathData.trim();
}

function adjustPathCoordinates(paths) {
    let adjustedPaths = [];
    let lastX = 0, lastY = 0;

    paths.forEach(path => {
        let coordinates = pathToCoordinates(path);

        let deltaX = lastX - coordinates[0].x;
        let deltaY = lastY - coordinates[0].y;

        let adjustedPath = coordinates.map(coord => {
            return { x: coord.x + deltaX, y: coord.y + deltaY };
        });

        lastX = adjustedPath[adjustedPath.length - 1].x;
        lastY = adjustedPath[adjustedPath.length - 1].y;

        adjustedPaths.push(convertCoordinatesToPathData(adjustedPath));
    });

    return adjustedPaths;
}

function processSVG(fileName) {
    const svgData = parseSVG(fileName);
    const pathRegex = /<path[^>]*d="([^"]*)"/g;
    let match;
    let paths = [];

    while ((match = pathRegex.exec(svgData)) !== null) {
        paths.push(match[1]);
    }

    const adjustedPaths = adjustPathCoordinates(paths);
    const combinedPath = adjustedPaths.join(' ');
    const combinedSVG = combinedPath;
    return combinedSVG;
}

const result = processSVG('test.svg');
console.log(result)
