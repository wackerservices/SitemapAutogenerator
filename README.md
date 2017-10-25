# sitemap-autogenerator

The **Beta** version of an Ember AddOn for ember-cli that auto-generates a **sitemap.xml** file and adds it to the project.

## Installation
**This AddOn requires ember-cli version >= X.X.XX**

To install simply run:

```
 npm install --save-dev sitemap-autogenerator
```

## Usage

To manually trigger the first build of **sitemap.xml**:

```
 ember g sitemap-autogenerator
```

You may continue to trigger manual builds this way.

To add **sitemap-autogenerator** to your ember-cli builds:

  Add the following code to **ember-cli-build.js**: 
```
const sitemapAutogenerator = require('sitemap-autogenerator/blueprints/sitemap-autogenerator/index');
sitemapAutogenerator.triggerSitemapBuilder();
```

* `git clone <repository-url>` this repository
* `cd sitemap-autogenerator`
* `npm install`

## Current Limitations

* Route autogeneration is limited to routes up to two children deep.
* All routes will be added to **sitemap.xml** with the exception of any route with an * or...
* There is no way to currently assign custom ```<priority>``` values for specific routes.

## Running Tests

* `git clone git@github.com:wackerservices/SitemapAutogenerator.git` this repository
* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
