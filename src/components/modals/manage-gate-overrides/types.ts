export type OverrideType = 'pass' | 'fail'

export interface GateOverrides {
  passingUserIDs: string[]
  failingUserIDs: string[]
}

export interface AddGateOverrideParams {
  userId: string
  type: OverrideType
  environment?: string | null
  idType?: string | null
}

export interface DeleteGateOverrideParams {
  userId: string
  type: OverrideType
  environment?: string | null
  idType?: string | null
}
