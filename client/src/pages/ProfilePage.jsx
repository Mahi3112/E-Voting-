import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

const ProfilePage = () => {
  const [user, setUser] = useState(null)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios.get('http://localhost:3000/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setUser(res.data.user)
        if (res.data.user.profileImage) {
          setPreview(`http://localhost:3000/uploads/${res.data.user.profileImage}`)
        }
      })
      .catch(err => {
        setUser(null)
      })
  }, [])

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))

    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('profileImage', file)

    try {
      await axios.post('http://localhost:3000/user/upload-profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      alert('✅ Image uploaded successfully!')
    } catch (err) {
      console.error(err)
      alert('❌ Failed to upload image.')
    }
  }

  if (!user) return <p className="text-center mt-10">Loading...</p>

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-xl mt-12 border">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">👤 User Profile</h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden border shadow">
              {preview ? (
                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            {/* Styled choose button */}
            <button
              onClick={() => fileInputRef.current.click()}
              className="mt-4 bg-purple-800 text-white px-4 py-2 rounded hover:bg-purple-900"
            >
              Upload Image
            </button>
          </div>

          <div className="text-left w-full">
            <p className="mb-2"><strong>Name:</strong> {user.name}</p>
            <p className="mb-2"><strong>Email:</strong> {user.email}</p>
            <p className="mb-2"><strong>Mobile:</strong> {user.mobile}</p>
            <p className="mb-2"><strong>Election ID:</strong> {user.electionid}</p>
            <p className="mb-2"><strong>Role:</strong> {user.role}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage
