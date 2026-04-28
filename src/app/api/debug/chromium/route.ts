export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { readdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  const binDir = path.join(
    process.cwd(),
    'node_modules/@sparticuz/chromium/bin'
  );

  try {
    const files = await readdir(binDir);
    return Response.json({ binDir, files });
  } catch (err: any) {
    return Response.json({ binDir, error: err.message }, { status: 500 });
  }
}
