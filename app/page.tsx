import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BookOpen, Lock, Users, Zap } from "lucide-react"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Your Private Journal</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A secure, personal space to capture your thoughts, memories, and reflections. Designed for privacy and
            simplicity.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/signin">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>

        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Lock className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Private & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Your entries are completely private. Only you can access your journal.</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Dynamic Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Add custom fields like mood, weather, or gratitude to personalize your entries.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Rich Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create detailed entries with titles, content, tags, and custom metadata.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Multi-User</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Perfect for small groups while keeping each person's journal completely private.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Ready to start journaling?</CardTitle>
              <CardDescription>Join our private journal community today.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
