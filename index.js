const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeWikipedia() {
  const url = 'https://en.wikipedia.org/wiki/Main_Page';
  let response = await axios.get(url);
  let $ = cheerio.load(response.data);

  // Extract "Today's featured article" title, description, and link
  const featuredArticle = {
    title: $('.featured_article .mw-content-ltr a').first().text(),
    description: $('.featured_article .mw-content-ltr p').first().text(),
    link: $('.featured_article .mw-content-ltr a').first().attr('href'),
  };

  // Extract facts from the "Did you know..." section
  const didYouKnowFacts = [];

  // Parse both "hatnote" and "ul" classes for broad compatibility
  $('.did-you-know .hatnote, .did-you-know ul').each(function () {
    if ($(this).is('ul')) {
      $(this).find('li').each(function () {
        const fact = $(this).text().trim();
        didYouKnowFacts.push(fact);
      });
    } else {
      // Handle single hatnote format
      didYouKnowFacts.push($(this).text().trim());
    }
  });

  // Save the extracted data into a CSV file
  const data = [['Title', 'Description', 'Link'], [featuredArticle.title, featuredArticle.description, featuredArticle.link]];
  data.push(['Did You Know Facts']);
  data.push(didYouKnowFacts);

  const csvContent = data.map((row) => row.join(',')).join('\n');

  fs.writeFileSync('wikipedia_data.csv', csvContent);
}

scrapeWikipedia();