import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import dynamic from "next/dynamic"

const FriendRequestButton = dynamic(
  () => import("@/components/FriendRequestButton"),
  { ssr: false }
)

export default async function Page({
  params,
}: {
  params: { username: string }
}) {
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey
  )

  const serverSupabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await serverSupabase.auth.getSession()

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("username", params.username)
    .single()

  if (error) {
    return <div>This URL is available for you!</div>
  }

  if (!data) {
    return <div>User not found</div>
  }

  const isOwner = session?.user?.id === data.creator_id
  let connectionLevel = 0
  let alreadyFriends = false

  if (!isOwner) {
    // Query the connections table to determine the connection level
    const { data: connectionData, error: connectionError } = await supabase
      .from("connections")
      .select("permission_level")
      .eq("user_id", data.creator_id)
      .eq("friend_id", session?.user?.id)
      .single()

    if (connectionError) {
      console.log(connectionError)
    }

    if (connectionData) {
      connectionLevel = connectionData.permission_level
      alreadyFriends = true
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">User Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-700">
            <strong>Username:</strong> {data.username}
          </p>
          {isOwner || connectionLevel >= 1 ? (
            <>
              <p className="text-gray-700">
                <strong>First Name:</strong> {data.firstName}
              </p>
              <p className="text-gray-700">
                <strong>Last Name:</strong> {data.lastName}
              </p>
            </>
          ) : null}
          {isOwner || connectionLevel >= 3 ? (
            <p className="text-gray-700">
              <strong>Address:</strong> {data.address}
            </p>
          ) : null}
          {isOwner || connectionLevel >= 1 ? (
            <>
              <p className="text-gray-700">
                <strong>Facebook:</strong> {data.facebook}
              </p>
              <p className="text-gray-700">
                <strong>Twitter:</strong> {data.twitter}
              </p>
              <p className="text-gray-700">
                <strong>Instagram:</strong> {data.instagram}
              </p>
              <p className="text-gray-700">
                <strong>Bio:</strong> {data.bio}
              </p>
            </>
          ) : null}
          {isOwner || connectionLevel >= 2 ? (
            <p className="text-gray-700">
              <strong>Email:</strong> {data.email}
            </p>
          ) : null}
          {isOwner || connectionLevel >= 3 ? (
            <p className="text-gray-700">
              <strong>Phone:</strong> {data.phone}
            </p>
          ) : null}
          {isOwner || connectionLevel >= 2 ? (
            <p className="text-gray-700">
              <strong>Date of Birth:</strong> {data.dob}
            </p>
          ) : null}
        </div>
      </div>
      {!isOwner && !alreadyFriends && (
        <>
          <FriendRequestButton session={session} creatorId={data.creator_id} />
        </>
      )}
      {!isOwner && alreadyFriends && (
        <p className="text-gray-700">You are already friends!</p>
      )}
    </div>
  )
}
