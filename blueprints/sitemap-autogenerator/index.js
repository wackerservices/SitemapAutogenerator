/* eslint-env node */
var ENV = require(process.cwd() + '/config/environment');

const fs = require('fs');

var baseURL;

const pathForRouterJS = 'app/router.js';

var routeArray = [];
var fileData = '';
const currentDate = new Date();

const header = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

module.exports = {
  description: '',
  triggerSitemapBuilder: function (theURL) {
    baseURL = theURL;
    fs.readFile(pathForRouterJS, 'utf8', function (err, data) {
      if (err) return console.log('Encountered the following error:', err);

      let splitBy = /Router.map\(\s*function\s*\(\)\s*\{/; // Provision for variations in spacing for this line
      data = data.split(splitBy)[1]; // Split file text into code lines by 'Router.map', resulting in two code chunks --> choose the chunk after 'Router.map'

      splitDataIntoArrayOfRoutes(data);
    });
  },

  // Is this needed anymore?
  locals: function (options) {
    fs.readFile(pathForRouterJS, 'utf8', function (err, data) {
      if (err) return console.log('Encountered the following error:', err);

      let splitBy = /Router.map\(\s*function\s*\(\)\s*\{/; // Provision for variations in spacing for this line
      data = data.split(splitBy)[1]; // Split file text into code lines by 'Router.map', resulting in two code chunks --> choose the chunk after 'Router.map'

      splitDataIntoArrayOfRoutes(data);
    });

    return options;
  },

  afterInstall(options) {}
};

function splitDataIntoArrayOfRoutes(data) {
  let testRE = data.match(/this.route*?[\s\S]*?\;|  [\w\s]+\w*\}\)\;\w*[\s\S]*? | \}\)\;/g);

  let nestedPath = [];

  testRE.map(function (x, i) { // x is current value, i is index, optional third parameter is the enter array
    if (!testRE[i].match(/\*/g) && !testRE[i].match(/\/\:/)) { // Exclude any route with ':' in the path (for route variable) and any route with '*' in the path
      console.log(testRE[i]);

      if (testRE[i].match(/\s*function\s*\(\)\s*\{/)) {
        nestedPath.push(checkForQuoteType(testRE[i]));
        console.log('*** ', nestedPath);
        let routeAfterNewNest = testRE[i].split(/\s*function\s*\(\)\s*\{/);
        routeArray.push({
          completeRoute: combineAllPaths(nestedPath),
          path: parseRouteName(testRE[i]),
        });
        console.log(routeAfterNewNest[1]);
      } else if (!testRE[i].match(/path\:/) && testRE[i].match(/\s*\}\)\;\s*/)) { // Remove nestedPath from array if end of code block
        nestedPath.pop();
        console.log('--- ', nestedPath);
      } else {
        routeArray.push({
          completeRoute: combineAllPaths(nestedPath),
          path: parseRouteName(testRE[i]),
        });
      }
    }
  });

  console.log(routeArray);
  writeToFile();
}

// New code on 10/11/2018
function combineAllPaths(pathArray) {
  let path = "";
  pathArray.map(function (x, i) {
    if (i == 0) path += x;
    else path += "/" + x;
  });
  return path;
}

function parseRouteName(data) {
  if ((data.match(/function/)) || (data.match(/path/))) { // If there's the word function, get string after ','
    return checkForQuoteType(data.split(',')[1]); // Check for " or ' quote type
  } else { // If there's no 'function' or 'path'
    return checkForQuoteType(data);
  }
}

