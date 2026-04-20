import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

const supabase = require('@supabase/supabase-js').createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  console.log('[3D] Checking products...')
  
  const { data, error } = await supabase
    .from('products')
    .select('id, name, model_3d_url')
    .limit(5)

  console.log('Products:', JSON.stringify(data, null, 2))
  console.log('Error:', error)
}

main()