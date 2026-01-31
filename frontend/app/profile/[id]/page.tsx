import Profile from '@/components/Profile/Profile'
import React from 'react'

const ProfilePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <Profile id={id}/>
  )
}

export default ProfilePage