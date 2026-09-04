export const dynamic = 'force-dynamic'; export async function POST() { return new Response(JSON.stringify({ error: 'Database not connected' }), { status: 500 }); }
