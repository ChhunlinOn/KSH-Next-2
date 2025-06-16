import {
  getResidents,
  getOneResident,
  createResident,
  updateResident,
  deleteResident,
} from '../controller/residentController';
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

export async function residentRouteHandler(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const residentId = segments.length >= 3 ? segments[2] : undefined;
  const method = req.method;

  if (method === 'GET') {
    // const user = await verifyJwt(req);
    // if (!user) return unauthorizedResponse();
    return residentId ? getOneResident(residentId) : getResidents();
  }

  if (method === 'POST' && lastSegment === 'create') {
    // const user = await verifyJwt(req);
    // if (!user) return unauthorizedResponse();
    return createResident(req);
  }

  if ((method === 'PUT' || method === 'DELETE') && residentId) {
    // const user = await verifyJwt(req);
    // if (!user) return unauthorizedResponse();

    if (method === 'PUT') return updateResident(req, residentId);
    if (method === 'DELETE') return deleteResident(residentId);
  }

  return new Response('Method Not Allowed', { status: 405 });
}
