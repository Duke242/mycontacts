import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import dynamic from "next/dynamic"
// import { Nunito } from "next/font/google"

const FriendRequestButton = dynamic(
  () => import("@/components/FriendRequestButton"),
  { ssr: false }
)

export default async function Page({
  params,
}: {
  params: { username: string }
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const serverSupabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await serverSupabase.auth.getSession()

  const protectedUrls = [
    "admin",
    "moderator",
    "support",
    "staff",
    "team",
    "dev",
    "developer",
    "maintenance",
    "superuser",
    "root",
  ]
  if (protectedUrls.includes(params.username.toLowerCase())) {
    return <div>This URL is not available for use.</div>
  }

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
    <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-md mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-600">
            Username:
          </label>
          <p className="border rounded p-2 mb-2 shadow">{data.username}</p>
          {isOwner || connectionLevel >= 1 ? (
            <>
              <label className="block text-sm font-medium text-gray-600">
                First Name:
              </label>
              <p className="border rounded p-2 mb-2 shadow">{data.firstName}</p>
              <label className="block text-sm font-medium text-gray-600">
                Last Name:
              </label>
              <p className="border rounded p-2 mb-2 shadow">{data.lastName}</p>
            </>
          ) : null}
          {isOwner || connectionLevel >= 3 ? (
            <>
              <label className="block text-sm font-medium text-gray-600">
                Address:
              </label>
              <p className="border rounded p-2 mb-2 shadow">{data.address}</p>
            </>
          ) : null}
          {isOwner || connectionLevel >= 1 ? (
            <>
              <label className="block text-sm font-medium text-gray-600">
                Facebook:
              </label>
              <p className=" border rounded p-2 mb-2 shadow">{data.facebook}</p>
              <label className="block text-sm font-medium text-gray-600">
                Twitter:
              </label>
              <p className="border rounded p-2 mb-2 shadow">{data.twitter}</p>
              <label className="block text-sm font-medium text-gray-600">
                Instagram:
              </label>
              <p className="border rounded p-2 mb-2 shadow">{data.instagram}</p>
              <label className="block text-sm font-medium text-gray-600">
                Bio:
              </label>
              <p className="border rounded p-2 mb-2 shadow">{data.bio}</p>
            </>
          ) : null}
        </div>
        <div className="col-span-1">
          {isOwner || connectionLevel >= 2 ? (
            <>
              <label className="block text-sm font-medium text-gray-600">
                Email:
              </label>
              <p className="border rounded p-2 mb-2 shadow">{data.email}</p>
            </>
          ) : null}
          {isOwner || connectionLevel >= 3 ? (
            <>
              <label className="block text-sm font-medium text-gray-600">
                Phone:
              </label>
              <p className=" border rounded p-2 mb-2 shadow">{data.phone}</p>
            </>
          ) : null}
          {isOwner || connectionLevel >= 2 ? (
            <>
              <label className="block text-sm font-medium text-gray-600">
                Date of Birth:
              </label>
              <p className="border rounded p-2 mb-2 shadow">{data.dob}</p>
            </>
          ) : null}
        </div>
      </div>
      {!isOwner && !alreadyFriends && (
        <>
          <FriendRequestButton session={session} creatorId={data.creator_id} />
        </>
      )}
      {!isOwner && alreadyFriends && (
        <p className="text-gray-600">You're already connected!</p>
      )}
    </div>
  )
}
