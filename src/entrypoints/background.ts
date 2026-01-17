import { setupMessageHandlers } from '../background/messages';

export default defineBackground(() => {
	setupMessageHandlers();
});
