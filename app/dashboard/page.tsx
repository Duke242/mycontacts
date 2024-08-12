import ButtonAccount from "@/components/ButtonAccount"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Subscribe from "@/components/Subscribe"
import UserForm from "@/components/UserForm"
import Admin from "@/components/Admin"

export const dynamic = "force-dynamic"

export default async function Dashboard() {
  interface Profile {
    has_access: boolean
    username: string
    // Add other properties as needed
  }
  try {
    const supabase = createServerComponentClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("has_access")
      .eq("id", session.user.id)
      .single()

    const { data: userProfile, error: userProfileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("creator_id", session.user.id)
      .single()

    if (userProfileError) {
    }

    if (profileError) {
    }

    const userAccess = profiles.has_access
    const username = userProfile?.username

    if (username) {
      return (
        <main
          className="min-h-screen p-8 pb-24"
          style={{ backgroundImage: "url(/bg.png)" }}
        >
          <header className="max-w-xl mr-auto space-y-8 flex align-center mb-0">
            <ButtonAccount />
          </header>
          <section>
            <Admin initialProfile={userProfile} session={session.user.id} />
          </section>
        </main>
      )
    }

    if (userAccess) {
      return (
        <main className="min-h-screen p-8 pb-24 bg-blue-50">
          <header className="max-w-xl mr-auto space-y-8 flex align-center mb-0">
            <ButtonAccount />
          </header>
          <section>
            <UserForm />
          </section>
        </main>
      )
    } else {
      return <Subscribe />
    }
  } catch (error) {
    console.error("Error in Dashboard:", error.message)
    return <Subscribe />
  }
}
