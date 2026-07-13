import React, { useEffect } from 'react'
import { type Chain } from 'viem/chains'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon, ExternalLinkIcon } from '../icons/ChakraIcons'
import NetworkIcon from '../icons/NetworkIcon'
import contractConstants from 'mymultisig-contract/constants'
import useDeployFactory, { DEPLOY_STEP_LABELS } from '../../hooks/useDeployFactory'
import deployArtifacts from '../../constants/factoryDeployArtifacts.json'
import useMultiSigs from '../../states/multiSigs'
import { type NetworkStatus } from '../../constants/networkStatus'

const statusExplanation: Record<Exclude<NetworkStatus, 'active'>, (name: string) => string> = {
  planned: (name) =>
    `Support for ${name} is planned but the factory contract that creates multisig wallets is not deployed there yet. Anyone can deploy it.`,
  'not-supported': (name) =>
    `${name} is not supported: the factory contract that creates multisig wallets was never deployed there. If you need it, you can deploy it yourself.`
}

interface DeployFactoryModalProps {
  chain: Chain
  status: Exclude<NetworkStatus, 'active'>
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DeployFactoryModal: React.FC<DeployFactoryModalProps> = ({ chain, status, open, onOpenChange }) => {
  const { isConnected } = useAccount()
  const currentChainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const { deploy, reset, isPending, isRunning, step, totalSteps, isDeployed, deployedAddress, hash } =
    useDeployFactory(chain.name)
  const { addMultiSigFactory, multiSigFactory } = useMultiSigs()

  const onCorrectChain = currentChainId === chain.id
  const explorerUrl = chain.blockExplorers?.default?.url

  // Make the network usable locally right away; the GitHub issue below gets it
  // shipped for everyone.
  useEffect(() => {
    if (isDeployed && deployedAddress != null) {
      if (!multiSigFactory.some((f) => f.chainId === chain.id && f.address.toLowerCase() === deployedAddress.toLowerCase())) {
        addMultiSigFactory({
          chainId: chain.id,
          chainName: chain.name,
          address: deployedAddress,
          name: contractConstants.CONTRACT_FACTORY_NAME,
          version: contractConstants.CONTRACT_FACTORY_VERSION,
          multiSigCount: 0
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeployed, deployedAddress])

  const registerIssueUrl =
    'https://github.com/marc-aurele-besner/mymultisig-contract/issues/new' +
    `?title=${encodeURIComponent(`Register MyMultiSigFactory deployment on ${chain.name}`)}` +
    `&body=${encodeURIComponent(
      `Network: ${chain.name} (chainId ${chain.id})\nFactory address: ${deployedAddress ?? ''}\nLast deployment tx: ${hash ?? ''}\n\nDeployed from mymultisig.app (deployers + factory) with the bytecode built from ${deployArtifacts.sourceCommit}.`
    )}`

  const close = (nextOpen: boolean) => {
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent showClose={true} className="max-w-[480px] border-border bg-card/98 backdrop-blur-xl">
        <DialogHeader className="pb-2 pt-6">
          <DialogTitle className="flex items-center gap-3">
            <NetworkIcon chainId={chain.id} name={chain.name} size={28} />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Deploy the factory on {chain.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pb-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {statusExplanation[status](chain.name)}
          </p>

          {isDeployed && deployedAddress ? (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircleIcon className="h-4 w-4 text-primary" />
                Factory deployed
              </span>
              <span className="break-all font-mono text-xs text-muted-foreground">{deployedAddress}</span>
              <div className="flex flex-wrap gap-3">
                {explorerUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`${explorerUrl}/address/${deployedAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-1.5"
                    >
                      View on explorer
                      <ExternalLinkIcon className="h-3 w-3" />
                    </a>
                  </Button>
                )}
                <Button size="sm" asChild>
                  <a href={registerIssueUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                    Register this deployment
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </Button>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Registering opens a GitHub issue so the address ships with the next app release and the
                network becomes active for everyone.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {!isConnected ? (
                <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                  Connect a wallet (top right) to deploy. Deploying costs gas on {chain.name}.
                </p>
              ) : !onCorrectChain ? (
                <Button
                  size="lg"
                  disabled={isSwitching}
                  onClick={() => switchChain({ chainId: chain.id })}
                  className="w-full"
                >
                  {isSwitching ? 'Switching…' : `Switch to ${chain.name}`}
                </Button>
              ) : (
                <Button size="lg" disabled={isRunning} onClick={deploy} className="w-full">
                  {isRunning
                    ? isPending
                      ? `Confirm in your wallet… (${step}/${totalSteps})`
                      : `${DEPLOY_STEP_LABELS[Math.max(step - 1, 0)]}… (${step}/${totalSteps})`
                    : 'Deploy the factory'}
                </Button>
              )}
              <p className="text-xs leading-relaxed text-muted-foreground">
                Deploys the open-source MyMultiSig deployers and factory ({deployArtifacts.compiler}) from
                your wallet in {totalSteps} transactions. Gas is the only cost.
              </p>
              {!onCorrectChain && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="self-start text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    switchChain({ chainId: chain.id })
                    close(false)
                  }}
                >
                  Switch to {chain.name} without deploying
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeployFactoryModal
