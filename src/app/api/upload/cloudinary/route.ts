import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfs07oaet',
  api_key: process.env.CLOUDINARY_API_KEY || '632318816957616',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'cqe9TWG7Qag1rOW8mdXPyf6lZ1g',
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'cozynest/kyc';

    if (!file) {
      return NextResponse.json({ message: 'Không tìm thấy tệp tải lên' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder,
              resource_type: 'image',
              overwrite: true,
            },
            (error, result) => {
              if (error || !result) {
                return reject(error || new Error('Cloudinary upload failed'));
              }
              resolve({ secure_url: result.secure_url, public_id: result.public_id });
            }
          )
          .end(buffer);
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi tải ảnh lên Cloudinary';
    return NextResponse.json({ message }, { status: 500 });
  }
}

