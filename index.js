/**
 * Created by geir on 16/02/14.
 */

var
  fs = require('fs'),
  json2csv = require('json2csv'),
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

function mkReportFreshness(pages, filename){
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

  json2csv({data: report, fields: ['location', 'last_modified']}, function(err, csv) {
    if (err) console.log(err);
    fs.writeFile(fileName, csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    });
  });

}

if (sitemapUrl && report && fileName) {
  getPages(sitemapUrl, function(err, pages){
    if (err) {
      console.log(err);
    } else {
      mkReportFreshness(pages, fileName)
    }
  })
} else {
  console.log('Missing required arguments');
  console.log('Usage:');
  console.log('node index.js --url=url-to-parse --report=type-of-report --filename=filename-to-save');
}