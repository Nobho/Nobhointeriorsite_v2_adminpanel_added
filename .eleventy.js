const pluginRss = require("@11ty/eleventy-plugin-rss");
// .eleventy.js
module.exports = function(eleventyConfig) {
  
  // Tell Eleventy to watch our SCSS for changes (for live-reload).
  eleventyConfig.addWatchTarget("./src/assets/scss/");

  // Add a custom shortcode to get the current year.
  eleventyConfig.addShortcode("year", () => new Date().getFullYear());

  // Pass through the compiled CSS, our JS, and our images.
  eleventyConfig.addPassthroughCopy("./src/assets/css");
  eleventyConfig.addPassthroughCopy("./src/assets/js");
  eleventyConfig.addPassthroughCopy("./src/assets/images");

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