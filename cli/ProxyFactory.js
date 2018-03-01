const fs = require('fs')
const path = require('path')
const parser = require('solidity-parser-antlr')

class ProxyFactory {
  constructor(contractPath, outputDir, options = {}) {
    let stat = fs.statSync(contractPath)
    if(!stat) this.fail(`Could not analyze path ${contractPath}`)
    if(stat.isDirectory()) this.fail(`Given contract path can not be a directory: ${contractPath}`)
    if(path.extname(contractPath).toLowerCase() !== '.sol') this.fail(`Given contract must be a solidity file: ${contractPath}`)

    stat = fs.statSync(outputDir)
    if(!stat) this.fail(`Could not analyze path ${outputDir}`)
    if(!stat.isDirectory()) this.fail(`Given output directory must be a directory: ${outputDir}`)

    this.outputDir = outputDir
    this.contractPath = contractPath
    this.contractData = {}
    this.contractSource = ''
  }

  call() {
    try {
      this.parseContract()
      this.buildStorageContract()
      this.buildBehaviorContract()
      this.buildProxyContract()

    } catch(error) {
      this.fail(error)
    }
  }

  parseContract() {
    console.log("Analyzing contract ", this.contractPath)
    this.contractSource = "".concat(fs.readFileSync(this.contractPath))
    const ast = parser.parse(this.contractSource)
    const storageParser = new StorageParser()
    parser.visit(ast, storageParser)
    this.contractData = { variables: storageParser.variables, name: storageParser.name, pragma: storageParser.pragma }
  }

  buildStorageContract() {
    const storageContractPath = this._outputPath(`${this.contractData.name}Storage.sol`)
    let storageSource = this.contractData.pragma + "\n\ncontract " + this.contractData.name + " {\n"
    this.contractData.variables.forEach(variable => storageSource += `  ${variable}\n`)
    storageSource += "}\n"
    fs.writeFileSync(storageContractPath, storageSource, { flag: 'w' })
  }

  buildBehaviorContract() {
    const behaviorContractPath = this._outputPath(`${this.contractData.name}_V0.sol`)
    let behaviorSource = this.contractSource
    this.contractData.variables.forEach(variable => behaviorSource = behaviorSource.replace(`${variable}\n`, ''))
    fs.writeFileSync(behaviorContractPath, behaviorSource, { flag: 'w' })
  }

  buildProxyContract() {
    // TODO:
  }

  _outputPath(file) {
    return `${this.outputDir}/${file}`.replace(/(\/)+/g, "$1");
  }

  fail(error) {
    console.error(error)
    process.exit(1)
  }
}

class StorageParser {
  constructor() {
    this.name = ''
    this.variables = []
    this.pragma = ''
  }

  PragmaDirective(node) {
    this.pragma = `pragma ${node.name} ${node.value};`
  }

  ContractDefinition(node) {
    this.name = node.name
  }

  VariableDeclaration(node) {
    if(node.isStateVar) {
      let variable = ''
      variable += node.typeName.type === 'Mapping' ? `mapping (${node.typeName.keyType.name} => ${node.typeName.valueType.name})` : node.typeName.name
      variable += node.visibility === 'default' ? '' : ` ${node.visibility}`
      variable += ` ${node.name};`
      this.variables.push(variable)
    }
  }
}

module.exports = ProxyFactory