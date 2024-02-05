import { handleAuth } from '@auth0/nextjs-auth0';
export const dynamic = 'force-dynamic' // defaults to auto


export const GET = handleAuth();