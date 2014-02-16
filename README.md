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
$ node index.js --url=url-to-sitemap --report=name-of-report-type filename=filname-to-use.csv
```

--url needs to be complete with http:// and everything

##Reports##

Collection of reports

###Freshness###

--report = fresh

Generates a report with location of page and the number of days since it's last update