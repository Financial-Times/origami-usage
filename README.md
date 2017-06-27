
Origami Usage
======================

**:warning: This is a work in progress :warning:**

Display usage metrics about Origami components on Financial Times Group websites.

[![Build status](https://img.shields.io/circleci/project/Financial-Times/origami-usage.svg)][ci]
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)][license]


Table Of Contents
-----------------

  * [Requirements](#requirements)
  * [Running Locally](#running-locally)
  * [Configuration](#configuration)
  * [Operational Documentation](#operational-documentation)
  * [Testing](#testing)
  * [Deployment](#deployment)
  * [Monitoring](#monitoring)
  * [Trouble-Shooting](#trouble-shooting)
  * [License](#license)


Requirements
------------

Requires [Node.js] 8.x and [npm].


Running Locally
---------------

Before we can run the application, we'll need to install dependencies:

```sh
make install
```

Run the application in development mode with

```sh
make run-dev
```

Now you can access the app over HTTP on port `8080`: [http://localhost:8080/](http://localhost:8080/)


Configuration
-------------

We configure the application using environment variables. In development, configurations are set in a `.env` file. In production, these are set through Heroku config. Further documentation on the available options can be found in the [Origami Service documentation][service-options].

  * `DYN_CUSTOMER_NAME`: The customer name to use when communicating with the Dynect API.
  * `DYN_USER_NAME`: The user name of the Dynect account to use when communicating with the Dynect API.
  * `DYN_PASSWORD`: The password associated with the user name.
  * `PORT`: The port to run the application on.
  * `NODE_ENV`: The environment to run the application in. One of `production`, `development` (default), or `test` (for use in automated tests).
  * `REGION`: The region the application is running in.
  * `SENTRY_DSN`: The Sentry URL to send error information to.


Operational Documentation
-------------------------

The source documentation for the [runbook](https://dewey.ft.com/origami-usage.html) and [healthcheck endpoints](https://endpointmanager.in.ft.com/manage/origami-usage-eu.herokuapp.com) are stored in the `operational-documentation` folder. These files are pushed to CMDB upon every promotion to production. You can push them to CMDB manually by running the following command:
```sh
make update-cmdb
```


Testing
-------

The tests are split into unit tests and integration tests. To run tests on your machine you'll need to install [Node.js] and run `make install`. Then you can run the following commands:

```sh
make test              # run all the tests
make test-unit         # run the unit tests
```

You can run the unit tests with coverage reporting, which expects 90% coverage or more:

```sh
make test-unit-coverage verify-coverage
```

The code will also need to pass linting on CI, you can run the linter locally with:

```sh
make verify
```

We run the tests and linter on CI, you can view [results on CircleCI][ci]. `make test` and `make lint` must pass before we merge a pull request.


Deployment
----------

The [production][heroku-production-eu] and [QA][heroku-qa] applications run on [Heroku]. We deploy continuously to QA via [CircleCI][ci], you should never need to deploy to QA manually. We use a [Heroku pipeline][heroku-pipeline] to promote QA deployments to production.

You'll need to provide an API key for change request logging. You can get this from the Origami LastPass folder in the note named `Change Request API Keys`. Now deploy the last QA image by running the following:

```sh
CR_API_KEY=<API-KEY> make promote
```


Monitoring
----------

  * [Grafana dashboard][grafana]: graph memory, load, and number of requests
  * [Pingdom check (Production EU)][pingdom-eu]: checks that the EU production app is responding
  * [Sentry dashboard (Production)][sentry-production]: records application errors in the production app
  * [Sentry dashboard (QA)][sentry-qa]: records application errors in the QA app
  * [Splunk (Production)][splunk]: query application logs


Trouble-Shooting
----------------

We've outlined some common issues that can occur in the running of the application:

### What do I do if memory usage is high?

For now, restart the Heroku dynos:

```sh
heroku restart --app origami-usage-eu
```

If this doesn't help, then a temporary measure could be to add more dynos to the production applications, or switch the existing ones to higher performance dynos.

### What if I need to deploy manually?

If you _really_ need to deploy manually, you should only do so to QA. Production deploys should always be a promotion from QA.

You'll need to provide an API key for change request logging. You can get this from the Origami LastPass folder in the note named `Change Request API Keys`. Now deploy to QA using the following:

```sh
CR_API_KEY=<API-KEY> make deploy
```


License
-------

The Financial Times has published this software under the [MIT license][license].



[ci]: https://circleci.com/gh/Financial-Times/origami-usage
[grafana]: http://grafana.ft.com/dashboard/db/origami-usage
[heroku-pipeline]: https://dashboard.heroku.com/pipelines/748923ac-b3c0-4289-a0ac-c26b5a7dbe3a
[heroku-production-eu]: https://dashboard.heroku.com/apps/origami-usage-eu
[heroku-qa]: https://dashboard.heroku.com/apps/origami-usage-qa
[heroku]: https://heroku.com/
[license]: http://opensource.org/licenses/MIT
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[pingdom-eu]: https://my.pingdom.com/newchecks/checks#check=2952910
[production-url]: https://origami-usage.in.ft.com/
[sentry-production]: https://sentry.io/nextftcom/origami-usage-product/
[sentry-qa]: https://sentry.io/nextftcom/origami-usage-qa/
[service-options]: https://github.com/Financial-Times/origami-service#options
[splunk]: https://financialtimes.splunkcloud.com/en-US/app/search/search?q=app%3Dorigami-usage-*
