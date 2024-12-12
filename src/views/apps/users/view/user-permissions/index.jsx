'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'


const UserPermissions = ({ id, tabContentList, user }) => {
  const [activeTab, setActiveTab] = useState('permisosRol')

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  return (
    <>
      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab icon={<i className='tabler-lock' />} value='permisosRol' label='Permisos' iconPosition='start' />
              {/* <Tab
                icon={<i className='tabler-bell' />}
                value='notifications'
                label='Notificaciones'
                iconPosition='start'
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
    </>
  )
}

export default UserPermissions
