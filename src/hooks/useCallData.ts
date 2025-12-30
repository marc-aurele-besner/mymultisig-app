import { Contract } from 'ethers'
import { useSigner } from 'wagmi'
import { JsonFragment } from '@ethersproject/abi'

import { buildRawSignatureFromFunction } from '../utils/buildFunctionSignature'

const useCallData = (
  abi: JsonFragment[] | null,
  functionSignature: string,
  targetContract: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  functionArguments: any
) => {
  const { data: signer } = useSigner()
  let callData = ''
  let argumentsString = ''
  try {
    if (abi && signer && functionArguments) {
      const functionSelected = abi.find((abiObject) => buildRawSignatureFromFunction(abiObject) === functionSignature)
      const contractTargetInstance = new Contract(targetContract, abi, signer)
      if (abi !== null && functionSelected) {
        if (functionSelected.inputs == undefined || functionSelected.inputs.length === 0) {
          callData = contractTargetInstance.interface.encodeFunctionData(functionSignature)
        } else {
          const inputArray = functionSelected.inputs.map((input) => {
            if (input.type && input.type.includes('[')) {
              return JSON.parse(functionArguments[`${input.name}`])
            } else return functionArguments[`${input.name}`]
          })
          argumentsString = functionSelected.inputs.map((obj) => obj.name).join(', ')
          callData = contractTargetInstance.interface.encodeFunctionData(functionSignature, inputArray)
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
