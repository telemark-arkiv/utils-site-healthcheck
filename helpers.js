/**
 * Created by geir on 16/02/14.
 */

var
  request = require('request'),
  cheerio = require('cheerio'),
  xml2js = require('xml2js'),
  parser = new xml2js.Parser(),
  acheckerID = 'insert-achecker-webserviceID-here',
  pagespeedAPIKey = 'insert-google-API-key-here';

function daysBetween(date1, date2){
  return Math.floor((date1 - date2)/(1000 * 60 * 60 * 24));
}

function checkLink(pageUrl, linkUrl, callback){
  request(linkUrl, function(error, response, body){
    if (error) {
      return callback(error, null);
    }
    if (!error && response.statusCode != 200) {
      return callback (null, [pageUrl, linkUrl, response.statusCode]);
    }
  });
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
    var
      today = new Date(),
      pageModified = new Date(page.lastmod[0]),
      location = page.loc[0],
      last_modified = daysBetween(today, pageModified);

    return callback(null, [location, last_modified]);
  },
  getPageLinks: function(url, callback) {
    request(url, function(error, response, body){
      if (error) {
        return callback(error, null);
      }
      if (!error && response.statusCode == 200) {
        var
          $ = cheerio.load(body.toString()),
          allAs = $('a'),
          links = [];

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
    var
      linksLength = links.length;

    for(var i=0;i < linksLength; i++){
      var
        link = links[i];

      checkLink(pageUrl, link, function(err, data){
        if(err){
          console.log(err);
        } else {
          stream.push(JSON.stringify(data));
        }
      });
    }
  },
  checkPageStatus: function(pageUrl, callback){
    request(pageUrl, function(error, response, body){
      if (error) {
        return callback(error, null);
      } else {
        var
          thisUrl = response.request.uri.href,
          data = [thisUrl, response.statusCode];
        return callback(null, data);
      }
    });
  },
  validateThisPageHtml: function(pageUrl, callback){
    var
      url = 'http://html5.validator.nu/?doc=' + pageUrl + '&out=json';

    request(url, function(error, response, body){
      if(error){
        return callback(error, null);
      } else {
        var
          result = JSON.parse(body.toString()),
          data = [result.url, "Valid"];

        if(result.messages.length > 0){
          data = [result.url, "Errors"];
        }

        return callback(null, data);
      }
    });
  },
  validateThisPageWcag: function(pageUrl, callback){
    var
      acheckerUrl = 'http://achecker.ca/checkacc.php?uri=' + pageUrl + '&id=' + acheckerID + '&output=rest';

    request(acheckerUrl, function(error, response, body){
      if(error){
        return callback(error, null);
      } else {
        parser.parseString(body.toString(), function (err, result) {
          if (err) {
            return callback(err, null);
          } else {
            if (result){
              return callback(null, [pageUrl, result.resultset.summary[0].NumOfErrors[0]]);
            } else {
              return callback({'Error' : 'Something is wrong: ' + result}, null)
            }
          }
        });
      }
    });
  },
  getPagespeedReport: function(pageUrl, callback){
    var
      pagespeedUrl = 'https://www.googleapis.com/pagespeedonline/v1/runPagespeed?url='+ pageUrl + '&key=' + pagespeedAPIKey;

    request(pagespeedUrl, function(error, response, body){
      if(error){
        return callback(error, null);
      } else {
        var
          result = JSON.parse(body.toString());
        if(result.score){
          return callback(null, [pageUrl, result.score]);
        } else {
          return callback({'Error' : 'Something is wrong: ' + result}, null);
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
        var
          $ = cheerio.load(body.toString()),
          title = $('title').text(),
          keywords = $('meta[name=keywords]').attr('content'),
          description = $('meta[name=description]').attr('content');

        return callback(null, {url:pageUrl, title:title, keywords:keywords, description:description});
      }
    });
  }
};