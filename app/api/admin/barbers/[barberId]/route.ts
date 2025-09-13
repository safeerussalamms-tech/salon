export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, context: { params: { barberId: string } }) {
  const { barberId } = context.params
  const url = new URL(req.url)
  const shopId = url.searchParams.get('shop_id')
  const body = await req.json()

  if (!shopId) {
    return new Response(JSON.stringify({ success: false, error: 'shop_id is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const upstream = `https://quick-barber.vercel.app/api/admin/barbers/${encodeURIComponent(barberId)}?shop_id=${encodeURIComponent(shopId)}`

  try {
    const res = await fetch(upstream, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const text = await res.text()
    return new Response(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: 'Proxy request failed', details: String(error?.message || error) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }
}


