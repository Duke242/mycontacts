"use client"
import { addProfile } from "@/libs/serverActions"
import React, { useState, ChangeEvent, FormEvent } from "react"
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

const UserForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    username: "",
    address: "",
    facebook: "",
    twitter: "",
    instagram: "",
    bio: "",
    email: "",
    phone: undefined,
    dob: null,
  })
  const [usernameError, setUsernameError] = useState<string>("")

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    // Validate username
    if (name === "username") {
      const isValid = /^[a-zA-Z0-9-_]*$/.test(value)
      if (!isValid) {
        setUsernameError(
          "Username can only contain letters, numbers, hyphens, and underscores."
        )
      } else {
        setUsernameError("")
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log("Submit")

    if (usernameError) {
      console.log("Fix the errors before submitting the form.")
      return
    }

    addProfile(formData)
      .then((response) => {
        if (response && response.type === "error") {
          if (response.code === "23505") {
            return toast.error("Username is already taken.")
          }
          toast.error(response.message)
        } else {
          // Handle success response
          toast.success("Success")
          // You might want to redirect the user or show a success message
        }
      })
      .catch((error) => {
        // Handle unexpected errors
        console.error("Unexpected error occurred:", error)
        // Display a generic error message to the user
      })
  }

  return (
    <div className="flex justify-center items-center mt-2">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-200 p-8 md:mt-0 mt-4 rounded-lg shadow-2xl w-full max-w-6xl"
      >
        <div className="mb-4 text-center">
          <label className="block text-gray-700">Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-3/4 p-2 border border-gray-300 rounded mt-1"
          />
          {usernameError && (
            <p className="bg-red-300 w-fit mx-auto p-2 rounded mt-2">
              {usernameError}
            </p>
          )}
          <p className="mt-2">Your URL: mywebsite.com/{formData.username}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700">First Name:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Address:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Facebook:</label>
            <input
              type="text"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Twitter:</label>
            <input
              type="text"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Instagram:</label>
            <input
              type="text"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Phone Number:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength={20}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Date of Birth:</label>
            <input
              type="date"
              name="dob"
              value={formData.dob || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Short Bio:</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </div>
        {/* Uncomment and update if needed */}
        {/* <div className="mb-4">
          <label className="block text-gray-700">
            Preferred Way of Contact:
          </label>
          <select
            name="contactPreference"
            value={formData.contactPreference}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded mt-1"
          >
            <option value="">Select</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="socialMedia">Social Media</option>
          </select>
        </div> */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300"
        >
          Submit
        </button>
      </form>
    </div>
  )
}

export default UserForm
