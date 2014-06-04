var request = require('request')
  , cheerio = require('cheerio')
  , xml2js = require('xml2js')
  , parser = new xml2js.Parser()
  , pagespeedAPIKey = 'insert-your-google-APIkey-here'
  ;

function daysBetween(date1, date2){
  return Math.floor((date1 - date2)/(1000 * 60 * 60 * 24));
}

function checkLink(pageUrl, linkUrl, callback){
  request(linkUrl, function(error, response, body){
    if (error) {
      var ret = mkCsvRowFromArray([pageUrl, linkUrl, "Unknown error"]);

      return callback(error, ret);
    }
    if (!error && response.statusCode != 200) {
      var ret = mkCsvRowFromArray([pageUrl, linkUrl, response.statusCode]);
      return callback (null, ret);
    }
  });
}

function mkCsvRowFromArray(arr){
  var a = arr.map(function(i){
        return '"' + i + '"'
      });
  return a.join(',') + '\r\n'
}

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
          } else {
            return callback(null, result.urlset.url);
          }
        });
      }
    })
  },
  getPageDaysSinceLastUpdate: function(page, callback){
    var today = new Date()
      , pageModified = new Date(page.lastmod[0])
      , location = page.loc[0]
      , last_modified = daysBetween(today, pageModified)
      , ret = mkCsvRowFromArray([location, last_modified]);

    return callback(null, ret);
  },
  getPageLinks: function(url, callback) {
    request(url, function(error, response, body){
      if (error) {
        return callback(error, null);
      }
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body.toString())
          , allAs = $('a')
          , links = [];

        allAs.each(function(i, elem){
          if(elem.attribs.href && elem.attribs.href.indexOf('http') > -1) {
            links.push(elem.attribs.href);
          }
        });

        return callback(null, {url:url, links:links});
      }
    });
  },
  checkPageLinks: function(pageUrl, stream, links){
    var linksLength = links.length;

    for(var i=0;i < linksLength; i++){
      var link = links[i];

      checkLink(pageUrl, link, function(err, data){
        if(err){
          stream.push(data);
        } else {
          stream.push(data);
        }
      });
    }
  },
  checkPageStatus: function(pageUrl, callback){
    request(pageUrl, function(error, response, body){
      if (error) {
        return callback(error, null);
      } else {
        var thisUrl = response.request.uri.href
          , data = mkCsvRowFromArray([thisUrl, response.statusCode]);
        return callback(null, data);
      }
    });
  },
  getPagespeedReport: function(pageUrl, callback){
    var pagespeedUrl = 'https://www.googleapis.com/pagespeedonline/v1/runPagespeed?url='+ pageUrl + '&key=' + pagespeedAPIKey;

    request(pagespeedUrl, function(error, response, body){
      if(error){
        return callback(error, null);
      } else {
        var result = JSON.parse(body.toString());
        if(result.score){
          var ret = mkCsvRowFromArray([pageUrl, result.score]);
          return callback(null, ret);
        } else {
          return callback(new Error('Something is wrong: ' + result), null);
        }
      }
    });
  },
  getPageMetadata: function(pageUrl, callback) {
    request(pageUrl, function(error, response, body){
      if (error) {
        return callback(error, null);
      }
      if (!error && response.statusCode == 200) {

        var $ = cheerio.load(body.toString())
          , title = $('title').text()
          , keywords = $('meta[name=keywords]').attr('content')
          , description = $('meta[name=description]').attr('content')
          , ret = mkCsvRowFromArray([pageUrl, title, keywords, description]);

        return callback(null, ret);
      } else {
        return callback(new Error('Wrong statuscode: ' + response.statusCode), null)
      }
    });
  }
};