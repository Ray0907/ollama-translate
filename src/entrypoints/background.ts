import { setupMessageHandlers } from '../background/messages';

export default defineBackground(() => {
	console.log('Ollama Translate background script loaded');
	setupMessageHandlers();
});
