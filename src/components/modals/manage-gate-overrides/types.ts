export type OverrideType = 'pass' | 'fail'

export interface GateOverrides {
  passingUserIDs: string[]
  failingUserIDs: string[]
}
