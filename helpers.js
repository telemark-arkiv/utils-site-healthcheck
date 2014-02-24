/**
 * Created by geir on 16/02/14.
 */

var
  request = require('request'),
  cheerio = require('cheerio'),
  xml2js = require('xml2js'),
  parser = new xml2js.Parser(),
  acheckerID = 'insert-webservice-ID-for-achecker-here',
  pagespeedAPIKey = 'insert-google-api-key-here';

function checkMyHealth(pageUrl, callback){

  request(pageUrl, function(error, response, body){
    if (error) {
      callback(error, null);
    } else {
      var
        thisUrl = response.request.uri.href,
        data = {url:thisUrl, statusCode:response.statusCode};
      callback(null, data);
    }

  });

}

function getMetadata(pageUrl, callback) {
  request(pageUrl, function(error, response, body){
    if (error) {
      callback(error, null);
    }
    if (!error && response.statusCode == 200) {
      var
        result = {},
        $ = cheerio.load(body.toString()),
        title = $('title').text(),
        keywords = $('meta[name=keywords]').attr('content'),
        description = $('meta[name=description]').attr('content');

      result.url = pageUrl;
      result.title = title;
      result.keywords = keywords;
      result.description = description;

      callback(null, result);
    }
  });
}

function getPagespeedReport(pageUrl, callback){
  var
    pagespeedUrl = 'https://www.googleapis.com/pagespeedonline/v1/runPagespeed?url='+ pageUrl + '&key=' + pagespeedAPIKey;

  request(pagespeedUrl, function(error, response, body){
    if(error){
      return callback(error, null);
    } else {

      return callback(null, {'url': pageUrl, 'result': JSON.parse(body.toString())})

    }

  });
}

function validateWcag(pageUrl, callback){
  var
    acheckerUrl = 'http://achecker.ca/checkacc.php?uri=' + pageUrl + '&id=' + acheckerID + '&output=rest';

  request(acheckerUrl, function(error, response, body){
    if(error){
      return callback(error, null);
    } else {

      parser.parseString(body.toString(), function (err, result) {
        if (err) {
          return callback(err, null);
        }
        return callback(null, {'url': pageUrl, 'result':result});
      });

    }

  });
}

function validateThisUrl(pageUrl, callback){
  var
    url = 'http://html5.validator.nu/?doc=' + pageUrl + '&out=json';

  request(url, function(error, response, body){
    if(error){
      return callback(error, null);
    } else {
      return callback(null, JSON.parse(body.toString()));
    }
  });
}

function checkLink(pageUrl, linkUrl, callback){
  request(linkUrl, function(error, response, body){
    if (error) {
      callback(error, null);
    }
    if (!error && response.statusCode != 200) {
      return callback (null, [pageUrl, linkUrl, response.statusCode]);
    }
  });
}

function checkPageLinks(pageUrl, stream, links){
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
}

function getPageLinks(url, callback) {
  request(url, function(error, response, body){
    if (error) {
      callback(error, null, null);
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
      })

      callback(null, url, links);
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
          }
          return callback(null, result.urlset.url);
        });
      }
    })
  },
  mkReportFresh: function(pages, stream){
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
  mkReportLinks: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = ['location', 'link'];

    stream.push(JSON.stringify(headers));

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      getPageLinks(location, function(err, pageUrl, links){
        if(err){
          console.log(err);
        } else {

          var
            linksLength = links.length;

          for(var i=0;i < linksLength; i++){
            var
              link = links[i];

            stream.push(JSON.stringify([pageUrl, link]));
          }
        }
      });

    }
  },
  mkReportDeadlinks: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = ['location', 'link', 'status_code'];

    stream.push(JSON.stringify(headers));

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      getPageLinks(location, function(err, pageUrl, links){
        if(err){
          console.log(err);
        } else {
          checkPageLinks(pageUrl, stream, links);
        }
      });

    }
  },
  mkReportHealth: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = ['location', 'status_code'];

    stream.push(JSON.stringify(headers));

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      checkMyHealth(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          stream.push(JSON.stringify([data.url, data.statusCode]))
        }
      })

    }
  },
  mkReportHtml: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = ['location', 'status'];

    stream.push(JSON.stringify(headers));

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      validateThisUrl(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          if(data.messages.length > 0){
            stream.push(JSON.stringify([data.url, "Errors"]));
          } else {
            stream.push(JSON.stringify([data.url, "Valid"]));
          }
        }
      });

    }
  },
  mkReportWcag: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = ['location', 'errors'];

    stream.push(JSON.stringify(headers));

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      validateWcag(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          if (data.result){
            stream.push(JSON.stringify([data.url, data.result.resultset.summary[0].NumOfErrors[0]]));
          } else {
            console.log('Something is wrong: ' + data);
          }
        }

      });

    }

  },
  mkReportPagespeed: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = ['location', 'score'];

    stream.push(JSON.stringify(headers));

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      getPagespeedReport(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          if (data.result){
            stream.push(JSON.stringify([data.url, data.result.score]));
          } else {
            console.log('Something is wrong: ' + data);
          }
        }

      });

    }

  },
  mkReportMeta: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = ['location', 'title', 'keywords', 'description'];

    stream.push(JSON.stringify(headers));

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      getMetadata(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          if (data.url){
            stream.push(JSON.stringify([data.url, data.title, data.keywords, data.description]));
          } else {
            console.log('Something is wrong: ' + data);
          }
        }

      });

    }

  }

};