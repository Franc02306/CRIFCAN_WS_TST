'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

const AccountSettings = ({ tabContentList }) => {
  // States
  const [activeTab, setActiveTab] = useState('security') // Default to 'security'

  // On load, check localStorage for saved tab or default to 'security'
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab')
    
    if (savedTab) {
      setActiveTab(savedTab)
    }
  }, [])

  // Save active tab to localStorage
  const handleChange = (event, value) => {
    setActiveTab(value)
    localStorage.setItem('activeTab', value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            {/* <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='tabler-users text-lg' />
                  Account
                </div>
              }
              value='account'
            /> */}
            <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='tabler-bell text-lg' />
                  Notificaciones
                </div>
              }
              value='notifications'
            />
            {/* <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='tabler-lock text-lg' />
                  Seguridad
                </div>
              }
              value='security'
            /> */}
            {/* <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='tabler-bookmark text-lg' />
                  Billing & Plans
                </div>
              }
              value='billing-plans'
            /> */}
            {/* <Tab
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='tabler-link text-lg' />
                  Connections
                </div>
              }
              value='connections'
            /> */}
          </CustomTabList>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value={activeTab} className='p-0'>
            {tabContentList[activeTab]}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default AccountSettings
