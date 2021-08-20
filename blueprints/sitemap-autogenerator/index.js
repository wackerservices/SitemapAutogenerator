/* eslint-env node */
let acorn = require('acorn');

var ENV = require(process.cwd() + '/config/environment');
const fs = require('fs');

var baseURL, routerFound = false,
  fileData = '',
  routeArray = [];

const routerJsPath = 'app/router.js',
  routerTsPath = 'app/router.ts',
  currentDate = new Date();
const header = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

let nestedPath = [];
let ignoredPathObject = {};

if (ENV()["sitemap-autogenerator"] !== undefined && ENV()["sitemap-autogenerator"].ignoreTheseRoutes !== undefined) { // Remove all / from ignoreTheseRoutes
  ignoredPathObject = ENV()["sitemap-autogenerator"].ignoreTheseRoutes;
  Object.keys(ignoredPathObject).map(function (key) {
    if (key.indexOf('/') > -1) {
      let newKey = key.replace(/\//g, "");
      ignoredPathObject[newKey] = ignoredPathObject[key];
      delete ignoredPathObject[key];
    }
  });
}

module.exports = {
  description: '',
  triggerSitemapBuilder: function (theURL) {
    baseURL = theURL;

    fs.access(routerJsPath, fs.constants.R_OK, (jsRouterErr) => {
      if (!jsRouterErr) {
        processRouterFile(routerJsPath);
      } else {
        fs.access(routerTsPath, fs.constants.R_OK, (tsRouterErr) => {
          if (!tsRouterErr) {
            processRouterFile(routerTsPath);
          } else {
            console.log(`${routerJsPath} is not readable : ${jsRouterErr}`);
            console.log(`${routerTsPath} is not readable : ${tsRouterErr}`);
          }
        });
      }
    });
  },
};

function processRouterFile(routerPath) {
  fs.readFile(routerPath, 'utf8', function (err, data) {
    if (err) return console.log('Encountered the following error:', err);

    let parseResults = acorn.parse(data, {
      "sourceType": "module"
    });

    let arrayToMap = parseResults.body;
    arrayToMap.map(function (item) { // Look for the Router object in the file -> i.e. Router.map(function()...
      if (item.type === "ExpressionStatement" && item.expression.callee.object.name === "Router") {
        routerFound = true;
        let innerArrayToMap = item.expression.arguments[0].body.body;
        innerArrayToMap.map(function (item) { // Look for each this.route in Router.map
          isSingleOrNestedRoute(item.expression.arguments);
        });
      }
    });

    if (ENV()["sitemap-autogenerator"] !== undefined && Array.isArray(ENV()["sitemap-autogenerator"].pathsOutsideEmberApp)) {
      ENV()["sitemap-autogenerator"].pathsOutsideEmberApp.forEach(function(path){
        routeArray.push({
          completeRoute: '',
          path: path
        });
      });
    }

    if (routerFound === false) console.log('!!! sitemap-autogenerator could not find a Router object in your ember router.js file, process aborted!');
    else {
      // console.log(routeArray);
      writeToFile();
    }
  });
}

function processPath(path, message) {
  if (!path.match(/\*/g) && !path.match(/\/\:/)) { // Exclude any route with ':' in the path (for route variable) and any route with '*' in the path
    // console.log(message, path);
    routeArray.push({
      completeRoute: combineAllPaths(nestedPath),
      path: checkForQuoteType(path)
    });
  }
}

function isSingleOrNestedRoute(itemExpressionArgument) {
  if (itemExpressionArgument.length !== undefined) {
    if (itemExpressionArgument.length === 1) {
      processPath(itemExpressionArgument[0].value, '*** It\'s a simple route, no nesting, and no specified path ->');
    } else if (itemExpressionArgument.length === 2 && itemExpressionArgument[1].properties !== undefined && itemExpressionArgument[1].properties[0].key.name === "path") {
      processPath(itemExpressionArgument[1].properties[0].value.value, '*** It\'s a simple route with a specified path ->')
    } else {
      if (itemExpressionArgument[1].type === "FunctionExpression") {
        nestedPath.push(itemExpressionArgument[0].value);
        // console.log('*** +++ Found a nested function with nested path name ->', itemExpressionArgument[0].value);
        // console.log('nestedPath:', nestedPath);
        let itemExpressionArgumentToRecurse = itemExpressionArgument[1].body.body;
        itemExpressionArgumentToRecurse.map(function (item, index) {
          isSingleOrNestedRoute(item);
          if (index === itemExpressionArgumentToRecurse.length - 1) {
            nestedPath.pop();
            // console.log('nestedPath:', nestedPath);
          }
        });
      }
    }
  } else { // Necessary for recursed routes
    if (itemExpressionArgument.expression.arguments.length === 1) {
      processPath(itemExpressionArgument.expression.arguments[0].value, '  *** It\'s a simple route, no nesting, and no specified path ->');
    } else if (itemExpressionArgument.expression.arguments.length === 2 && itemExpressionArgument.expression.arguments[1].properties !== undefined && itemExpressionArgument.expression.arguments[1].properties[0].key.name === "path") {
      // console.log('!!!', itemExpressionArgument.expression.arguments[1].properties[0].value.value);
      processPath(itemExpressionArgument.expression.arguments[1].properties[0].value.value, '  *** It\'s a simple route with a specified path ->');
    } else {
      if (itemExpressionArgument.expression.arguments[1].type === "FunctionExpression") {
        nestedPath.push(itemExpressionArgument.expression.arguments[0].value);
        // console.log('*** +++ Found a nested function with nested path name ->', itemExpressionArgument.expression.arguments[0].value);
        // console.log('nestedPath:', nestedPath);
        let itemExpressionArgumentToRecurse = itemExpressionArgument.expression.arguments[1].body.body;
        itemExpressionArgumentToRecurse.map(function (item, index) {
          isSingleOrNestedRoute(item);
          if (index === itemExpressionArgumentToRecurse.length - 1) {
            nestedPath.pop();
            // console.log('nestedPath:', nestedPath);
          }
        });
      }
    }
  }
}

function combineAllPaths(pathArray) {
  let path = "";
  pathArray.map(function (x, i) {
    if (i == 0) path += x;
    else path += "/" + x;
  });
  return path;
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

    if (ENV()["sitemap-autogenerator"] === undefined || ENV()["sitemap-autogenerator"].ignoreTheseRoutes === undefined || ignoredPathObject[currentPath] !== true || ignoredPathObject[currentPath] !== true) {
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
  // console.log('DATA:', data)
  if (data !== undefined && data.includes("'" || data.includes('"'))) {
    if (data.includes("'")) return data.match(/\'.*\'/)[0].replace(/'|"/g, "");
    else return data.match(/\".*\"/)[0].replace(/'|"/g, "");
  } else return data;
}
