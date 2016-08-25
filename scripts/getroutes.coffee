JenkinsClient = require('../lib/jenkinsClient.js')
BuildAsColor = require('../lib/BuildAsColor.js')
UpdateFile = require('../lib/UpdateFile.js')
TestReport = require('../lib/TestReport.js')
_ = require('lodash')
config = require('config')


buildAsColor = new BuildAsColor()
fileUpdate = new UpdateFile()
client = new JenkinsClient()
report = new TestReport();

module.exports = (robot) ->
  robot.router.post '/higginsbot/job/:environment/:codebase/:name/status', (req, res) ->
    params =
      environment: req.params.environment
      codebase: req.params.codebase
      name: req.params.name

    client.getStatusOneJob ((err, status) ->
      if err
        res.send(err)

        res.send(status)
    ), params
