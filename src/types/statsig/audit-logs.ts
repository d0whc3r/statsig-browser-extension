export interface AuditLog {
  id: string
  name: string
  changeLog: string
  actionType: string
  date: string
  time: string
  updatedBy: string
  updatedByUserID: string
  modifierEmail: string
  changes?: {
    rules?: {
      new: unknown[]
      old: unknown[]
    }
  }
  tags: string[]
  targetAppIDs: string[]
}
