import { NextResponse } from 'next/server';
import { getStats } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { stats, source } = await getStats();
    return NextResponse.json({
      success: true,
      source,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error in GET /api/stats:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener estadísticas: ' + (error.message || 'Error desconocido'),
    }, { status: 500 });
  }
}
