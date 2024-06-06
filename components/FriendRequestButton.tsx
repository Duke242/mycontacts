"use client"
import React, { useState } from "react"
import { sendFriendRequest } from "@/libs/friendRequests"

interface FriendRequestButtonProps {
  session: any
  creatorId: string
}

const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({
  session,
  creatorId,
}) => {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSendRequest = async () => {
    if (!session || !session.user) {
      setStatus("You need to be logged in to send a friend request.")
      return
    }

    setLoading(true)
    const response = await sendFriendRequest(session.user.id, creatorId)
    setLoading(false)

    if (response.type === "error") {
      setStatus(response.message)
    } else {
      setStatus("Friend request sent successfully!")
    }
  }

  return (
    <div>
      <button
        onClick={handleSendRequest}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Sending..." : "Send Friend Request"}
      </button>
      {status && <p className="mt-2 text-blue-500">{status}</p>}
    </div>
  )
}

export default FriendRequestButton
