import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getFilesAPIService } from '@/lib/files-api-server';

export async function GET(request: NextRequest) {
  const session = await auth();
  console.log('Session:', session ? 'exists' : 'null');

  if (!session?.user?.id) {
    console.log('No session or user ID');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/';
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json(
      { error: 'projectId parameter is required' },
      { status: 400 },
    );
  }

  try {
    const filesAPI = getFilesAPIService(projectId);
    const files = await filesAPI.buildFileTree(path);

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Failed to fetch files:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch files',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
