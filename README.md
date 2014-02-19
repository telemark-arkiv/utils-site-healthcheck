#Site Healthcheck#

A small CLI-tool for maintaining a healthy website.

The idea is to run different checks on your website and generate a report.

Your site's sitemap.xml is the base of all reports.

##How to install##

Clone the repo

```
$ git clone git@github.com:telemark/utils-site-healthcheck.git
```

cd into the directory

```
$ cd utils-site-healthcheck
```

Install the dependencies

```
$ npm install
```

##Usage##

Open your terminal and cd to the directory were this app is located.

Run this command with your settings

```
$ node index.js --url=url-to-sitemap --report=name-of-report-type --filename=filname-to-use.csv
```

--url needs to be complete with http:// and everything

##Reports##

Collection of reports

###Freshness###

--report = fresh

Generates a report with location of page and the number of days since it's last update

###Health###

--report = health

Generates a report with location of page and it's status code (200 is good)

###Dead links###

--report = deadlinks

Generates a report with location of page, the url with error and it's status code

###HTML###

--report = html

Checks each page against the w3c-validator. Generates a report with location of page and "Valid" og "Errors"

###WCAG###

--report = wcag

In order to use this report you must supply a Web Service ID from achecker. You can register for free at [http://achecker.ca/](http://achecker.ca/)

The report will return location of page and number of error from validation towards WCAG 2.0 Level AA.