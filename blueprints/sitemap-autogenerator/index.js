/* eslint-env node */
const fs = require('fs');

// const baseURL = 'https://typenex.com'; // Will need to have individual site root URL path
var baseURL;

const pathForRouterJS = 'app/router.js';

var routeArray = [];
var fileData = '';
const currentDate = new Date();

const header = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

module.exports = {
  description: '',
  triggerSitemapBuilder: function(theURL) {
    baseURL = theURL;
    fs.readFile(pathForRouterJS, 'utf8', function (err, data) {
      if (err) return console.log('Encountered the following error:', err);
    
      data = data.split('Router.map(function() {')[1]; // Split file text into code lines by 'Router.map', resulting in two code chunks --> choose the chunk after 'Router.map'
    
      splitDataIntoArrayOfRoutes(data);
      findEndOfCodeBlock(data);
    });
  },

  locals: function(options) {
    console.log('Hitting "locals" in index.js!');
    
    fs.readFile(pathForRouterJS, 'utf8', function (err, data) {
      if (err) return console.log('Encountered the following error:', err);
    
      data = data.split('Router.map(function() {')[1]; // Split file text into code lines by 'Router.map', resulting in two code chunks --> choose the chunk after 'Router.map'
    
      splitDataIntoArrayOfRoutes(data);
      findEndOfCodeBlock(data);
    });

    return options;
  },

  afterInstall(options) {
    console.log('Hitting "afterInstall" in index.js!');
  }
};

function splitDataIntoArrayOfRoutes(data) {
  let testRE = data.match(/this.route*?[\s\S]*?\;/g);
  testRE.map(function (x, i) { // x is current value, i is index, optional third parameter is the enter array
    if (!testRE[i].match(/\*/g) && !testRE[i].match(/\/\:/)) { // Exclude any route with ':' in the path (for route variable) and any route with '*' in the path
      routeArray.push({
        completeRoute: testRE[i],
        path: parseRouteName(testRE[i]),
        baseRoot: parseBaseRouteNames(testRE[i])
      });
    }
  });
}

function parseRouteName(data) {
  if ((data.match(/function/)) || (data.match(/path/))) { // If there's the word function, get string after ','  
    return checkForQuoteType(data.split(',')[1]); // Check for " or ' quote type
  } else { // If there's no 'function' or 'path'  
    return checkForQuoteType(data);
  }
}

function parseBaseRouteNames(data) {
  if (data.match(/function/)) { // If there's the word function in the route, add route name as baseRoot
    return checkForQuoteType(data.split(',')[0]);
  }
}

function findEndOfCodeBlock(data) {
  let testRE = data.match(/  [\w\s]+\w*\}\)\;\w*[\s\S]*?\{/g);
  if (testRE != null) {
    testRE.map(function (x, i) {
      let matchCount = (testRE[i].match(/\}\)\;/g) || []).length; // Detects how many many there are of '});'
      if (matchCount == 1) findPreviousBaseRoot(checkForQuoteType(testRE[i])); // Check for " or ' quote type
      else if (matchCount > 1) findPreviousBaseRootIfDoublyNestedOrMore(checkForQuoteType(testRE[i])); // Check for " or ' quote type); --> GO HERE FOR MORE THAN ONE MATCH!
    });
  }
  writeToFile();
}

function findUndefinedBeforeCodeBlock(currentRoot) { // Go back in reverse order until we find the next base route prior to this
  let currentIndex, baseRoot, baseRootIndex;
  routeArray.find((n, i) => { // Find currentIndex
    if (n.baseRoot == currentRoot) {
      currentIndex = i;
    }
  });
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (routeArray[i].baseRoot == undefined) { // Gets to first undefined before nested function
      findPreviousNestedBaseRootName(i, currentIndex, baseRoot, baseRootIndex, currentRoot);
      break;
    }
  };
}

function findPreviousNestedBaseRootName(currentIndex, previousCurrentIndex, previousBaseRoot, previousBaseRootIndex, currentRoot) {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (routeArray[i].baseRoot !== undefined) { // Gets to first defined function before nested function
      let newBaseRoot = checkForQuoteType(routeArray[i].completeRoute.split(',')[0]); // Check for " or ' quote type
      rewriteBaseRoot(i, previousCurrentIndex, previousBaseRoot, previousBaseRootIndex, newBaseRoot, currentRoot);
      break;
    }
  }
}

