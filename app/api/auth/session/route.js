export async function GET() {
  // Return empty session for now
  return new Response(JSON.stringify({
    user: null,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
