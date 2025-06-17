import { handler } from '@/api';
import { NextRequest } from 'next/server';

export function POST(request: NextRequest) {
  return handler(request);
}


