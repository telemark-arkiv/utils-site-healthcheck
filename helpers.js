/**
 * Created by geir on 16/02/14.
 */

var
  request = require('request'),
  cheerio = require('cheerio'),
  xml2js = require('xml2js'),
  parser = new xml2js.Parser(),
  w3c = require('w3c-validate').createValidator();

function validateHtml(pageUrl, data, callback){
  w3c.validate(data, function(err){
    if(err){
      console.log(err);
      return callback(null, [pageUrl, 'Errors'])
    } else {
      return callback(null, [pageUrl, 'Valid'])
    }
  })
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

      request(location, function(error, response, body){
        if (error) {
          console.log(error);
        } else {
          var
            thisUrl = response.request.uri.href,
            data = [thisUrl, response.statusCode];
          stream.push(JSON.stringify(data));
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

      request(location, function(error, response, body){
        if (error) {
          console.log(error);
        } else {
          var
            thisUrl = response.request.uri.href,
            data = body.toString();

          validateHtml(thisUrl, data, function(err, data){
            if(err){
              console.log(err);
            } else {
              stream.push(JSON.stringify(data));
            }
          });
        }

      })

    }
  }

};