"use client"
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react"
import toast from "react-hot-toast"
import {
  editProfile,
  getUserConnections,
  changePermissionLevel,
} from "@/libs/serverActions"
import {
  getFriendRequests,
  removeFriend,
  respondToFriendRequest,
} from "@/libs/friendRequests"
import { IoIosNotifications } from "react-icons/io"
import { FaUserFriends } from "react-icons/fa"
import { Tooltip as ReactTooltip } from "react-tooltip"

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
  dob: string | undefined
}

interface FriendRequest {
  id: string
  senderEmail: string
}

interface Connection {
  id: string
  userId: string
  friend_id: string
  permission_level: number
  friend_email: string
}

interface AdminProps {
  initialProfile: FormData
  session: string
}

interface ConnectionListProps {
  connections: Connection[]
  onPermissionLevelChange: () => void
}

const ConnectionList: React.FC<ConnectionListProps> = ({
  connections,
  onPermissionLevelChange,
}) => {
  const [selectedPermissionLevel, setSelectedPermissionLevel] = useState<{
    id: string
    level: number
  } | null>(null)

  const handlePermissionLevelChange = (id: string, newLevel: number) => {
    setSelectedPermissionLevel({ id, level: newLevel })
  }

  const handleConfirm = async () => {
    if (selectedPermissionLevel) {
      const { id, level } = selectedPermissionLevel
      const response = await changePermissionLevel(id, level)
      if (response.type === "success") {
        toast.success(`Permission level changed successfully to ${level}`)
        onPermissionLevelChange()
        setSelectedPermissionLevel(null)
      } else {
        toast.error(response.message)
      }
    }
  }

  const handleRemoveFriend = async (connectionId: string) => {
    const response = await removeFriend(connectionId)
    if (response.type === "success") {
      toast.success("Friend removed successfully")
      onPermissionLevelChange()
    } else {
      toast.error(response.message)
    }
  }

  return (
    <ul>
      {connections.length === 0 ? (
        <p>
          No connections yet. Start growing your network by connecting with
          others on our site.
        </p>
      ) : (
        connections.map((connection) => (
          <li key={connection.id} className="mb-4 flex flex-col">
            <div className="flex items-center">
              <label className="text-xs font-medium text-gray-500 mr-2">
                Friend Email:
              </label>
              <p className="text-sm">{connection.friend_email}</p>
            </div>
            <div className="flex items-center mt-1">
              <label className="text-xs font-medium text-gray-500 mr-2">
                Permission Level:
              </label>
              <select
                value={
                  selectedPermissionLevel?.id === connection.id
                    ? selectedPermissionLevel.level
                    : connection.permission_level
                }
                onChange={(e) =>
                  handlePermissionLevelChange(
                    connection.id,
                    parseInt(e.target.value)
                  )
                }
                className="text-sm py-1 px-2 border border-gray-300 rounded"
              >
                <option value={0}>No Access</option>
                <option value={1}>Limited Access</option>
                <option value={2}>Moderate Access</option>
                <option value={3}>Full Access</option>
              </select>
            </div>
            <div className="flex justify-center mt-2">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={
                  selectedPermissionLevel?.id !== connection.id ||
                  selectedPermissionLevel?.level === connection.permission_level
                }
                className={`px-4 py-2 bg-${
                  selectedPermissionLevel?.id === connection.id &&
                  selectedPermissionLevel?.level !== connection.permission_level
                    ? "blue"
                    : "green"
                }-500 text-white rounded hover:bg-${
                  selectedPermissionLevel?.id === connection.id &&
                  selectedPermissionLevel?.level !== connection.permission_level
                    ? "blue"
                    : "green"
                }-700 text-sm mr-2`}
              >
                {selectedPermissionLevel?.id === connection.id &&
                selectedPermissionLevel?.level !== connection.permission_level
                  ? "Confirm"
                  : "Confirmed"}
              </button>
              <button
                type="button"
                onClick={() => handleRemoveFriend(connection.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          </li>
        ))
      )}
    </ul>
  )
}

function Admin({ initialProfile, session }: AdminProps) {
  const [formData, setFormData] = useState<FormData>({
    ...initialProfile,
  })
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [showFriendRequests, setShowFriendRequests] = useState(false)
  const [showFriends, setShowFriends] = useState(false)
  const [newFriendRequest, setNewFriendRequest] = useState(false)

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const response = await getFriendRequests(session)
        if (response.type === "success") {
          const formattedFriendRequests = response.data.map((request) => ({
            id: request.id,
            senderEmail: request.sender_email,
          }))
          if (formattedFriendRequests.length > 0) {
            setFriendRequests(formattedFriendRequests)
            setNewFriendRequest(true)
          }
        } else {
          toast.error(response.message)
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error)
        toast.error("Failed to fetch friend requests")
      }
    }
    fetchFriendRequests()
  }, [session])

  useEffect(() => {
    fetchConnections()
  }, [session])

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

  const handleToggleFriendRequests = () => {
    setShowFriendRequests(!showFriendRequests)
    if (showFriends) {
      setShowFriends(false)
    }
  }

  const handleToggleFriends = () => {
    setShowFriends(!showFriends)
    if (showFriendRequests) {
      setShowFriendRequests(false)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center mt-2 relative p-5 pb-10 rounded-lg">
      <div className="right-0 flex space-x-2 ml-auto mb-5">
        <div>
          <div
            onClick={handleToggleFriends}
            className="hover:shadow-2xl hover:scale-105"
            data-tooltip-id="friends-icon"
            style={{
              cursor: "pointer",
              transition: "0.3s",
              color: showFriends ? "lightblue" : "gray",
              backgroundColor: "white",
              borderRadius: 12,
              padding: 2,
              border: "1px solid gray",
            }}
          >
            <FaUserFriends size={40} />
            <ReactTooltip
              id="friends-icon"
              place="bottom"
              content="Friends & Permissions"
            />
          </div>
          {showFriends && (
            <div className="absolute mt-1 right-0 bg-white p-4 shadow-lg rounded-lg">
              <div className="bg-gray-200 p-2 rounded-lg">
                <ConnectionList
                  connections={connections}
                  onPermissionLevelChange={fetchConnections}
                />
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <div
            className="hover:shadow-2xl hover:scale-105"
            onClick={handleToggleFriendRequests}
            data-tooltip-id="notifications-icon"
            style={{
              cursor: "pointer",
              transition: "0.3s",
              color: showFriendRequests ? "lightblue" : "gray",
              borderRadius: 12,
              backgroundColor: "white",
              padding: 2,
              border: "1px solid gray",
            }}
          >
            <IoIosNotifications size={40} />
            {newFriendRequest && (
              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3"></div>
            )}
            <ReactTooltip
              id="notifications-icon"
              place="bottom"
              content="Notifications"
            />
          </div>
          {showFriendRequests && (
            <div className="absolute top-full right-0 w-fit bg-white shadow-lg rounded-lg p-4">
              {friendRequests.length === 0 ? (
                <p className="">No friend requests</p>
              ) : (
                <ul>
                  {friendRequests.map((request) => (
                    <li
                      key={request.id}
                      className="bg-gray-200 w-fit p-2 rounded"
                    >
                      <div className="flex flex-col items-center justify-between">
                        <div>
                          <p>{request.senderEmail}</p>
                          <p className="text-sm mb-2">
                            Sent you a friend request
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleFriendRequestResponse(request.id, true)
                            }
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleFriendRequestResponse(request.id, false)
                            }
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 md:mt-0 mt-4 rounded-lg shadow-2xl w-full max-w-6xl"
      >
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-gray-700"
            style={{ userSelect: "none" }}
          >
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
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Permission Levels and Your Profile Information:
          </h2>
          <p className="mb-4">
            When someone visits your profile, the information they can see
            depends on their permission level. You can control these permission
            levels for each of your friends in the Friends & Permissions panel
            above.
          </p>
          <ul className="list-disc pl-6">
            <li>Level 0: Only your username is visible.</li>
            <li>
              Level 1: Your name, social media links, and bio are also visible.
            </li>
            <li>
              Level 2: Your email and date of birth become visible as well.
            </li>
            <li>
              Level 3: Full access, including your address and phone number.
            </li>
          </ul>
          <p className="mt-4">
            If someone is not your friend, they can only see your username. When
            you accept a friend request, they are granted the default permission
            level (Level 1).
          </p>
          <p className="mt-4">
            As the profile owner, you always have access to all your
            information. Remember to be cautious when granting higher permission
            levels to protect your privacy.
          </p>
        </div>
        <div className="flex">
          <button
            type="submit"
            className="flex inline-flex mx-auto mt-4 justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  )
}

export default Admin
