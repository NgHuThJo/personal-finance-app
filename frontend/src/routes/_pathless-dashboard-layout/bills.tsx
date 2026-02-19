import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_pathless-dashboard-layout/bills')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_pathless-dashboard-layout/bills"!</div>
}
