import { userRouteHandler } from './routes/userRoutes';
import { residentRouteHandler } from './routes/residentRoutes';
import { assessmentRouteHandler } from './routes/assessmentRoutes';
import { scorePointRouteHandler } from './routes/scorepointRoutes'

import { NextRequest, NextResponse } from 'next/server';

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
      if (pathname.startsWith('/api/scorepoints')) {
    return scorePointRouteHandler(req);
  }

  return NextResponse.json({
    status: 404,
    success: false,
    message: `Route '${pathname}' not found`,
  }, { status: 404 });
}
