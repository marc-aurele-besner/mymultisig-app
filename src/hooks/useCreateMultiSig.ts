import { useContractWrite, usePrepareContractWrite } from 'wagmi'
import MyMultiSigFactory from 'mymultisig-contract/abi/MyMultiSigFactory.json'

const useCreateMultiSig = (
  argument: {
    contractName: string
    owners: string[]
    threshold: number
  },
  multiSigFactoryAddress: `0x${string}`,
) => {
  const { config } = usePrepareContractWrite({
    address: multiSigFactoryAddress,
    abi: MyMultiSigFactory,
    functionName: 'createMultiSig',
    args: [argument.contractName, argument.owners, argument.threshold],
  })
  const { data, isLoading, isSuccess, write } = useContractWrite(config)

  return {
    data,
    isLoading,
    isSuccess,
    write,
  }
}

export default useCreateMultiSig
