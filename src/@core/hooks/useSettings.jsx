// React Imports
import { useContext, useEffect, useState } from 'react'

// Context Imports
import { SettingsContext } from '@core/contexts/settingsContext'

import primaryColorConfig from '@configs/primaryColorConfig'

const defaultPrimaryColor = primaryColorConfig.find(item => item.name === 'primary-2')?.main

export const useSettings = () => {
  // Hooks
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider')
  }

  const { settings, updateSettings } = context

  // Forzar el color predeterminado si no está presente en la configuración
  useEffect(() => {
    if (!settings.primaryColor || settings.primaryColor !== defaultPrimaryColor) {
      updateSettings({ primaryColor: defaultPrimaryColor })
    }
  }, [settings, updateSettings])

  return context
}
