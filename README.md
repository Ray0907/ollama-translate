# Ollama Translate

Local immersive translation Chrome extension powered by Ollama and TranslateGemma models.

## Features

- Bilingual display: Shows translations below original paragraphs
- Manual translation via floating button or popup
- Auto-translate option for specific sites
- Multiple model support (TranslateGemma 4B/12B/27B or any Ollama model)
- Progressive translation reveal for better perceived performance
- Dark/light mode follows system preference
- 55+ language support

## Requirements

- [Ollama](https://ollama.ai/) running locally on port 11434
- A translation model, recommended: `ollama pull translategemma:4b`

## Installation

### Development

```bash
npm install
npm run dev
```

Load the extension from `dist/` in Chrome's extension page (Developer mode).

### Production Build

```bash
npm run build
```

The built extension will be in `dist/`.

## Usage

1. Start Ollama: `OLLAMA_ORIGINS='*' ollama serve`
2. Pull a model: `ollama pull translategemma:4b`
3. Click the extension icon to open the popup
4. Select your target language
5. Click "Translate This Page" or use the floating button on any webpage

## Configuration

- **Target Language**: Choose from 55+ supported languages
- **Model**: Select which Ollama model to use for translation
- **Temperature**: Adjust translation creativity (0.0-1.0)
- **Custom Prompt**: Override the default translation prompt
- **Auto-translate**: Enable automatic translation for specific sites

## Project Structure

```
src/
  shared/          # Types and constants
  background/      # Service worker (storage, Ollama API, message handlers)
  content/         # Content script (DOM parser, translation injector, floating button)
  entrypoints/
    popup/         # Svelte popup UI
    content.ts     # Content script entry
    background.ts  # Background entry
```

## Tech Stack

- WXT (Chrome extension framework)
- Svelte 5 (popup UI)
- TypeScript
- Tailwind CSS v4
