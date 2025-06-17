import { handler } from '@/api';
import { NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  return handler(request);
}


