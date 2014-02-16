/**
 * Created by geir on 16/02/14.
 */

var
  helpers = require('./helpers'),
  request = require('request'),
  xml2js = require('xml2js'),
  parser = new xml2js.Parser(),
  argv = require('minimist')(process.argv.slice(2)),
  sitemapUrl = argv.url,
  report = argv.report,
  fileName = argv.filename || 'report.csv';

function getPages(urlToSitemap, callback){
  request(urlToSitemap, function(error, response, body){
    if (error) {
      return callback(error, null);
    }
    if (!error && response.statusCode == 200) {
      parser.parseString(body.toString(), function (err, result) {
        if (err) {
          return callback(err, null);
        }
        return callback(null, result.urlset.url);
      });
    }
  })
}

function mkReportFreshness(pages){
  var
    today = new Date(),
    pagesLength = pages.length,
    report = [];

  function daysBetween(date1, date2){
    return Math.floor((date1 - date2)/(1000 * 60 * 60 * 24));
  }

  for(var i=0;i < pagesLength; i++){
    var
      rep = {},
      page = pages[i],
      pageModified = new Date(page.lastmod[0]);

    rep.location = page.loc[0];
    rep.last_modified = daysBetween(today, pageModified);
    report.push(rep)
  }

  return [report, ['location', 'last_modified']];

}

if (sitemapUrl && report && fileName) {
  getPages(sitemapUrl, function(err, pages){
    if (err) {
      console.log(err);
    } else {
      var
        reportdata = mkReportFreshness(pages);

      helpers.writeReport(reportdata, fileName);
    }
  })
} else {
  console.log('Missing required arguments');
  console.log('Usage:');
  console.log('node index.js --url=url-to-parse --report=type-of-report --filename=filename-to-save');
}