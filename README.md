# sitemap-autogenerator

The **Beta** version of an Ember AddOn for ember-cli that auto-generates a [sitemap.xml](https://support.google.com/webmasters/answer/183668?hl=en&ref_topic=4581190) file and adds it to the project.

## Installation

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
```js
const sitemapAutogenerator = require('sitemap-autogenerator/blueprints/sitemap-autogenerator/index');
sitemapAutogenerator.triggerSitemapBuilder('<YOUR SITE ROOT URL>');
```

* `git clone <repository-url>` this repository
* `cd sitemap-autogenerator`
* `npm install`

## Current Limitations

* Route autogeneration is limited to nested routes up to two deep: `<BASE_ROUTE>/<FIRST_SEGMENT>/<SECOND_SEGMENT>`
* All routes will be added to **sitemap.xml** with the exception of any route with path "*".
* Routes with dynamic segments, ie "/artist/:artist_id", are not yet supported.
* The sitemap-autogenerator is limited to basic XML sitemaps and cannot currently manage image and video file information for resources on a page.
* There is no way to currently assign custom ```<priority>``` values for specific routes.

## Example of Output

```xml
<!-- app/dist/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.<mysite>.com/</loc>
    <lastmod>2017-10-31</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
```

## Running Tests

* `git clone git@github.com:wackerservices/SitemapAutogenerator.git` this repository
* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).