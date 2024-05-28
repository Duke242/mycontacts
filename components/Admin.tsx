"use client"
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react"
import {
  editProfile,
  getUserConnections,
  changePermissionLevel,
} from "@/libs/serverActions"
import {
  getFriendRequests,
  respondToFriendRequest,
} from "@/libs/friendRequests"
import toast from "react-hot-toast"

interface FormData {
  firstName: string
  lastName: string
  username: string
  address: string
  facebook: string
  twitter: string
  instagram: string
  bio: string
  email: string
  phone: number | undefined
  dob: null
}

interface FriendRequest {
  id: string
  senderEmail: string // Added senderEmail to the FriendRequest interface
}

interface Connection {
  id: string
  userId: string
  friend_id: string
  permissionLevel: number
  friend_email: string
}

interface AdminProps {
  initialProfile: FormData
  session: string
}

function Admin({ initialProfile, session }: AdminProps) {
  const [formData, setFormData] = useState<FormData>(initialProfile)
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [connections, setConnections] = useState<Connection[]>([])

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await getFriendRequests(session)
        if (response.type === "success") {
          const formattedFriendRequests = response.data.map((request) => ({
            id: request.id,
            senderEmail: request.sender_email, // Assign senderEmail from the response to the formattedFriendRequests
          }))
          setFriendRequests(formattedFriendRequests)
        } else {
          toast.error(response.message)
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error)
        toast.error("Failed to fetch friend requests")
      }
    }
    fetchFriendRequests()
  }, [initialProfile.email])

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await getUserConnections(session)
        if (response.type === "success") {
          setConnections(response.data)
        } else {
          toast.error(response.message)
        }
      } catch (error) {
        console.error("Error fetching connections:", error)
        toast.error("Failed to fetch connections")
      }
    }
    fetchConnections()
  }, [session])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const response = await editProfile(formData)
    if (response.type === "success") {
      toast.success("Profile updated successfully")
    } else {
      toast.error(response.message)
    }
  }

  const handleFriendRequestResponse = async (
    requestId: string,
    accept: boolean
  ) => {
    const response = await respondToFriendRequest(requestId, accept)
    if (response.type === "success") {
      toast.success(
        `Friend request ${accept ? "accepted" : "rejected"} successfully`
      )
      setFriendRequests(
        friendRequests.filter((request) => request.id !== requestId)
      )
    } else {
      toast.error(response.message)
    }
  }

  return (
    <div className="flex flex-col-reverse justify-center items-center mt-2">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-200 p-8 md:mt-0 mt-4 rounded-lg shadow-2xl w-full max-w-6xl"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Username:
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            readOnly
            className="w-3/4 p-2 border border-gray-300 rounded mt-1 bg-gray-300"
          />
          <p>Your URL: mywebsite.com/{formData.username}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name:
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name:
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address:
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Facebook:
            </label>
            <input
              type="text"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Twitter:
            </label>
            <input
              type="text"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Instagram:
            </label>
            <input
              type="text"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone:
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth:
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio:
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full mx-auto p-2 border border-gray-300 rounded mt-1"
            />
          </div>
        </div>
        <div className="flex">
          <button
            type="submit"
            className="flex inline-flex mx-auto mt-4 justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Profile
          </button>
        </div>
      </form>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Friend Requests</h2>
        {friendRequests.length === 0 ? (
          <p>No friend requests</p>
        ) : (
          <ul>
            {friendRequests.map((request) => (
              <li key={request.id} className="mb-4">
                <p>Sender Email: {request.senderEmail}</p>{" "}
                {/* Display sender's email */}
                <button
                  onClick={() => handleFriendRequestResponse(request.id, true)}
                  className="mr-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleFriendRequestResponse(request.id, false)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Friends</h2>
        <ul>
          {connections.map((connection) => (
            <li key={connection.id} className="mb-4">
              <p>Friend ID: {connection.friend_id}</p>
              <label>
                Permission Level:
                <input
                  type="number"
                  value={connection.permissionLevel}
                  // onChange={(e) =>
                  // handlePermissionLevelChange(e, connection.id)
                  // }
                />
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Admin
