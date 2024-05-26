import { createClient } from "@supabase/supabase-js"

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

  return <div>My Post: {data.username}</div>
}
