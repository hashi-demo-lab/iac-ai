import {
  installWhisperCpp,
  downloadWhisperModel,
  transcribe,
} from "@remotion/install-whisper-cpp";
import path from "path";
import fs from "fs";

const WHISPER_DIR = path.join(process.cwd(), ".whisper");
const MODEL = "medium.en";

async function main() {
  const wavFile = process.argv[2];
  const outputFile = process.argv[3];

  if (!wavFile || !outputFile) {
    console.error("Usage: npx tsx scripts/transcribe.ts <wav-file> <output-json>");
    process.exit(1);
  }

  console.log(`Installing whisper.cpp to ${WHISPER_DIR}...`);
  await installWhisperCpp({ to: WHISPER_DIR, version: "1.5.5" });

  console.log(`Downloading model: ${MODEL}...`);
  await downloadWhisperModel({ folder: WHISPER_DIR, model: MODEL });

  console.log(`Transcribing: ${wavFile}...`);
  const { transcription } = await transcribe({
    inputPath: wavFile,
    whisperPath: WHISPER_DIR,
    whisperCppVersion: "1.5.5",
    model: MODEL,
    tokenLevelTimestamps: false,
  });

  console.log(`Writing transcript to ${outputFile}...`);
  fs.writeFileSync(outputFile, JSON.stringify(transcription, null, 2));
  console.log(`Done! ${transcription.length} segments written.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
