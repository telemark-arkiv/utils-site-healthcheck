/**
 * Created by geir on 16/02/14.
 */

var
  request = require('request'),
  xml2js = require('xml2js'),
  parser = new xml2js.Parser();

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
  mkReportFreshness: function(pages, stream){
    var
      today = new Date(),
      pagesLength = pages.length,
      headers = ['location', 'last_modified'];

    stream.push(JSON.stringify(headers));

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

      stream.push(JSON.stringify(data));
    }

  },
  mkReportLinks: function(pages){
    console.log('Report type "links". Not yet implemented');
  },
  mkReportHealth: function(pages){
    console.log('Report type "health". Not yet implemented');
  }

};