import axios from 'axios'

if (!process.env.ETHERSCAN_API_KEY) throw new Error('No ETHERSCAN_API_KEY in .env file')

const { ETHERSCAN_API_KEY } = process.env

const FUNCTION = 'getABI'

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
  try {
    console.log('event.body', event.body)

    const response = axios
      .post('https://api.etherscan.io/api', {
        apikey: ETHERSCAN_API_KEY,
        module: 'contract',
        action: 'getabi',
        address: data.contractAddress
      })
      .then(function (response) {
        console.log(response)
      })
      .catch(function (error) {
        console.log(error)
      })
    context.res = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Success',
        response
      })
    }
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
