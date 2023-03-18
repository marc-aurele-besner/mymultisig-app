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
    if (functionSignature && abi && signer) {
      const functionSelected = abi.find((abiObject) => buildRawSignatureFromFunction(abiObject) === functionSignature)
      const contractTargetInstance = new Contract(targetContract, abi, signer)
      if (abi !== null && functionSelected) {
        if (functionSelected.inputs == undefined || functionSelected.inputs.length === 0) {
          callData = contractTargetInstance.interface.encodeFunctionData(functionSignature)
        } else {
          const inputArray = Array.from({ length: functionSelected.inputs.length }, (_, i) => {
            if (functionSelected.inputs[i].type.includes('['))
              return JSON.parse(functionArguments[functionSelected.inputs[i].name])
            else return functionArguments[functionSelected.inputs[i].name]
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
