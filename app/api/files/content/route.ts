import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getFilesAPIService } from '@/lib/files-api-server';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const projectId = searchParams.get('projectId');

  if (!path) {
    return NextResponse.json(
      { error: 'Path parameter is required' },
      { status: 400 },
    );
  }

  if (!projectId) {
    return NextResponse.json(
      { error: 'projectId parameter is required' },
      { status: 400 },
    );
  }

  try {
    const filesAPI = getFilesAPIService(projectId);
    const content = await filesAPI.getFileContent(path);

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Failed to fetch file content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file content' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { path, content, projectId } = body;

    if (!path || content === undefined) {
      return NextResponse.json(
        { error: 'Path and content are required' },
        { status: 400 },
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 },
      );
    }

    const filesAPI = getFilesAPIService(projectId);
    await filesAPI.writeFile(path, content);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write file content:', error);
    return NextResponse.json(
      { error: 'Failed to write file content' },
      { status: 500 },
    );
  }
}
