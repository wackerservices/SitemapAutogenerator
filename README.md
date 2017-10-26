# sitemap-autogenerator

The **Beta** version of an Ember AddOn for ember-cli that auto-generates a **sitemap.xml** file and adds it to the project.

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
* The sitemap-autogenerator is limited to basic XML sitemaps and cannot currently manage image and video file information for resources on a page.
* There is no way to currently assign custom ```<priority>``` values for specific routes.

## Example of Output

<pre><i>/* app/public/sitemap.xml */</i>
&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"&gt;
&nbsp;&nbsp;&lt;url&gt;
&nbsp;&nbsp;&nbsp;&nbsp;&lt;loc&gt;https://www.&lt;mysite&gt;.com/&lt;/loc&gt;
&nbsp;&nbsp;&nbsp;&nbsp;&lt;lastmod&gt;2017-10-31&lt;/lastmod&gt;
&nbsp;&nbsp;&nbsp;&nbsp;&lt;changefreq&gt;daily&lt;/changefreq&gt;
&nbsp;&nbsp;&nbsp;&nbsp;&lt;priority&gt;0.9&lt;/priority&gt;
&nbsp;&nbsp;&lt;/url&gt;
&lt;/urlset&gt;</pre>

## Running Tests

* `git clone git@github.com:wackerservices/SitemapAutogenerator.git` this repository
* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
