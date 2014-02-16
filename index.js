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

if (sitemapUrl && report && fileName) {
  getPages(sitemapUrl, function(err, pages){
    if (err) {
      console.log(err);
    } else {
      var
        validReport = false,
        reportData;

      if(report == 'fresh'){
        reportData = helpers.mkReportFreshness(pages);
        validReport = true;
      }

      if (validReport === true){
        helpers.writeReport(reportData, fileName);
      } else {
        console.log('No valid inputs for --report found. Please try again.')
      }

    }
  })
} else {
  console.log('Missing required arguments');
  console.log('Usage:');
  console.log('node index.js --url=url-to-parse --report=type-of-report --filename=filename-to-save');
}