import {
  getUsers,
  createUser,
  getOneUser,
  updateUser,
  deleteUser,
  loginUser
} from '../controller/usersController';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function verifyJwt(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

function unauthorizedResponse(message = "No JWT provided") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function userRouteHandler(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const userId = segments.length >= 3 ? segments[2] : undefined;

  const method = req.method;

  // All GET routes require authentication
  if (method === 'GET') {
    const user = await verifyJwt(req);
    if (!user) {
      return unauthorizedResponse("No JWT provided or invalid token");
    }
    return userId ? getOneUser(userId) : getUsers();
  }

  // POST route is public
  if (method === 'POST' && lastSegment === 'login') {
    return loginUser(req);
  }

  // POST /api/users/create → create user (protected)
  if (method === 'POST' && lastSegment === 'create') {
    const user = await verifyJwt(req);
    if (!user) {
      return unauthorizedResponse("No JWT provided or invalid token");
    }
    return createUser(req);
  }

  // PUT and DELETE require authentication
  if (method === 'PUT' || method === 'DELETE') {
    const user = await verifyJwt(req);
    if (!user) {
      return unauthorizedResponse("No JWT provided or invalid token");
    }

    if (method === 'PUT' && userId) {
      return updateUser(req, userId);
    }
    if (method === 'DELETE' && userId) {
      return deleteUser(userId);
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
