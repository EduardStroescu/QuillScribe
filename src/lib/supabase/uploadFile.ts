import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export async function uploadFile(
  bucket: string,
  file: File,
  fileName: string
): Promise<{ publicPath: string | null; error: string | null }> {
  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    return { publicPath: uploadData.path, error: null };
  } catch (err) {
    if (err instanceof Error) return { publicPath: null, error: err.message };
    return { publicPath: null, error: JSON.stringify(err) };
  }
}
