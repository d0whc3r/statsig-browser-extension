export const HypothesisSection = ({ hypothesis }: { hypothesis?: string }) => (
  <div className="space-y-2 pt-4">
    <h3 className="text-lg font-semibold">Hypothesis</h3>
    <p className="text-sm text-muted-foreground">{hypothesis || 'Hypothesis not set.'}</p>
  </div>
)
