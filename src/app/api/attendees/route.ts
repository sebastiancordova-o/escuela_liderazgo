import { NextRequest, NextResponse } from 'next/server';
import { 
  findAttendeeByRut, 
  updateAttendeeAttendance, 
  createAndAttendAttendee,
  getAllAttendees
} from '@/lib/sheets';
import { cleanRut, formatRut, validateRut } from '@/lib/rut';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rut = searchParams.get('rut');

    if (!rut) {
      const { attendees, source } = await getAllAttendees();
      return NextResponse.json({
        success: true,
        source,
        data: attendees.slice(0, 50),
        total: attendees.length,
      });
    }

    const rutClean = cleanRut(rut);
    const rutFormatted = formatRut(rut);
    const isValid = validateRut(rut);

    const { attendee, source } = await findAttendeeByRut(rut);

    if (!attendee) {
      return NextResponse.json({
        success: false,
        found: false,
        source,
        message: 'No se encontró ningún participante con este RUT.',
        rutClean,
        rutFormatted,
        isValidRut: isValid,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      found: true,
      source,
      data: attendee,
    });
  } catch (error: any) {
    console.error('Error in GET /api/attendees:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al consultar la base de datos: ' + (error.message || 'Error desconocido'),
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { rowIndex, rut, attended, precioPagado, plataforma, pastorRed } = body;

    if (rowIndex === undefined || attended === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Parámetros inválidos. Se requiere rowIndex y attended.',
      }, { status: 400 });
    }

    const result = await updateAttendeeAttendance(
      Number(rowIndex), 
      Boolean(attended), 
      rut, 
      precioPagado, 
      plataforma,
      pastorRed
    );

    return NextResponse.json({
      success: true,
      source: result.source,
      message: attended ? '¡Asistencia registrada y guardada en tabla 2026!' : 'Asistencia desmarcada.',
      data: result.attendee,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/attendees:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al actualizar asistencia: ' + (error.message || 'Error desconocido'),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      nombre, 
      apellido1, 
      apellido2, 
      rut, 
      email, 
      telefono, 
      tipoAsistente, 
      organizacion, 
      pastorRed,
      precioPagado,
      plataforma 
    } = body;

    if (!nombre || !apellido1 || !rut) {
      return NextResponse.json({
        success: false,
        message: 'Nombre, Primer Apellido y RUT son obligatorios.',
      }, { status: 400 });
    }

    const existing = await findAttendeeByRut(rut);
    if (existing.attendee) {
      const updated = await updateAttendeeAttendance(
        existing.attendee.rowIndex, 
        true, 
        rut,
        precioPagado,
        plataforma,
        pastorRed
      );
      return NextResponse.json({
        success: true,
        source: updated.source,
        message: 'El participante ya estaba en la lista. ¡Asistencia acreditada y guardada en tabla 2026!',
        data: updated.attendee || existing.attendee,
        alreadyExisted: true,
      });
    }

    const result = await createAndAttendAttendee({
      nombre,
      apellido1,
      apellido2,
      rut,
      email,
      telefono,
      tipoAsistente,
      organizacion,
      pastorRed,
      precioPagado,
      plataforma,
    });

    return NextResponse.json({
      success: true,
      source: result.source,
      message: '¡Nuevo participante registrado y acreditado en tabla 2026!',
      data: result.attendee,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/attendees:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al registrar participante: ' + (error.message || 'Error desconocido'),
    }, { status: 500 });
  }
}
