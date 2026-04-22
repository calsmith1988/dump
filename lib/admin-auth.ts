import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_COOKIE_NAME = 'dump-admin-session';

function getRequiredAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_PASSWORD is not configured.');
  }
  return password;
}

function hashPassword(password: string) {
  return createHash('sha256').update(password).digest('hex');
}

function getExpectedSessionValue() {
  return hashPassword(getRequiredAdminPassword());
}

export function verifyAdminPassword(candidate: string) {
  const expected = Buffer.from(getExpectedSessionValue());
  const actual = Buffer.from(hashPassword(candidate));

  return (
    expected.length === actual.length &&
    timingSafeEqual(expected, actual)
  );
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, getExpectedSessionValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value === getExpectedSessionValue();
}

export async function requireAdminAuth() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }
}
