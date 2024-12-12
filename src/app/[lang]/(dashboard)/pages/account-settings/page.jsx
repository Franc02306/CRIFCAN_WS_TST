// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import AccountSettings from '@views/pages/account-settings'

const SecurityTab = dynamic(() => import('@views/pages/account-settings/security'))
const NotificationsTab = dynamic(() => import('@views/pages/account-settings/notifications'))

// Vars
const tabContentList = () => ({
  security: <SecurityTab />,
  notifications: <NotificationsTab />
})

const AccountSettingsPage = () => {
  return <AccountSettings tabContentList={tabContentList()} />
}

export default AccountSettingsPage
