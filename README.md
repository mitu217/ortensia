# ortensia

management media release calendar

![example1](example1.png)

## Usage

Deploy to CloudFunction and AppEngine

Add another calendar from url! ex) GoogleCalendar, iCalendar...

![example2](example2.png)

![example3](example3.png)

## Deploy

Put `cron/.secrets.yaml` and set following environment variables.
```
env_variables:
  HOURLY_JOB_HOST: '<url_of_your_cloud_function>'
```

```bash
# deployment cloud functions
$ npm run deploy
```

## Development

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev
```
