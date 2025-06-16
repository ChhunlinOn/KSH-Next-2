import { userRouteHandler } from './routes/userRoutes';
import { residentRouteHandler } from './routes/residentRoutes';
import { assessmentRouteHandler } from './routes/assessmentRoutes';
import { NextRequest } from 'next/server';

export async function handler(req: NextRequest) {
  const { pathname } = new URL(req.url);

  if (pathname.startsWith('/api/users')) {
    return userRouteHandler(req);
  }

  if (pathname.startsWith('/api/residents')) {
    return residentRouteHandler(req);
  }

    if (pathname.startsWith('/api/assessments')) {
    return assessmentRouteHandler(req);
  }


  return new Response('Not found', { status: 404 });
}
