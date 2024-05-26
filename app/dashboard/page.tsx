import ButtonAccount from "@/components/ButtonAccount"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Subscribe from "@/components/Subscribe"
import UserForm from "@/components/UserForm"
import Admin from "@/components/Admin"

export const dynamic = "force-dynamic"

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server component which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
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
    console.log({ userProfile })

    const userAccess = profiles.has_access
    const username = userProfile?.username // Add the null check here

    if (username) {
      return <Admin initialProfile={userProfile} />
    }

    if (userAccess) {
      return (
        <main className="min-h-screen p-8 pb-24 bg-base-100">
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
