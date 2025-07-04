import { userRouteHandler } from './routes/userRoutes';
import { residentRouteHandler } from './routes/residentRoutes';
import { assessmentRouteHandler } from './routes/assessmentRoutes';
import { scorePointRouteHandler } from './routes/scorepointRoutes';
import  {residentMedicalRouteHandler} from './routes/residentmedicalRoutes';
import {medicalCommentRouteHandler} from './routes/medicalcommentRoutes';
import {medicalDriveUrlRouteHandler} from './routes/medicaldriveurlRoutes';
import {programLevelRouteHandler} from './routes/programlevelRoutes';
import { programActivityRouteHandler} from './routes/programactivityRoutes';
import { programTypeRouteHandler} from './routes/programtypeRoutes';
import {residentChecklistRouteHandler} from './routes/residentchecklistRoutes';
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

            if (pathname.startsWith('/api/programactivitys')) {
    return programActivityRouteHandler(req);
  }

            if (pathname.startsWith('/api/programtypes')) {
    return programTypeRouteHandler(req);
  }
              if (pathname.startsWith('/api/residentchecklists')) {
    return residentChecklistRouteHandler(req);
  }
  return NextResponse.json({
    status: 404,
    success: false,
    message: `Route '${pathname}' not found`,
  }, { status: 404 });

  
}
