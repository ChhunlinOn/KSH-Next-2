// src/app/action/serverauth.ts
'use server';

import { cookies } from 'next/headers';

export async function getServerSession() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get('jwt')?.value || null;
  const userRole = cookieStore.get('userRole')?.value || null;
  const userImage = cookieStore.get('userImage')?.value || null;
  const userId = cookieStore.get('userId')?.value || null;

  if (!jwt) {
    return null;
  }

  return {
    jwt,
    userRole,
    userImage,
    userId,
  };
}