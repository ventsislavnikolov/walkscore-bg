import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-5xl font-bold">
        Walk Score<span className="text-emerald-600">.bg</span>
      </h1>
    </main>
  )
}
