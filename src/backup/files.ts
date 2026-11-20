import type { DocumentPickerAsset } from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** Writes JSON to the cache dir and opens the iOS share sheet (Files, AirDrop, Mail…). */
export async function shareJsonFile(fileName: string, json: string): Promise<void> {
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  await file.write(json);
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing unavailable');
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: fileName,
  });
}

export async function readPickedText(asset: DocumentPickerAsset): Promise<string> {
  return new File(asset.uri).text();
}
