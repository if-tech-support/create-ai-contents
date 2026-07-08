// =============================================================
//  Gemini TTS でナレーション音声を生成するスクリプト
//
//  ▼ 書き換えてよいのは下の NARRATION（ナレーション文）だけです。
//    それ以外のコードは触らないでください。
//
//  実行方法: npm run generate:tts
//    （内部では `node --env-file=.env scripts/generate-tts.js` が動きます）
//  出力先  : audio/narration.wav
// =============================================================

// ▼▼▼ ここだけ自由に書き換えてください（読み上げてほしい文章） ▼▼▼
const NARRATION = `AI動画制作研修へようこそ。
本日は、MARP、Gemini TTS、HyperFrames を使って
動画コンテンツを作る方法を学びます。`;
// ▲▲▲ ここまで ▲▲▲

// ---- ここから下は触らない ----
import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";

// Gemini TTS の出力仕様（変更不可）
const SAMPLE_RATE = 24000; // 24kHz
const BITS_PER_SAMPLE = 16; // 16bit
const CHANNELS = 1; // モノラル
const MODEL = "gemini-2.5-flash-preview-tts";
const VOICE_NAME = "Kore";
const OUTPUT_PATH = path.join("audio", "narration.wav");

// APIキーの確認
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ 環境変数 GEMINI_API_KEY が設定されていません。");
  console.error("   .env.example を .env にコピーし、GEMINI_API_KEY にご自身のキーを設定してください。");
  console.error("   Gemini API キーは Google AI Studio (https://aistudio.google.com/) で取得できます。");
  process.exit(1);
}

// 生の PCM データを WAV ファイル（RIFF/WAVE）に変換する
function pcmToWav(pcmBuffer) {
  const byteRate = (SAMPLE_RATE * CHANNELS * BITS_PER_SAMPLE) / 8;
  const blockAlign = (CHANNELS * BITS_PER_SAMPLE) / 8;
  const dataSize = pcmBuffer.length;

  const header = Buffer.alloc(44);
  // RIFF チャンク
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + dataSize, 4); // ファイル全体サイズ - 8
  header.write("WAVE", 8, "ascii");
  // fmt サブチャンク
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16); // fmt チャンクのサイズ（PCM は 16）
  header.writeUInt16LE(1, 20); // オーディオフォーマット（1 = PCM）
  header.writeUInt16LE(CHANNELS, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(BITS_PER_SAMPLE, 34);
  // data サブチャンク
  header.write("data", 36, "ascii");
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

async function main() {
  console.log("🎙️  Gemini TTS で音声を生成しています…");

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ parts: [{ text: NARRATION }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: VOICE_NAME },
        },
      },
    },
  });

  // 応答から base64 の PCM データを取り出す
  const base64Pcm = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Pcm) {
    throw new Error("音声データが応答に含まれていませんでした。ナレーション文や API キーをご確認ください。");
  }

  const pcmBuffer = Buffer.from(base64Pcm, "base64");
  const wavBuffer = pcmToWav(pcmBuffer);

  // audio/ ディレクトリが無ければ作成
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, wavBuffer);

  // おおよその再生時間（秒） = PCMバイト数 / (サンプルレート * 1サンプルのバイト数)
  const bytesPerSample = (BITS_PER_SAMPLE / 8) * CHANNELS;
  const seconds = Math.round(pcmBuffer.length / (SAMPLE_RATE * bytesPerSample));

  console.log(`✅ 音声を生成しました: ${OUTPUT_PATH}（長さ: 約${seconds}秒）`);
}

main().catch((error) => {
  console.error("❌ 音声の生成に失敗しました。");
  console.error(`   ${error?.message ?? error}`);
  process.exit(1);
});
