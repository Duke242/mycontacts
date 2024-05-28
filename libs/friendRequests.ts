"use server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

export async function sendFriendRequest(senderId: string, receiverId: string) {
  const supabase = createServerComponentClient({ cookies })

  // Check if the sender and receiver are the same
  if (senderId === receiverId) {
    return {
      type: "error",
      message: "You cannot send a friend request to yourself.",
    }
  }

  // Check if a friend request already exists
  const { data: existingRequest, error: existingRequestError } = await supabase
    .from("friend_requests")
    .select("*")
    .eq("sender_id", senderId)
    .eq("receiver_id", receiverId)
    .single()

  if (existingRequestError && existingRequestError.code !== "PGRST116") {
    console.log(existingRequestError)
    return {
      type: "error",
      message: `Failed to check existing friend request: ${existingRequestError.message}`,
    }
  }

  if (existingRequest) {
    return { type: "error", message: "Friend request already sent." }
  }

  // Insert the friend request
  const { data, error } = await supabase
    .from("friend_requests")
    .insert([{ sender_id: senderId, receiver_id: receiverId }])
    .select()

  if (error) {
    console.log(error)
    return {
      type: "error",
      message: `Failed to send friend request: ${error.message}`,
    }
  }

  return { type: "success", data }
}

export async function getFriendRequests(userId: string) {
  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase
    .from("friend_requests")
    .select("id, sender_id,sender_email") // Include sender_email in the selection
    .eq("receiver_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.log(error)
    return {
      type: "error",
      message: `Failed to fetch friend requests: ${error.message}`,
    }
  }

  return { type: "success", data }
}

export async function respondToFriendRequest(
  requestId: string,
  accept: boolean
) {
  const supabase = createServerComponentClient({ cookies })

  try {
    if (accept) {
      const { data, error } = await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", requestId)
        .select()

      if (error) {
        console.log(error)
        return {
          type: "error",
          message: `Failed to accept friend request: ${error.message}`,
        }
      }

      return { type: "success", data }
    } else {
      const { error } = await supabase
        .from("friend_requests")
        .delete()
        .eq("id", requestId)

      if (error) {
        console.log(error)
        return {
          type: "error",
          message: `Failed to reject friend request: ${error.message}`,
        }
      }

      return { type: "success" }
    }
  } catch (error) {
    console.log(error)
    return {
      type: "error",
      message: `An error occurred while responding to the friend request: ${error.message}`,
    }
  }
}
