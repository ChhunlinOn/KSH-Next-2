import { userRouteHandler } from './routes/userRoutes';
import { residentRouteHandler } from './routes/residentRoutes';
import { assessmentRouteHandler } from './routes/assessmentRoutes';
import { scorePointRouteHandler } from './routes/scorepointRoutes';
import  {residentMedicalRouteHandler} from './routes/residentmedicalRoutes'
import {medicalCommentRouteHandler} from './routes/medicalcommentRoutes';
import {medicalDriveUrlRouteHandler} from './routes/medicaldriveurlRoutes'
import {programLevelRouteHandler} from './routes/programlevelRoutes'
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

      if (pathname.startsWith('/api/residentmedicals')) {
    return residentMedicalRouteHandler(req);
  }
        if (pathname.startsWith('/api/medicalcomments')) {
    return medicalCommentRouteHandler(req);
  }
        if (pathname.startsWith('/api/medicaldriveurls')) {
    return medicalDriveUrlRouteHandler(req);
  }
          if (pathname.startsWith('/api/programlevels')) {
    return programLevelRouteHandler(req);
  }
  return NextResponse.json({
    status: 404,
    success: false,
    message: `Route '${pathname}' not found`,
  }, { status: 404 });

  
}
