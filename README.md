# sitemap-autogenerator

The **Beta** version of an Ember AddOn for ember-cli that auto-generates a [sitemap.xml](https://support.google.com/webmasters/answer/183668?hl=en&ref_topic=4581190) file and adds it to the project.

Installation
------------------------------------------------------------------------------

To install simply run:

```
 npm install --save-dev sitemap-autogenerator
```

## Usage

  Add the following code to **package.json**: 
```js
"postbuild": "node -e \"require('./node_modules/sitemap-autogenerator/blueprints/sitemap-autogenerator/index').triggerSitemapBuilder('<YOUR SITE ROOT URL>')\"",
```

  Be sure to not have a trailing `/` after `<YOUR SITE ROOT URL>` or else you will get double `//` in your generated **sitemap.xml**
  
  `sitemap-autogenerator` will run at the end of each Ember build, which are run with: `npm run build`
  
  Alternatively, you can place the above script as a `"poststart"` hook in your **package.json** file and test that a **sitemap.xml** file is created when you stop `ember s`. 
  
  You should see the following log message right after the `ember-cli` logs `cleaning up...`
  
 ```
  A new version of sitemap.xml was successfully saved
 ```

## Current Limitations

* Route autogeneration is limited to nested routes up to two deep: `<BASE_ROUTE>/<FIRST_SEGMENT>/<SECOND_SEGMENT>`
* All routes will be added to **sitemap.xml** with the exception of any route with path "*".
* Routes with dynamic segments, ie "/artist/:artist_id", are not yet supported.
* The sitemap-autogenerator is limited to basic XML sitemaps and cannot currently manage image and video file information for resources on a page.
* There is no way to currently assign custom ```<priority>``` values for specific routes.
* **sitemap-autogenerator** assumes you use the following standard Ember file structure: `app/dist/sitemap.xml` 

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

### Running tests

* `git clone git@github.com:wackerservices/SitemapAutogenerator.git` this repository
* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
