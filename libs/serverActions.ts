"use server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

interface FormData {
  firstName: string
  lastName: string
  username: string
  address: string
  facebook: string
  twitter: string
  instagram: string
  bio: string
  email: string // Type notation for email as string
  phone: number
  dob: null
}

export async function addProfile(formData: FormData) {
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey
  )

  const supabaseUser = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabaseUser.auth.getSession()

  const { data, error } = await supabase
    .from("user_profiles")
    .insert([{ ...formData, creator_id: session.user.id }])
    .select()

  if (error) {
    console.log(error)
    if (error.code === "23505") {
      // Error message indicates that the username is already taken
      return {
        code: "23505",
        type: "error",
        message:
          "Username is already taken. Please choose a different username.",
      }
    } else {
      // For other errors, return a generic error message
      return { type: "error", message: `Failed to add word: ${error.message}` }
    }
  }
}
