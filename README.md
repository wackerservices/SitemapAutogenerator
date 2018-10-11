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
  
  The [Sitemap protocol](https://www.sitemaps.org/protocol.html) consists of XML tags and must have the following tags:
  - `<urlset>` Encapsulates the file and references the current protocol standard.
  - `<url>` Parent tag for each URL entry. The remaining tags are children of this tag.
  - `<loc>` URL of the page. This URL must begin with the protocol (such as http) and end with a trailing slash, if your web server requires it. This value must be less than 2,048 characters. 

  The following tags are optional:
  - `<lastmod>` The date of last modification of the file.
  - `<changefreq>` How frequently the page is likely to change. This value provides general information to search engines and may not correlate exactly to how often they crawl the page. Valid values are:
    - always The value "always" should be used to describe documents that change each time they are accessed.
    - hourly
    - daily
    - weekly
    - monthly
    - yearly
    - never
  - `<priority>`
  The priority of this URL relative to other URLs on your site. Valid values range from 0.0 to 1.0. This value does not affect how your pages are compared to pages on other sites—it only lets the search engines know which pages you deem most important for the crawlers. The default priority of a page is 0.5.

## `environment.js`  
  Below is an example of how to customize items such as Custom values for `changeFrequency` and `defaultPriorityValue`, as well as routes to `ignoreTheseRoutes` and `customPriority` values are optional.
  
`changeFrequency` is an optional key/value pair, where the possible options are a `string`:
- always
- hourly
- daily
- weekly
- monthly
- yearly
- never

If `changeFrequency` is not specified in your `environment.js` file, the default value will be `daily`.

`showLog` is an optional key/value pair, where the possible options are `true` or `false`. If `showLog` is not specified in your `environment.js` file, the default value will be `false`. If set to `true`, `showLog` displays log information regarding which routes/paths are added or ignored in your `sitemap-autogenerator` generated `sitemap.xml` file. 

`defaultPriorityValue` is an optional key/value pair, where the possible options are a `string` from `0.0` to `1.0`. If `defaultPriorityValue` is not specified in your `environment.js` file, the default value will be `0.5`.

`ignoreTheseRoutes` is an optional object where each key/value pair is the name of a route you would like to be omitted from your `sitemap.xml` and the value must be `true`. To avoid confusion, this may be the route from your Ember app or the path by which you reach this route. If your complete URL is `https://mysite.com/contact` and you would like to omit `contact` from your `sitemap.xml`, you would include the following in `ignoreTheseRoutes: { 'contact': true }`. If `ignoreTheseRoutes` is omitted, then all routes except for those with the path `"*"` will be added to your `sitemap.xml`.

`customPriority` is an optional object where each key/value pair where the key is the name of a route and the value is a string specifying a particular `priority` for this route, from `0.0` to `1.0`. If `customPriority` is omitted, then all routes will be assigned a priority of `0.5` by default.
  
Please add these to your environment.js file as shown in the example below
  
  ```js
    <!-- environment.js -->
    ...
    
    ENV['sitemap-autogenerator'] = {
    changeFrequency: 'weekly', // Optional (if not included in ENV, default value is 'daily')
    defaultPriorityValue: '0.3', // Optional (if not included in ENV, default value is '0.5')
    showLog: true,
    ignoreTheseRoutes: { // Optional (if not included in ENV, all routes will be included in sitemap.xml except those with path "*"
      'contact-us': true,
      'contact': true,
      'algorithmictradedeveloper': true,
      'careers': true
    },
    customPriority: { // Optional (if not included in ENV, all values will be the default value '0.5')
      'fpgaengineer': '0.2',
      'systemapplicationdeveloper': '0.9',
      'general': '0.7',
      'coresoftwaredeveloper': '0.8'
    }
    
    ...
  }
  ```
  
  `sitemap-autogenerator` will run at the end of each Ember build, which are run with: `npm run build`
  
  Alternatively, you can place the above script as a `"poststart"` hook in your **package.json** file and test that a **sitemap.xml** file is created when you stop `ember s`. 
  
  You should see the following log message right after the `ember-cli` logs `cleaning up...`
  
 ```
  A new version of sitemap.xml was successfully saved
 ```

## Current Limitations

* Routes with dynamic segments, ie "/artist/:artist_id", are not yet supported.
* The sitemap-autogenerator is limited to basic XML sitemaps and cannot currently manage image and video file information for resources on a page or rich media content.
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