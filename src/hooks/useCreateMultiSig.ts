import { useNetwork, useContractWrite, usePrepareContractWrite } from 'wagmi'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'

const useCreateMultiSig = (
  argument: {
    contractName: string
    owners: string[]
    threshold: number
  },
  multiSigFactoryAddress: `0x${string}`,
) => {
  const { chain } = useNetwork()
  const { config } = usePrepareContractWrite({
    chainId: chain?.id,
    address: multiSigFactoryAddress,
    abi: MyMultiSigFactory,
    functionName: 'createMultiSig',
    args: [argument.contractName, argument.owners, argument.threshold],
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
    status,
  }
}

export default useCreateMultiSig
