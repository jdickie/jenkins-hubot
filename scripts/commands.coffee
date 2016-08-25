JenkinsClient = require('../lib/jenkinsClient.js')
BuildAsColor = require('../lib/BuildAsColor.js')
UpdateFile = require('../lib/UpdateFile.js')
lodash = require('lodash')
config = require('config')

buildAsColor = new BuildAsColor()
fileUpdate = new UpdateFile()
client = new JenkinsClient()

module.exports = (robot) ->

  robot.respond /status ([A-z\-]+[0-9]*)/, (res) ->
    environment = res.match[1]
    if lodash.isUndefined(config.get("Jobs." + environment + ".all"))
      res.send("I'm not as familiar with " + environment)

    client.getMultiJobTestStatus ((err, results) ->
      if !lodash.isUndefined(results) && !lodash.isEmpty(results)
        res.send(generateResponseMessage(results))
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
        res.send(generateResponseMessage(results))
      else
        res.send("/shrug Sorry I didn't find anything on " + codebase + " for " + environment)
    ), environment, codebase


  robot.respond /lightshow ([A-z]+) ([A-z\-]+[0-9]*)/, (res) ->
    codebase = res.match[1]
    environment = res.match[2]
    if lodash.isUndefined(config.get("Jobs." + environment))
      res.send("I'm not as familiar with " + environment)
    if lodash.isUndefined(config.get("Jobs." + environment + "." + codebase))
      res.send("I'm not familiar with " + codebase + " on " + environment)

    client.getMultiJobSubJobStatuses ((err, results) ->
      if !lodash.isUndefined(results) && !lodash.isEmpty(results)
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
        ), environment
      else
        res.send("/shrug Sorry I didn't find anything on " + codebase + " for " + environment)
    ), environment, codebase

  generateResponseMessage = (results) ->
    responseMsg = "Status: \n"
    passing = 0
    failing = 0
    failingText = "Failing tests:\n"

    lodash.forIn results, ((color, name) ->
      if buildAsColor.getBoolean(color)
        passing += 1
      else
        failing += 1
        failingText += name + " :facepalm: \n"
    )

    percentPassing = (passing / (passing + failing)) * 100
    responseMsg += percentPassing + "% passing"
    if failing
      responseMsg += "\n with these failing:\n" + failingText

    return responseMsg
