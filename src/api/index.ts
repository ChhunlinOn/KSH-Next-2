import { userRouteHandler } from './routes/userRoutes';
import { NextRequest } from 'next/server';

export async function handler(req: NextRequest) {
  return userRouteHandler(req);
}
