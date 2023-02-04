export type TSignTypeArgumentsType = 'string' | 'uint8' | 'uint16' | 'uint256'

export type TSignedDataHeader = {
  name: string
  version: string
  chainId: number
  verifyingContract: string
}

export type TSignType = {
  name: string
  type: TSignTypeArgumentsType
}

export type ISignDeleteBlockchainArgumentsName = 'action' | 'details' | 'dbRef' | 'signatureExpiry'

export interface ISignDeleteBlockchainArguments extends TSignType {
  name: ISignDeleteBlockchainArgumentsName
  type: TSignTypeArgumentsType
}

export interface ISignValidateActionHeader {
  validateAction: ISignDeleteBlockchainArguments[]
}

export interface ISignValidateActionBody {
  action: string
  details: string
  dbRef: string
  signatureExpiry: number
}

export type TSignValidateAction = [TSignedDataHeader, ISignValidateActionHeader, ISignValidateActionBody]

export type TApiCallData = {
  collection: string
  action: string
  chainId: number
  details: string
  message: TSignValidateAction
  // eslint-disable-next-line
  data: any
  signer: string
  signature: string
  signatureExpiry: number
}
