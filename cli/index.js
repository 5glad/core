#!/usr/bin/env node
const program = require('commander')
const ProxyFactory = require('./ProxyFactory')

program
  .usage("<contractPath> <outputDir>")
  .parse(process.argv)

const contractPath = program.args[0]
const outputDir = program.args[1]
const options = { }

new ProxyFactory(contractPath, outputDir, options).call()
