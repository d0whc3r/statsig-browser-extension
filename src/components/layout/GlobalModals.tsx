import { Suspense, lazy, memo } from 'react'

const AuthModal = lazy(() =>
  import('@/src/components/modals/AuthModal').then((module) => ({ default: module.AuthModal })),
)
const ManageExperimentModal = lazy(() =>
  import('@/src/components/modals/manage-experiment/ManageExperimentModal').then((module) => ({
    default: module.ManageExperimentModal,
  })),
)
const AuditLogDetailSheet = lazy(() =>
  import('@/src/components/sheets/AuditLogDetailSheet').then((module) => ({
    default: module.AuditLogDetailSheet,
  })),
)
const DynamicConfigSheet = lazy(() =>
  import('@/src/components/sheets/DynamicConfigSheet').then((module) => ({
    default: module.DynamicConfigSheet,
  })),
)
const ExperimentSheet = lazy(() =>
  import('@/src/components/sheets/ExperimentSheet').then((module) => ({
    default: module.ExperimentSheet,
  })),
)
const FeatureGateSheet = lazy(() =>
  import('@/src/components/sheets/FeatureGateSheet').then((module) => ({
    default: module.FeatureGateSheet,
  })),
)
const SettingsSheet = lazy(() =>
  import('@/src/components/sheets/SettingsSheet').then((module) => ({
    default: module.SettingsSheet,
  })),
)
const UserDetailsSheet = lazy(() =>
  import('@/src/components/sheets/UserDetailsSheet').then((module) => ({
    default: module.UserDetailsSheet,
  })),
)

export const GlobalModals = memo(() => (
  <Suspense fallback={undefined}>
    <AuthModal />
    <ManageExperimentModal />
    <ExperimentSheet />
    <DynamicConfigSheet />
    <FeatureGateSheet />
    <SettingsSheet />
    <UserDetailsSheet />
    <AuditLogDetailSheet />
  </Suspense>
))
GlobalModals.displayName = 'GlobalModals'
