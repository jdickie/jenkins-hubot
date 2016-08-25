JenkinsClient = require('../lib/jenkinsClient.js')
BuildAsColor = require('../lib/BuildAsColor.js')
UpdateFile = require('../lib/UpdateFile.js')
TestReport = require('../lib/TestReport.js')
lodash = require('lodash')
config = require('config')

buildAsColor = new BuildAsColor()
fileUpdate = new UpdateFile()
client = new JenkinsClient()
report = new TestReport();

module.exports = (robot) ->

  robot.respond /status ([A-z\-]+[0-9]*)/, (res) ->
    environment = res.match[1]
    if lodash.isUndefined(config.get("Jobs." + environment + ".all"))
      res.send("I'm not as familiar with " + environment)

    client.getMultiJobTestStatus ((err, results) ->
      if !lodash.isUndefined(results) && !lodash.isEmpty(results)
        params =
          environment: environment

        report.getHighLevel ((err, txt) ->
          if err
            res.send(err)
          else
            res.send(txt)
        ), results, params
      else
        res.send("/shrug hmmm I dunno")
    ), environment

  robot.respond /status ([A-z]+) ([A-z\-]+[0-9]*)/, (res) ->
    codebase = res.match[1]
    environment = res.match[2]
    if lodash.isUndefined(config.get("Jobs." + environment))
      res.send("I'm not as familiar with " + environment)
    if lodash.isUndefined(config.get("Jobs." + environment + "." + codebase))
      res.send("I'm not familiar with " + codebase + " on " + environment)

    client.getMultiJobSubJobStatuses ((err, results) ->
      if !lodash.isUndefined(results) && !lodash.isEmpty(results)
        params =
          environment: environment
          codebase: codebase

        report.getHighLevel ((err, txt) ->
          if err
            res.send(err)
          else
            res.send(txt)
        ), results, params
      else
        res.send("/shrug Sorry I didn't find anything on " + codebase + " for " + environment)
    ), environment, codebase

  robot.respond /job ([A-z]+) ([A-z\-]+[0-9]*) ([A-z0-9\-]+)/, (res) ->
    params =
      codebase: res.match[1]
      environment: res.match[2]
      name: res.match[3]

    client.getStatusOneJob ((err, data) ->
      if err
        res.send("Whoops, something went wrong")
      report.getSingleJobReport ((err, msg) ->
        if err
          res.send("Whoops something went wrong")

        res.send(msg)
      ), data
    ), params

  robot.respond /(run|build) ([A-z]+) ([A-z\-]+[0-9]*) ([A-z0-9\-]+)/, (res) ->
    codebase = res.match[2]
    environment = res.match[3]
    jobname = res.match[4]

    params =
      codebase: codebase
      environment: environment
      jobname: jobname

    res.send("Running: " + jobname)
    client.runJob ((err, data) ->
      if err
        console.log(err)
        res.send("eh, couldn't do it")
      else
        console.log(data);
        res.send("Job queued")
    ), params

  robot.respond /lightshow ([A-z]+) ([A-z\-]+[0-9]*)/, (res) ->
    codebase = res.match[1]
    environment = res.match[2]
    if lodash.isUndefined(config.get("Jobs." + environment))
      res.send("I'm not as familiar with " + environment)
    if lodash.isUndefined(config.get("Jobs." + environment + "." + codebase))
      res.send("I'm not familiar with " + codebase + " on " + environment)

    client.getMultiJobSubJobStatuses ((err, results) ->
      if !lodash.isUndefined(results) && !lodash.isEmpty(results)
        params =
          environment: environment
          codebase: codebase

        fileUpdate.putRgbFile ((err) ->
          if err
            res.send(err)
          else
            res.send("updated rgb file")
        ), results
        fileUpdate.putEnviromentInfoFile ((err) ->
          if err
            res.send(err)
          else
            res.send("updated environment text file")
        ), params
      else
        res.send("/shrug Sorry I didn't find anything on " + codebase + " for " + environment)
    ), environment, codebase


  robot.respond /help/i, (res) ->
    res.send("Here is a list of things you can ask me to do:\n\n" + "status [stage1|stage4|etc]\nstatus [www|seamus] [stage1|stage4|etc]\nrun/build [www|seamus] [stage1|stage4|etc] [jobName]")


