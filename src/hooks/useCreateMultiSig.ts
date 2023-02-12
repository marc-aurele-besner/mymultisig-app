import { useNetwork, useContractWrite, usePrepareContractWrite } from 'wagmi'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'

import { MultiSigConstructorArgs } from '../models/MultiSigs'

const useCreateMultiSig = (constructorArgs: MultiSigConstructorArgs, multiSigFactoryAddress: `0x${string}`) => {
  console.log('constructorArgs', constructorArgs)
  const { chain } = useNetwork()
  const { config } = usePrepareContractWrite({
    chainId: chain?.id,
    address: multiSigFactoryAddress,
    abi: MyMultiSigFactory,
    functionName: 'createMultiSig',
    args: [constructorArgs.contractName, constructorArgs.owners, constructorArgs.threshold]
  })
  const { data, error, isError, isIdle, isLoading, isSuccess, write, writeAsync, reset, status } =
    useContractWrite(config)

  return {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    write,
    writeAsync,
    reset,
    status
  }
}

export default useCreateMultiSig
