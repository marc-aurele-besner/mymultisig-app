import { useDeployContract, useWaitForTransactionReceipt } from 'wagmi'
import { toast } from 'sonner'
import MyMultiSigFactoryAbi from '../constants/abi/MyMultiSigFactory.json'

import factoryArtifact from '../constants/factoryArtifact.json'

const useDeployFactory = (chainName: string) => {
  const { data: hash, error, isPending, deployContract, reset } = useDeployContract({
    mutation: {
      onSuccess: () => {
        toast.info(`Deploying the factory on ${chainName}…`)
      },
      onError: (deployError) => {
        console.error('Factory deployment error', deployError)
        toast.error(`The factory could not be deployed on ${chainName}.`)
      }
    }
  })

  const { data: receipt, isSuccess: isDeployed } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
    timeout: 120_000,
    query: { enabled: !!hash }
  })

  const deploy = () => {
    deployContract({
      abi: MyMultiSigFactoryAbi,
      bytecode: factoryArtifact.bytecode as `0x${string}`
    })
  }

  return {
    deploy,
    reset,
    hash,
    error,
    isPending,
    isDeployed,
    deployedAddress: receipt?.contractAddress ?? undefined
  }
}

export default useDeployFactory
