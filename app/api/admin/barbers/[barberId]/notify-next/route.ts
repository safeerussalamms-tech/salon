export const dynamic = 'force-dynamic'

export async function POST(req: Request, context: { params: Promise<{ barberId: string }> }) {
  const { barberId } = await context.params
  const url = new URL(req.url)
  const shopId = url.searchParams.get('shop_id')

  if (!shopId) {
    return new Response(JSON.stringify({ success: false, error: 'shop_id is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const upstream = `https://quick-barber.vercel.app/api/admin/barbers/${encodeURIComponent(barberId)}/notify-next?shop_id=${encodeURIComponent(shopId)}`

  try {
    const res = await fetch(upstream, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      cache: 'no-store',
    })

    const text = await res.text()
    return new Response(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({ success: false, error: 'Proxy request failed', details: errorMessage }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }
}


