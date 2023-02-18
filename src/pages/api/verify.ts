import axios from 'axios'

import Contract from '../../constants/FlatMyMultiSig'

if (!process.env.ETHERSCAN_API_KEY) throw new Error('No ETHERSCAN_API_KEY in .env file')

const { ETHERSCAN_API_KEY } = process.env

const FUNCTION = 'verify'

// eslint-disable-next-line
const handler = async (event: any, context: any) => {
  console.log('Function `%s` invoked', FUNCTION)
  const data = JSON.parse(event.body)
  if (data.contractAddress === undefined) {
    context.res = {
      statusCode: 200,
      body: JSON.stringify({
        error: 'No contract address provided'
      })
    }
    return
  }
  if (data.constructorArgs === undefined) {
    context.res = {
      statusCode: 200,
      body: JSON.stringify({
        error: 'No constructor args provided'
      })
    }
    return
  }
  if (data.constructorArgs.contractName === undefined) {
    context.res = {
      statusCode: 200,
      body: JSON.stringify({
        error: 'No contract name provided'
      })
    }
    return
  }
  if (data.constructorArgs.owners === undefined) {
    context.res = {
      statusCode: 200,
      body: JSON.stringify({
        error: 'No owners provided'
      })
    }
    return
  }
  if (data.constructorArgs.threshold === undefined) {
    context.res = {
      statusCode: 200,
      body: JSON.stringify({
        error: 'No threshold provided'
      })
    }
    return
  }

  try {
    console.log('event.body', event.body)

    axios
      .post('//api.etherscan.io/api', {
        apikey: ETHERSCAN_API_KEY, //A valid API-Key is required
        module: 'contract', //Do not change
        action: 'verifysourcecode', //Do not change
        contractaddress: data.contractAddress, //Contract Address starts with 0x...
        sourceCode: `${Contract.Flat}`, //Contract Source Code (Flattened if necessary)
        codeformat: 'solidity-single-file', //solidity-single-file (default) or solidity-standard-json-input (for std-input-json-format support
        contractname: data.constructorArgs.contractName, //ContractName (if codeformat=solidity-standard-json-input, then enter contractname as ex: erc20.sol:erc20)
        compilerversion: '0.8.18', // see https://etherscan.io/solcversions for list of support versions
        optimizationUsed: 1, //0 = No Optimization, 1 = Optimization used (applicable when codeformat=solidity-single-file)
        runs: 200, //set to 200 as default unless otherwise  (applicable when codeformat=solidity-single-file)
        constructorArguements: [
          data.constructorArgs.contractName,
          data.constructorArgs.owners,
          data.constructorArgs.threshold
        ], //if applicable
        evmversion: '', //leave blank for compiler default, homestead, tangerineWhistle, spuriousDragon, byzantium, constantinople, petersburg, istanbul (applicable when codeformat=solidity-single-file)
        licenseType: 3 //Valid codes 1-14 where 1=No License .. 14=Business Source License 1.1, see https://etherscan.io/contract-license-types
      })
      .then(function (response) {
        console.log(response)
      })
      .catch(function (error) {
        console.log(error)
      })
  } catch (error) {
    context.res = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Error'
      })
    }
  }
}

export default handler
