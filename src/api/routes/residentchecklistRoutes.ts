import {
  getAllResidentChecklists,
  getOneResidentChecklist,
  createResidentChecklist,
  updateResidentChecklist,
  deleteResidentChecklist,
} from '../controller/residentchecklistController';

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

function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function residentChecklistRouteHandler(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const segments = pathname.split('/').filter(Boolean);
  const checklistId = segments.length >= 3 ? segments[2] : undefined;
  const lastSegment = segments[segments.length - 1];
  const method = req.method;

  if (method === 'GET') {
    // const user = await verifyJwt(req);
    // if (!user) return unauthorizedResponse();
    return checklistId ? getOneResidentChecklist(checklistId) : getAllResidentChecklists();
  }

  if (method === 'POST' && lastSegment === 'create') {
    // const user = await verifyJwt(req);
    // if (!user) return unauthorizedResponse();
    return createResidentChecklist(req);
  }

  if ((method === 'PUT' || method === 'DELETE') && checklistId) {
    // const user = await verifyJwt(req);
    // if (!user) return unauthorizedResponse();
    if (method === 'PUT') return updateResidentChecklist(req, checklistId);
    if (method === 'DELETE') return deleteResidentChecklist(checklistId);
  }

  return new Response('Method Not Allowed', { status: 405 });
}
