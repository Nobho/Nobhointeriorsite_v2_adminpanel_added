const pluginRss = require("@11ty/eleventy-plugin-rss");
// .eleventy.js
module.exports = function (eleventyConfig) {

  // Tell Eleventy to watch our SCSS for changes (for live-reload).
  eleventyConfig.addWatchTarget("./src/assets/scss/");

  // Add a custom shortcode to get the current year.
  eleventyConfig.addShortcode("year", () => new Date().getFullYear());

  // Pass through the compiled CSS, our JS, and our images.
  eleventyConfig.addPassthroughCopy("./src/assets/css");
  eleventyConfig.addPassthroughCopy("./src/assets/js");
  eleventyConfig.addPassthroughCopy("./src/assets/images");

  // --- SPA ROUTING FIX FOR CUTEADMIN ---
  // Configure BrowserSync to handle client-side routing
  // This mirrors the Netlify redirect behavior for local development
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, bs) {
        // Handle 404s by serving index.html for cuteadmin routes
        bs.addMiddleware("*", (req, res, next) => {
          // If the request is for a cuteadmin subpage that doesn't exist
          if (req.url.startsWith('/cuteadmin/') && req.url !== '/cuteadmin/' && !req.url.includes('.')) {
            // Serve the cuteadmin index.html instead
            const fs = require('fs');
            const path = require('path');
            const indexPath = path.join(__dirname, '_site', 'cuteadmin', 'index.html');

            if (fs.existsSync(indexPath)) {
              res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
              res.end(fs.readFileSync(indexPath));
              return;
            }
          }
          next();
        });
      }
    }
  });

  // Set the source and output directories
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes"
    },
    // --- THE FIX IS HERE ---
    // Tell Eleventy to use Nunjucks for all .html files
    htmlTemplateEngine: "njk",
    // Also tell Eleventy to use Nunjucks for all .md files (good practice)
    markdownTemplateEngine: "njk"
  };
};