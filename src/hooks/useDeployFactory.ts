import { useState } from 'react'
import { useDeployContract, usePublicClient, useWriteContract } from 'wagmi'
import { toast } from 'sonner'
import MyMultiSigFactoryAbi from 'mymultisig-contract/abi/MyMultiSigFactory.json'
import MyMultiSigDeployerAbi from 'mymultisig-contract/abi/MyMultiSigDeployer.json'
import MyMultiSigExtendedDeployerAbi from 'mymultisig-contract/abi/MyMultiSigExtendedDeployer.json'

import deployArtifacts from '../constants/factoryDeployArtifacts.json'

export const DEPLOY_STEP_LABELS = [
  'Deploy MyMultiSigDeployer',
  'Deploy MyMultiSigExtendedDeployer',
  'Deploy MyMultiSigFactory',
  'Initialize the factory'
]

// The factory keeps its runtime under the EIP-170 limit by delegating the
// actual `new MyMultiSig(...)` calls to two external deployer contracts, so a
// community deployment is a 4-step sequence: both deployers, then the factory
// pointed at them, then initialize().
const useDeployFactory = (chainName: string) => {
  const publicClient = usePublicClient()
  const { deployContractAsync, isPending: isDeployPending, reset: resetDeploy } = useDeployContract()
  const { writeContractAsync, isPending: isWritePending, reset: resetWrite } = useWriteContract()
  const [step, setStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined)
  const [deployedAddress, setDeployedAddress] = useState<`0x${string}` | undefined>(undefined)
  const [error, setError] = useState<Error | null>(null)

  const deployOne = async (abi: unknown[], bytecode: `0x${string}`, args?: unknown[]) => {
    if (!publicClient) throw new Error('No public client')
    const txHash = await deployContractAsync({ abi, bytecode, args } as never)
    setHash(txHash)
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1,
      timeout: 120_000
    })
    if (!receipt.contractAddress) throw new Error('Deployment receipt has no contract address')
    return receipt.contractAddress
  }

  const deploy = async () => {
    if (!publicClient || isRunning) return
    setIsRunning(true)
    setError(null)
    try {
      setStep(1)
      toast.info(`Deploying MyMultiSigDeployer on ${chainName} (1/4)…`)
      const deployer = await deployOne(
        MyMultiSigDeployerAbi,
        deployArtifacts.MyMultiSigDeployer.bytecode as `0x${string}`
      )
      setStep(2)
      toast.info(`Deploying MyMultiSigExtendedDeployer on ${chainName} (2/4)…`)
      const extendedDeployer = await deployOne(
        MyMultiSigExtendedDeployerAbi,
        deployArtifacts.MyMultiSigExtendedDeployer.bytecode as `0x${string}`
      )
      setStep(3)
      toast.info(`Deploying MyMultiSigFactory on ${chainName} (3/4)…`)
      const factory = await deployOne(
        MyMultiSigFactoryAbi,
        deployArtifacts.MyMultiSigFactory.bytecode as `0x${string}`,
        [deployer, extendedDeployer]
      )
      setStep(4)
      toast.info(`Initializing the factory (4/4)…`)
      const initHash = await writeContractAsync({
        address: factory,
        abi: MyMultiSigFactoryAbi,
        functionName: 'initialize'
      })
      setHash(initHash)
      await publicClient.waitForTransactionReceipt({ hash: initHash, confirmations: 1, timeout: 120_000 })
      setDeployedAddress(factory)
      toast.success(`Factory deployed on ${chainName}`)
    } catch (deployError) {
      console.error('Factory deployment error', deployError)
      setError(deployError as Error)
      toast.error(`The factory could not be deployed on ${chainName}.`)
    } finally {
      setIsRunning(false)
    }
  }

  const reset = () => {
    setStep(0)
    setIsRunning(false)
    setHash(undefined)
    setDeployedAddress(undefined)
    setError(null)
    resetDeploy()
    resetWrite()
  }

  return {
    deploy,
    reset,
    hash,
    error,
    isPending: isDeployPending || isWritePending,
    isRunning,
    step,
    totalSteps: DEPLOY_STEP_LABELS.length,
    isDeployed: deployedAddress != null,
    deployedAddress
  }
}

export default useDeployFactory
