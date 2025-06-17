import {
  getAllProgramActivities,
  getOneProgramActivity,
  createProgramActivity,
  updateProgramActivity,
  deleteProgramActivity
} from '../controller/programactivityController';
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

export async function programActivityRouteHandler(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const activityId = segments.length >= 3 ? segments[2] : undefined;
  const method = req.method;

  if (method === 'GET') {
    return activityId ? getOneProgramActivity(activityId) : getAllProgramActivities();
  }

  if (method === 'POST' && lastSegment === 'create') {
    return createProgramActivity(req);
  }

  if ((method === 'PUT' || method === 'DELETE') && activityId) {
    if (method === 'PUT') return updateProgramActivity(req, activityId);
    if (method === 'DELETE') return deleteProgramActivity(activityId);
  }

  return new Response('Method Not Allowed', { status: 405 });
}