// Will need to harden this to handle additional nesting past 2!
function rewriteBaseRoot(indexToBeginRewrite, previousIndex, previousBaseRoot, previousBaseRootIndex, newBaseRoot, currentRoot) {
  for (var i = indexToBeginRewrite; i < previousIndex + 1; i++) {
    if (routeArray[i].baseRoot == undefined) {
      routeArray[i].baseRoot = newBaseRoot;
    } else if (routeArray[i].baseRoot !== newBaseRoot) { // WILL NEED TO ADD A CHECK FOR MULTIPLE ADDITIONAL baseRoots
      routeArray[i].baseRoot2 = routeArray[i].baseRoot;
      routeArray[i].baseRoot = newBaseRoot;
    }
    if (i == previousIndex) {}  // CAN BE REMOVED IN FUNCTION REFACTORING
  }
}

function writeToFile() {
  routeArray.map(function (x, i) {
    if (i == 0) fileData += header; // Write the header
    fileData += ('\n  <url>\n    <loc>');
    if (routeArray[i].baseRoot == undefined) writeToFileSwitch(1, i); // Scenario 1: baseRoot is undefined
    else if (routeArray[i].baseRoot2) writeToFileSwitch(2, i); // Scenario 2: baseRoot[X] exists
    else writeToFileSwitch(3, i); // Scenario 3: there is a baseRoot, but no additional nested baseRoots
    fileData += ('</loc>\n    <lastmod>' + formatDate(currentDate) + '</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>');
  });
  fileData += ('\n</urlset>');

  fs.writeFile("public/sitemap.xml", fileData, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("\nA new version of sitemap.xml was successfully saved...\n");
  });
}

function writeToFileSwitch(scenario, i) {
  if (routeArray[i].path !== '/' && !routeArray[i].path.match(/\//g) && !routeArray[i].path.match(/\:/g)) {
    switch (scenario) {
      case 1:
        fileData += (baseURL + '/' + routeArray[i].path);
        break;
      case 2:
        fileData += (baseURL + '/' + routeArray[i].baseRoot + '/' + routeArray[i].baseRoot2 + '/' + routeArray[i].path);
        break;
      case 3:
        fileData += (baseURL + '/' + routeArray[i].baseRoot + '/' + routeArray[i].path);
        break;
    }
  } else if (!routeArray[i].path.match(/\:/g)) {
    switch (scenario) {
      case 1:
        fileData += (baseURL + routeArray[i].path);
        break;
      case 2:
        fileData += (baseURL + '/' + routeArray[i].baseRoot + '/' + routeArray[i].baseRoot2 + routeArray[i].path);
        break;
      case 3:
        fileData += (baseURL + '/' + routeArray[i].baseRoot + routeArray[i].path);
        break;
    }
  }
}

function formatDate(dateObject) {
  let date, year, month, day;
  day = currentDate.getDate(), month = currentDate.getMonth() + 1, year = currentDate.getFullYear();
  if (day < 10) day = '0' + day;
  else if (month < 10) month = '0' + month;
  date = year + '-' + month + '-' + day;
  return date;
}

function findPreviousBaseRoot(currentRoot) { // Go back in reverse order until we find the next base route prior to this
  let currentIndex, baseRoot, baseRootIndex;
  routeArray.find((n, i) => { // Find currentIndex
    if (n.baseRoot == currentRoot) currentIndex = i;
  });
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (routeArray[i].baseRoot !== undefined) {
      baseRoot = routeArray[i].baseRoot;
      baseRootIndex = i;
      fillInBaseRoot(baseRootIndex, baseRoot, currentIndex);
      break;
    }
  };
}

function findPreviousBaseRootIfDoublyNestedOrMore(currentRoot) { // Go back in reverse order until we find the next base route prior to this
  let currentIndex, baseRoot, baseRootIndex;
  routeArray.find((n, i) => { // Find currentIndex
    if (n.path == currentRoot) currentIndex = i;
  });

  for (let i = routeArray.length - 1; i >= 0; i--) {
    if (routeArray[i].baseRoot !== undefined) {
      baseRoot = routeArray[i].baseRoot;
      baseRootIndex = i;
      fillInBaseRoot(baseRootIndex, baseRoot, currentIndex, true);
      break;
    }
  };
}

function fillInBaseRoot(baseRootIndex, baseRoot, currentIndex, isNested) {
  for (let i = baseRootIndex; i < currentIndex; i++) {
    routeArray[i].baseRoot = baseRoot;
    if (i == currentIndex - 1) {
      if (isNested == true) findUndefinedBeforeCodeBlock(baseRoot);
    }
  }
}

function checkForQuoteType(data) {
  if (data.includes("'")) return data.match(/\'.*\'/)[0].replace(/'|"/g, "");
  else return data.match(/\".*\"/)[0].replace(/'|"/g, "");
}
