import { NextRequest, NextResponse } from 'next/server';
import { getTable2026Attendees, updateTable2026Row } from '@/lib/sheets';
import { extractPriceFromText } from '@/lib/rut';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyAttended = searchParams.get('onlyAttended') === 'true';
    const search = (searchParams.get('q') || '').toLowerCase();

    const { attendees, source } = await getTable2026Attendees();

    let filtered = attendees;
    if (onlyAttended) {
      filtered = filtered.filter(a => a.asistio);
    }
    if (search) {
      filtered = filtered.filter(a => 
        a.nombre.toLowerCase().includes(search) ||
        a.apellido1.toLowerCase().includes(search) ||
        (a.apellido2 && a.apellido2.toLowerCase().includes(search)) ||
        a.rut.includes(search) ||
        a.rutClean.includes(search) ||
        (a.pastorRed && a.pastorRed.toLowerCase().includes(search))
      );
    }

    const totalAsistieron = attendees.filter(a => a.asistio).length;
    let totalRecaudado = 0;
    for (const a of attendees) {
      if (a.asistio) {
        const priceNum = typeof a.precioPagado === 'number' ? a.precioPagado : extractPriceFromText(String(a.pago || a.tipoAsistente));
        totalRecaudado += priceNum;
      }
    }

    return NextResponse.json({
      success: true,
      source,
      data: filtered,
      total: attendees.length,
      totalAsistieron,
      totalRecaudado,
    });
  } catch (error: any) {
    console.error('Error in GET /api/table-2026:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener tabla 2026: ' + (error.message || 'Error desconocido'),
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { attendee } = body;

    if (!attendee || !attendee.rut || !attendee.nombre) {
      return NextResponse.json({
        success: false,
        message: 'Datos de participante incompletos.',
      }, { status: 400 });
    }

    const result = await updateTable2026Row(attendee);

    return NextResponse.json({
      success: true,
      source: result.source,
      message: '¡Registro actualizado exitosamente en Google Sheets (Tabla 2026)!',
      data: result.attendee,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/table-2026:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al actualizar registro en tabla 2026: ' + (error.message || 'Error desconocido'),
    }, { status: 500 });
  }
}
