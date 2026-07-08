# AIコンテンツ内製化 スターター（MARP + Gemini TTS + HyperFrames）

Markdown で書いたスライドを、**ナレーション付きの MP4 動画**に自動で仕上げるためのスターター一式です。
研修や社内向けの動画コンテンツを、デザイナーや動画編集者に頼らず「自分たちで（内製で）」作れるようになります。

制作の流れはたった3ステップです。

1. **MARP** … Markdown（`slides/demo.md`）からスライド画像（PNG）を作る
2. **Gemini TTS** … 文章から AI ナレーション音声（WAV）を作る
3. **HyperFrames** … スライド画像とナレーションを合成して MP4 動画にする

```
Markdown ──MARP──▶ スライド画像 ┐
                                 ├─HyperFrames─▶ 完成した動画 (output/demo.mp4)
文章 ──Gemini TTS──▶ ナレーション ┘
```

---

## 必要な環境

| ツール | バージョン | 用途 |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | **22 以上** | スクリプトの実行 |
| [FFmpeg](https://ffmpeg.org/) | 最新版 | 動画の書き出し（HyperFrames が内部で使用） |
| Gemini API キー | - | AI ナレーションの生成（[Google AI Studio](https://aistudio.google.com/) で無料取得） |

> ヒント: Chrome は HyperFrames に同梱されるため、別途インストールは不要です。

---

## セットアップ

```bash
# 1. 依存パッケージをインストール
npm install

# 2. 環境変数ファイルを用意（.env.example をコピー）
cp .env.example .env
#   Windows (PowerShell) の場合: Copy-Item .env.example .env

# 3. .env を開き、GEMINI_API_KEY にご自身のキーを設定
#    GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxx
```

`.env` は API キーを含む秘密ファイルです。Git には登録されません（`.gitignore` 済み）。

---

## 使い方

### まとめて実行（おすすめ）

スライド生成 → ナレーション生成 → 動画書き出しを一気に行います。

```bash
npm run build
```

完成した動画は `output/demo.mp4` に出力されます。

### 1ステップずつ実行

| コマンド | 何をするか | 出力 |
| --- | --- | --- |
| `npm run generate:slides` | `slides/demo.md` からスライド画像を生成 | `slides/demo.001.png` 〜 `demo.003.png` |
| `npm run generate:tts` | ナレーション音声を生成 | `audio/narration.wav` |
| `npm run render` | 画像と音声を合成して動画化 | `output/demo.mp4` |

### スライドの内容を変えたいとき

`slides/demo.md` を編集してください。`---` で区切った1ブロックが1枚のスライドになります。

### ナレーションの文章を変えたいとき

`scripts/generate-tts.js` の先頭にある `NARRATION`（バッククォートで囲まれた文章）だけを書き換えてください。
それ以外の部分は触らなくて大丈夫です。

> スライドの枚数を増やした場合は、`index.html` にも画像（`slides/demo.004.png` …）と表示時間を追記してください。

---

## フォルダ構成

| パス | 説明 |
| --- | --- |
| `slides/demo.md` | スライドの元となる Markdown（**ここを編集**） |
| `slides/demo.00X.png` | MARP が生成するスライド画像（自動生成・Git 管理外） |
| `audio/narration.wav` | Gemini TTS が生成するナレーション（自動生成・Git 管理外） |
| `output/demo.mp4` | 完成した動画（自動生成・Git 管理外） |
| `scripts/generate-tts.js` | ナレーション生成スクリプト（`NARRATION` だけ編集） |
| `index.html` | HyperFrames の合成設定（スライドと音声の並べ方） |
| `compositions/` | 追加の合成パーツを置く場所（今回は未使用） |
| `.env` | Gemini API キーを書く秘密ファイル（自分で作成） |
| `.env.example` | `.env` のひな形 |

---

## うまくいかないときは

- **`npm run generate:slides` でエラー** … MARP は内部でヘッドレス Chrome を使います。実行環境によっては追加の依存が必要になる場合があります。
- **`npm run generate:tts` で「GEMINI_API_KEY が設定されていません」** … `.env` を作成し、キーを設定できているか確認してください。
- **`npm run render` でエラー** … FFmpeg がインストールされているか確認してください（`ffmpeg -version` で確認できます）。

---

このリポジトリは Code Lesson「AIコンテンツ内製化コース」の教材として使用します。
