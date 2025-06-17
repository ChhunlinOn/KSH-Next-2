import {
  getAllMedicalDrives,
  getOneMedicalDrive,
  createMedicalDrive,
  updateMedicalDrive,
  deleteMedicalDrive,
} from '../controller/medicaldriveurlController';

import { NextRequest, NextResponse } from 'next/server';

export async function medicalDriveUrlRouteHandler(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const segments = pathname.split('/').filter(Boolean);
  const id = segments.length >= 3 ? segments[2] : undefined;
  const method = req.method;

  if (method === 'GET') {
    return id ? getOneMedicalDrive(id) : getAllMedicalDrives();
  }

  if (method === 'POST') {
    return createMedicalDrive(req);
  }

  if ((method === 'PUT' || method === 'DELETE') && id) {
    if (method === 'PUT') return updateMedicalDrive(req, id);
    if (method === 'DELETE') return deleteMedicalDrive(id);
  }

  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
