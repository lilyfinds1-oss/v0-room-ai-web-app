import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const style = url.searchParams.get('style')
    const minPrice = url.searchParams.get('minPrice')
    const maxPrice = url.searchParams.get('maxPrice')
    const limit = url.searchParams.get('limit') || '10'

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: async () => {
            const cookieStore = await cookies()
            return cookieStore.getSetCookie()
          },
          setAll: async (cookiesToSet) => {
            const cookieStore = await cookies()
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    let query = supabase.from('products').select('*')

    if (category) {
      query = query.eq('category', category)
    }

    if (style) {
      query = query.eq('style', style)
    }

    if (minPrice) {
      query = query.gte('price_max', parseInt(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price_min', parseInt(maxPrice))
    }

    const { data: products, error } = await query
      .order('price_min', { ascending: true })
      .limit(parseInt(limit))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Product search error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    )
  }
}
