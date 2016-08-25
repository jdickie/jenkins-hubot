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

botStatuses = ["Super.", "Doing pretty well actually!", ":thumbsup:", ":green_apple:", ":green_heart:" ]
greetings = ["Hello", "howdy", "Hey!", "Sup?", ":metal:", ":zzz:", "/giphy hey"]

module.exports = (robot) ->

  robot.respond /h(i|ello)[\sA-z\?]*|((S|s)up)[\sA-z\?]*/i, (res) ->
    res.send res.random greetings

  robot.respond /how are you[\sA-z\?]*/i, (res) ->
    res.send res.random botStatuses

  robot.respond /how is ([A-z]+[0-9]?)[\?]*/i, (res) ->
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

  robot.respond /how is ([A-z]+) on ([A-z]+[0-9]?)[\?]*/i, (res) ->
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

  robot.respond /light up ([a-z]+[0-9])/i, (res) ->
    environment = res.match[1]
    if lodash.isUndefined(config.get("Jobs." + environment))
      res.send("I'm not as familiar with " + environment)

    client.getMultiJobTestStatus ((err, results) ->
      if err
        res.send(err)
      else
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

    ), environment

  robot.respond /¯\\_\(ツ\)_\/¯/, (res) ->
    helpResponse(res)

  robot.respond /I\'m confused/i, (res) ->
    helpResponse(res)

  helpResponse = (res) ->
    res.send("Did you need help? You can ask me things like 'how is stage1?' or 'how is www on stage1?'")

  generateResonseMessage = (results) ->
    responseMsg = "This is what I got: \n"
    lodash.forIn(results, ( (color, name) ->
      status = if lodash.random(0,1) then buildAsColor.getPassOrFailEmoji(color) else buildAsColor.getPassOrFail(color)
      responseMsg += name + " is " + status + "\n"))
    return responseMsg