function writeToFile() {
  let changeFrequency, priority, showLog; // Look for custom values for 'changeFrequency' and 'defaultPriorityValue' in environment.js
  if (ENV()["sitemap-autogenerator"] !== undefined) { // Check to see if user has created ENV "sitemap-autogenerator" in environment.js
    if (ENV()["sitemap-autogenerator"].changeFrequency !== undefined) changeFrequency = ENV()["sitemap-autogenerator"].changeFrequency;
    else changeFrequency = "daily";
    if (ENV()["sitemap-autogenerator"].defaultPriorityValue !== undefined) priority = ENV()["sitemap-autogenerator"].defaultPriorityValue;
    else priority = "0.5";
    if (ENV()["sitemap-autogenerator"].showLog !== undefined && ENV()["sitemap-autogenerator"].showLog === true) showLog = true;
    else showLog = false;
  } else {
    console.log("\n! It looks like sitemap-autogenerator is installed but not properly configured. A default sitemap.xml will be created.\n! Please refer to the documentation regarding adding 'sitemap-autogenerator' to your ENV in environment.js file: https://www.npmjs.com/package/sitemap-autogenerator");
    changeFrequency = "daily";
    priority = "0.5";
    showLog = false;
  }

  routeArray.map(function (x, i) {
    if (i == 0) fileData += header; // Write the header

    var regex = /\//g;
    let currentPath = routeArray[i].path;
    let currentPriority = priority;

    currentPath = currentPath.replace(regex, '');
    if (ENV()["sitemap-autogenerator"] === undefined || ENV()["sitemap-autogenerator"].ignoreTheseRoutes === undefined || ENV()["sitemap-autogenerator"].ignoreTheseRoutes[currentPath] === undefined || ENV()["sitemap-autogenerator"].ignoreTheseRoutes[currentPath] !== true) {
      let isIgnored = false;
      fileData += ('\n  <url>\n    <loc>');
      writeToFileData(i, showLog, isIgnored);

      if (ENV()["sitemap-autogenerator"] !== undefined && ENV()["sitemap-autogenerator"].customPriority !== undefined && ENV()["sitemap-autogenerator"].customPriority[currentPath] !== undefined) currentPriority = ENV()["sitemap-autogenerator"].customPriority[currentPath];

      fileData += ('</loc>\n    <lastmod>' + formatDate() + '</lastmod>\n    <changefreq>' + changeFrequency + '</changefreq>\n    <priority>' + currentPriority + '</priority>\n  </url>');
    } else {
      let isIgnored = true;
      writeToFileData(i, showLog, isIgnored);
    }
  });
  fileData += ('\n</urlset>');

  fs.writeFile("dist/sitemap.xml", fileData, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("\nA new version of sitemap.xml was successfully saved\n");
  });
}

function writeToFileData(i, showLog, isIgnored) {
  let isIgnoredMessage = '** Ignored path:';
  let pathString = baseURL;
  if (routeArray[i].completeRoute !== "") {
    let routeString;
    if (routeArray[i].completeRoute.charAt(0) === "/") routeString = routeArray[i].completeRoute.substr(1);
    else routeString = routeArray[i].completeRoute;
    pathString += '/' + routeString;
  }
  if (routeArray[i].path !== "" && routeArray[i] !== "/") {
    let cleanedPath;
    if (routeArray[i].path.charAt(0) === "/") cleanedPath = routeArray[i].path.substr(1);
    else cleanedPath = routeArray[i].path;
    pathString += "/" + cleanedPath;
  }
  if (isIgnored === false) fileData += (pathString);
  if (showLog === true && isIgnored === false) console.log(pathString);
  else if (showLog === true && isIgnored === true) console.log(isIgnoredMessage, pathString);
}

function formatDate() {
  let date, year, month, day;
  day = currentDate.getDate(), month = currentDate.getMonth() + 1, year = currentDate.getFullYear();
  if (day < 10) day = '0' + day;
  if (month < 10) month = '0' + month;
  date = year + '-' + month + '-' + day;
  return date;
}

function checkForQuoteType(data) {
  if (data.includes("'")) return data.match(/\'.*\'/)[0].replace(/'|"/g, "");
  else return data.match(/\".*\"/)[0].replace(/'|"/g, "");
}
