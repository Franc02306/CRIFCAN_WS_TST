// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import UserProfile from '@views/pages/user-profile'

const ProfileTab = dynamic(() => import('@views/pages/user-profile/profile'))

// Vars
const tabContentList = data => ({
  profile: <ProfileTab data={data?.users.profile} />,
})

const getData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/pages/profile`)

  if (!res.ok) {
    throw new Error('Failed to fetch profileData')
  }

  return res.json()
}

const ProfilePage = async () => {
  // Vars
  const data = await getData()

  return <UserProfile data={data} tabContentList={tabContentList(data)} />
}

export default ProfilePage
