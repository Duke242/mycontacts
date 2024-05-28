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

  const connectionLevel = connectionData?.permission_level || 0

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">User Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-700">
            <strong>Username:</strong> {data.username}
          </p>
          <p className="text-gray-700">
            <strong>First Name:</strong>{" "}
            {connectionLevel >= 1 ? data.firstName : "******"}
          </p>
          <p className="text-gray-700">
            <strong>Last Name:</strong>{" "}
            {connectionLevel >= 1 ? data.lastName : "******"}
          </p>
          <p className="text-gray-700">
            <strong>Address:</strong>{" "}
            {connectionLevel >= 2 ? data.address : "******"}
          </p>
        </div>
        <div>
          <p className="text-gray-700">
            <strong>Facebook:</strong>{" "}
            {connectionLevel >= 1 ? data.facebook : "******"}
          </p>
          <p className="text-gray-700">
            <strong>Twitter:</strong>{" "}
            {connectionLevel >= 1 ? data.twitter : "******"}
          </p>
          <p className="text-gray-700">
            <strong>Instagram:</strong>{" "}
            {connectionLevel >= 1 ? data.instagram : "******"}
          </p>
          <p className="text-gray-700">
            <strong>Bio:</strong> {connectionLevel >= 1 ? data.bio : "******"}
          </p>
        </div>
        <div>
          <p className="text-gray-700">
            <strong>Email:</strong>{" "}
            {connectionLevel >= 2 ? data.email : "******"}
          </p>
          <p className="text-gray-700">
            <strong>Phone:</strong>{" "}
            {connectionLevel >= 2 ? data.phone : "******"}
          </p>
          <p className="text-gray-700">
            <strong>Date of Birth:</strong>{" "}
            {connectionLevel >= 2 ? data.dob : "******"}
          </p>
        </div>
      </div>
      {!isOwner && (
        <>
          <FriendRequestButton session={session} creatorId={data.creator_id} />
        </>
      )}
    </div>
  )
}
