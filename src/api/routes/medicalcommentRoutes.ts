import {
  getAllMedicalComments,
  getOneMedicalComment,
  createMedicalComment,
  updateMedicalComment,
  deleteMedicalComment,
} from '../controller/medicalcommentController';

import { NextRequest, NextResponse } from 'next/server';

export async function medicalCommentRouteHandler(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const segments = pathname.split('/').filter(Boolean);
  const id = segments.length >= 3 ? segments[2] : undefined;
  const method = req.method;

  if (method === 'GET') {
    return id ? getOneMedicalComment(id) : getAllMedicalComments();
  }

  if (method === 'POST') {
    return createMedicalComment(req);
  }

  if ((method === 'PUT' || method === 'DELETE') && id) {
    if (method === 'PUT') return updateMedicalComment(req, id);
    if (method === 'DELETE') return deleteMedicalComment(id);
  }

  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
