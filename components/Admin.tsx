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
  respondToFriendRequest,
} from "@/libs/friendRequests"
import { IoIosNotifications } from "react-icons/io"
import { FaUserFriends } from "react-icons/fa"

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
  const [selectedPermissionLevels, setSelectedPermissionLevels] = useState<{
    [key: string]: number
  }>({})

  const handlePermissionLevelChange = (id: string, newLevel: number) => {
    setSelectedPermissionLevels((prevLevels) => ({
      ...prevLevels,
      [id]: newLevel,
    }))
  }

  const handleConfirm = async (id: string) => {
    const newLevel = selectedPermissionLevels[id]
    if (newLevel !== undefined) {
      const response = await changePermissionLevel(id, newLevel)
      if (response.type === "success") {
        toast.success(`Permission level changed successfully to ${newLevel}`)
        onPermissionLevelChange()
      } else {
        toast.error(response.message)
      }
    }
  }

  return (
    <ul>
      {connections.map((connection) => (
        <li key={connection.id} className="mb-4 flex flex-col">
          <p>Friend Email: {connection.friend_email}</p>
          <label>
            Permission Level:
            <select
              value={
                selectedPermissionLevels[connection.id] !== undefined
                  ? selectedPermissionLevels[connection.id]
                  : connection.permission_level
              }
              onChange={(e) =>
                handlePermissionLevelChange(
                  connection.id,
                  parseInt(e.target.value)
                )
              }
              className="text-xl ml-2"
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => handleConfirm(connection.id)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 w-fit mx-auto mt-2"
          >
            Confirm
          </button>
        </li>
      ))}
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
        console.log({ response })
        if (response.type === "success") {
          const formattedFriendRequests = response.data.map((request) => ({
            id: request.id,
            senderEmail: request.sender_email,
          }))
          console.log(formattedFriendRequests)
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
    <div className="flex flex-col justify-center items-center mt-2 relative bg-blue-200 p-5 pb-10 rounded-lg">
      <div className=" right-0 flex space-x-4 ml-auto mb-5">
        <div className="relative">
          <div
            onClick={handleToggleFriendRequests}
            style={{
              cursor: "pointer",
              boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
              transition: "0.3s",
              color: showFriendRequests ? "lightblue" : "gray",
              borderRadius: 12,
              backgroundColor: "white",
            }}
          >
            <IoIosNotifications size={40} />
            {newFriendRequest && (
              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3"></div>
            )}
          </div>
          {showFriendRequests && (
            <div className="absolute top-full right-0 w-64 bg-white shadow-lg rounded-lg p-4">
              {friendRequests.length === 0 ? (
                <p>No friend requests</p>
              ) : (
                <ul>
                  {friendRequests.map((request) => (
                    <li key={request.id} className="mb-4">
                      <p>Sender Email: {request.senderEmail}</p>
                      <button
                        onClick={() =>
                          handleFriendRequestResponse(request.id, true)
                        }
                        className="mr-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() =>
                          handleFriendRequestResponse(request.id, false)
                        }
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <div>
          <div
            onClick={handleToggleFriends}
            style={{
              cursor: "pointer",
              boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
              transition: "0.3s",
              color: showFriends ? "lightblue" : "gray",
              backgroundColor: "white",
              borderRadius: 12,
              padding: 1,
            }}
          >
            <FaUserFriends size={40} />
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
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-200 p-8 md:mt-0 mt-4 rounded-lg shadow-2xl w-full max-w-6xl"
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
