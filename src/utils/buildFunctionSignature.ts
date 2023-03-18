import { JsonFragment, JsonFragmentType } from '@ethersproject/abi'

// eslint-disable-next-line
const buildSignature = (functionName: string, inputData: JsonFragmentType[]) => {
  let signature = functionName + '('
  inputData.map((input, index) => {
    if (index > 0) signature += ',' + input.type + ' ' + input.name
    else signature += input.type + ' ' + input.name
  })
  return signature + ')'
}

// eslint-disable-next-line
const buildRawSignature = (functionName: string, inputData: JsonFragmentType[]) => {
  let signature = functionName + '('
  inputData.map((input, index) => {
    if (index > 0) signature += ',' + input.type
    else signature += input.type
  })
  return signature + ')'
}

// eslint-disable-next-line
const buildRawSignatureFromFunction = (
  functionObject: JsonFragment | { name: string; inputs?: JsonFragmentType[] }
) => {
  if (!functionObject) return ''
  if (!functionObject.name) return ''
  if (!functionObject.inputs) return functionObject.name + '()'
  let signature = functionObject.name + '('
  functionObject.inputs.map((input, index: number) => {
    if (index > 0) signature += ',' + input.type
    else signature += input.type
  })
  return signature + ')'
}

export { buildSignature, buildRawSignature, buildRawSignatureFromFunction }
