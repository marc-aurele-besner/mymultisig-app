import React from 'react'
import { type Chain } from 'viem/chains'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon, ExternalLinkIcon, WarningIcon } from '../icons/ChakraIcons'
import NetworkIcon from '../icons/NetworkIcon'
import useDeployFactory from '../../hooks/useDeployFactory'
import factoryArtifact from '../../constants/factoryArtifact.json'
import { type NetworkStatus } from '../../constants/networkStatus'

const EVM_RUNTIME_CODE_LIMIT = 24576

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
  const { deploy, reset, isPending, isDeployed, deployedAddress, hash } = useDeployFactory(chain.name)

  const onCorrectChain = currentChainId === chain.id
  const oversized = factoryArtifact.deployedBytecodeSize > EVM_RUNTIME_CODE_LIMIT
  const explorerUrl = chain.blockExplorers?.default?.url

  const registerIssueUrl =
    'https://github.com/marc-aurele-besner/mymultisig-contract/issues/new' +
    `?title=${encodeURIComponent(`Register MyMultiSigFactory deployment on ${chain.name}`)}` +
    `&body=${encodeURIComponent(
      `Network: ${chain.name} (chainId ${chain.id})\nFactory address: ${deployedAddress ?? ''}\nDeployment tx: ${hash ?? ''}\n\nDeployed from mymultisig.app with the bytecode built from ${factoryArtifact.sourceCommit}.`
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

          {oversized && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-xs leading-relaxed text-destructive">
                The current factory build is {factoryArtifact.deployedBytecodeSize.toLocaleString()} bytes —
                over the {EVM_RUNTIME_CODE_LIMIT.toLocaleString()}-byte EVM contract size limit — so
                deployment will be rejected on most networks until the contract is slimmed down.
              </p>
            </div>
          )}

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
                <Button size="lg" disabled={isPending || !!hash} onClick={deploy} className="w-full">
                  {isPending
                    ? 'Confirm in your wallet…'
                    : hash
                      ? 'Waiting for confirmation…'
                      : 'Deploy the factory'}
                </Button>
              )}
              <p className="text-xs leading-relaxed text-muted-foreground">
                Deploys the open-source MyMultiSigFactory ({factoryArtifact.compiler}) from your wallet.
                Gas is the only cost.
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
