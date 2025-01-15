import React, { useCallback, useContext, useState } from 'react'
import { AppContext } from '@renderer/providers/AppProvider'
import FraisForm from '@renderer/form/frais_form'

const Frais_cap = () => {
  const { data, setData } = useContext(AppContext)



  return (
    <div id="content">
      <div id="main">
        <h3>lol</h3>
      </div>
    </div>
  )
}

export default Frais_cap