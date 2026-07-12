import { useWalletClient } from 'wagmi'
import { JsonFragment } from '@ethersproject/abi'
import { encodeFunctionData, type Abi } from 'viem'

import { buildRawSignatureFromFunction } from '../utils/buildFunctionSignature'

const useCallData = (
  abi: JsonFragment[] | null,
  functionSignature: string,
  targetContract: string,
   
  functionArguments: any
) => {
  const { data: walletClient } = useWalletClient()
  let callData = ''
  let argumentsString = ''
  try {
    if (abi && walletClient && functionArguments) {
      const functionSelected = abi.find((abiObject) => buildRawSignatureFromFunction(abiObject) === functionSignature)
      if (abi !== null && functionSelected) {
        if (functionSelected.inputs == undefined || functionSelected.inputs.length === 0) {
          callData = encodeFunctionData({
            abi: abi as Abi,
            functionName: functionSignature.split('(')[0] as any,
            args: []
          })
        } else {
          const inputArray = functionSelected.inputs.map((input) => {
            if (input.type && input.type.includes('[')) {
              return JSON.parse(functionArguments[`${input.name}`])
            } else return functionArguments[`${input.name}`]
          })
          argumentsString = functionSelected.inputs.map((obj) => obj.name).join(', ')
          callData = encodeFunctionData({
            abi: abi as Abi,
            functionName: functionSignature.split('(')[0] as any,
            args: inputArray
          })
        }
        return { callData, functionSignature, argumentsString }
      }
    }
  } catch (error) {
    console.log(error)
  }
  return { callData: null, functionSignature: null, argumentsString: null }
}

export default useCallData
