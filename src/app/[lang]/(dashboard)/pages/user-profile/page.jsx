// Next Imports
'use client'
import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

import { useSession } from 'next-auth/react'

// Component Imports
// import UserProfile from '@views/pages/user-profile'
import UserProfile from '../../../../../views/pages/user-profile/index'
import ProfileTab from '../../../../../views/pages/user-profile/profile/index'

const ProfilePage = () => {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    if (session) {
      setUserData(session.user)
    }
  }, [session])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Please log in</div>
  }

  const tabContentList = {
    profile: <ProfileTab data={userData} />
  }

  return <UserProfile data={userData} tabContentList={tabContentList} />
}

export default ProfilePage
