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
  phone: number | undefined
  dob: string | undefined
}

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey)

const supabaseUser = createServerComponentClient({ cookies })

export async function getProfile() {
  const {
    data: { session },
  } = await supabaseUser.auth.getSession()

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("creator_id", session.user.id)
    .single()

  if (error) {
    console.log(error)
    return { type: "error", message: `Failed to get profile: ${error.message}` }
  }

  return { type: "success", data }
}

export async function editProfile(formData: FormData) {
  const {
    data: { session },
  } = await supabaseUser.auth.getSession()

  const { data, error } = await supabase
    .from("user_profiles")
    .update(formData)
    .eq("creator_id", session.user.id)
    .select()

  if (error) {
    console.log(error)
    return {
      type: "error",
      message: `Failed to update profile: ${error.message}`,
    }
  }

  return { type: "success", data }
}

export async function addProfile(formData: FormData) {
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
      return {
        type: "error",
        message: `Failed to add profile: ${error.message}`,
      }
    }
  }

  return { type: "success", data }
}

export async function getUserConnections(session: string) {
  try {
    const { data, error } = await supabase
      .from("connections")
      .select()
      .eq("user_id", session)

    if (error) {
      console.log(error)
      return {
        type: "error",
        message: `Failed to fetch user connections: ${error.message}`,
      }
    }

    return { type: "success", data }
  } catch (error) {
    console.error("Error fetching user connections:", error)
    return {
      type: "error",
      message: "Failed to fetch user connections",
    }
  }
}

export async function changePermissionLevel(
  connectionId: string,
  newPermissionLevel: number
) {
  try {
    console.log({ connectionId, newPermissionLevel })
    const { data, error } = await supabase
      .from("connections")
      .update({ permission_level: newPermissionLevel })
      .eq("id", connectionId)

    if (error) {
      console.log(error)
      return {
        type: "error",
        message: `Failed to change permission level: ${error.message}`,
      }
    }

    return { type: "success", data }
  } catch (error) {
    console.error("Error changing permission level:", error)
    return {
      type: "error",
      message: "Failed to change permission level",
    }
  }
}
