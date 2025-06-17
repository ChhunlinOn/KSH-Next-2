import {
  getResidentMedicals,
  getOneResidentMedical,
  createResidentMedical,
  updateResidentMedical,
  deleteResidentMedical,
} from '../controller/residentmedicalContreoller';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function verifyJwt(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function residentMedicalRouteHandler(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const id = segments.length >= 3 ? segments[2] : undefined;
  const method = req.method;

  // JWT check (uncomment when needed)
  // const user = await verifyJwt(req);
  // if (!user) return unauthorizedResponse();

  if (method === 'GET') {
    return id ? getOneResidentMedical(id) : getResidentMedicals();
  }

  if (method === 'POST' && lastSegment === 'create') {
    return createResidentMedical(req);
  }

  if ((method === 'PUT' || method === 'DELETE') && id) {
    if (method === 'PUT') return updateResidentMedical(req, id);
    if (method === 'DELETE') return deleteResidentMedical(id);
  }

  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
