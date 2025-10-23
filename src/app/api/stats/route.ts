import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Mock data untuk admin user
    const totalUsers = 1;
    const totalServices = 5;
    const totalOrders = 5;
    const totalRevenue = 1050000; // Total dari semua order
    const recentUsers = 1;
    const recentServices = 3;

    const servicesByType = [
      { type: 'GAME_HOSTING', _count: { type: 3 } },
      { type: 'RDP', _count: { type: 1 } },
      { type: 'FIVEM_DEVELOPMENT', _count: { type: 1 } }
    ];

    return NextResponse.json({
      totalUsers,
      totalServices,
      totalOrders,
      totalRevenue,
      recentUsers,
      recentServices,
      servicesByType,
      uptime: '99.9%',
      lastUpdated: new Date().toISOString(),
      serviceBreakdown: {
        localServices: 5,
        pterodactylServers: 3
      }
    });

  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}