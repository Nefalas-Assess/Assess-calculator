import { useEffect, useState } from 'react'
// import supabase from './utils/supabase'

export const License = ({ children }) => {
  const [id, setId] = useState(null)

  useEffect(() => {
    window.api
      .getMachineId()
      .then((res) => setId(res))
      .catch((err) => console.error('Erreur :', err))
  }, [])

  const verifyLicense = async (id) => {
    // const { data, error } = await supabase.from('licenses').select('*').eq('licenseKey', 'test')
    // // .eq("licenseKey", licenseKey)
    // // .single();
    // console.log(data, error)
    // const { data: licenses, error } = await supabase.from('licenses').select('licenseKey')
  }

  useEffect(() => {
    verifyLicense(id)
  }, [id])

  return children
}

export default License
