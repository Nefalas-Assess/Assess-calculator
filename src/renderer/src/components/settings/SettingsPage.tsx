import React from 'react'
import { Route, Routes } from 'react-router'
import SettingsOverview from '@renderer/components/settings/SettingsOverview'
import SettingsEditor from '@renderer/components/settings/SettingsEditor'

const SettingsPage = () => {
  return (
    <Routes>
      <Route index element={<SettingsOverview />} />
      <Route path=":datasetId" element={<SettingsEditor />} />
    </Routes>
  )
}

export default SettingsPage
