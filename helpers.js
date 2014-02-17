/**
 * Created by geir on 16/02/14.
 */

var
  csv = require('ya-csv'),
  fs = require('fs'),
  request = require('request'),
  xml2js = require('xml2js'),
  parser = new xml2js.Parser(),
  stream = require('stream');

module.exports = {

  getPages: function(urlToSitemap, callback){
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
  },
  mkReportFreshness: function(pages, filename){
    var
      today = new Date(),
      pagesLength = pages.length,
      headers = ['location', 'last_modified'];
      writeStream = fs.createWriteStream(filename)
      reader = stream.PassThrough(),
      writer = csv.createCsvStreamWriter(writeStream);

    reader.on('data', function(data){
      writer.writeRecord(JSON.parse(data.toString()));
    });

    reader.push(JSON.stringify(headers));

    function daysBetween(date1, date2){
      return Math.floor((date1 - date2)/(1000 * 60 * 60 * 24));
    }

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        pageModified = new Date(page.lastmod[0]),
        location = page.loc[0],
        last_modified = daysBetween(today, pageModified),
        data = [location, last_modified];

      reader.push(JSON.stringify(data));
    }

  },
  mkReportLinks: function(pages){
    console.log('Not yet implemented');
  },
  mkReportHealth: function(pages){
    console.log('Not yet implemented');
  }

};