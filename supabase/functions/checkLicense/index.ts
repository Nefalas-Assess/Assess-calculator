// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const { licenseKey, machineId } = await req.json()

    // Connexion à Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    // Vérifier la licence
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('key', licenseKey)
      .single()

    if (error || !data) {
      return new Response(JSON.stringify({ valid: false, error: 'invalid_key' }), { status: 201 })
    }

    // Vérifier si la machine est déjà enregistrée
    const deviceList = data.devices || []

    if (deviceList.includes(machineId)) {
      return new Response(JSON.stringify({ valid: true, cached: true }), { status: 200 })
    }

    // Vérifier la limite de machines
    if (deviceList.length >= data.maxDevices) {
      return new Response(JSON.stringify({ valid: false, error: 'cap_devices' }), { status: 202 })
    }

    // Ajouter la machine à la liste
    deviceList.push(machineId)

    // Mettre à jour Supabase
    const { error: updateError } = await supabase
      .from('licenses')
      .update({ devices: deviceList })
      .eq('key', licenseKey)

    if (updateError) {
      return new Response(JSON.stringify({ valid: false, error: 'error_update' }), { status: 500 })
    }

    return new Response(JSON.stringify({ valid: true, license: data }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ valid: false, error: 'server_error' }), {
      status: 500
    })
  }
})
