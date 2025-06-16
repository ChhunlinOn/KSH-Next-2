import { handler } from '@/api';
import { NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  return handler(request);
}

export function POST(request: NextRequest) {
  return handler(request);
}

export function PUT(request: NextRequest) {
  return handler(request);
}

export function DELETE(request: NextRequest) {
  return handler(request);
}
