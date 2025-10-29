import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔊 Text-to-speech function called');
    
    const { text, voice } = await req.json()
    console.log('📝 Text length:', text?.length || 0, 'Voice:', voice || 'alloy');

    if (!text) {
      console.error('❌ No text provided');
      throw new Error('Text is required')
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    console.log('🔑 OPENAI_API_KEY is set:', !!OPENAI_API_KEY);
    
    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      throw new Error('OPENAI_API_KEY is not configured')
    }

    console.log('🌐 Calling OpenAI TTS API...');
    // Generate speech from text
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice || 'alloy',
        response_format: 'mp3',
      }),
    })

    console.log('📥 OpenAI TTS response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI TTS error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Authentication failed with OpenAI TTS. Please check API key.')
      }
      
      throw new Error(`Failed to generate speech (${response.status}): ${errorText}`)
    }

    console.log('🎵 Converting audio to base64...');
    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    )
    
    console.log('✅ TTS successful, base64 length:', base64Audio.length);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ TTS error:', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})