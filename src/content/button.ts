type ButtonState = 'idle' | 'translating' | 'done';

let button_el: HTMLButtonElement | null = null;
let current_state: ButtonState = 'idle';

export function createFloatingButton(onClick: () => void): void {
	if (button_el) return;

	button_el = document.createElement('button');
	button_el.className = 'ollama-float-btn';
	button_el.setAttribute('aria-label', 'Translate page');
	button_el.textContent = '翻';

	button_el.addEventListener('click', onClick);

	document.body.appendChild(button_el);
}

export function removeFloatingButton(): void {
	button_el?.remove();
	button_el = null;
}

export function setButtonState(state: ButtonState): void {
	if (!button_el) return;

	current_state = state;

	button_el.classList.remove(
		'ollama-float-btn--translating',
		'ollama-float-btn--done'
	);

	switch (state) {
		case 'idle':
			button_el.textContent = '翻';
			button_el.setAttribute('aria-label', 'Translate page');
			break;

		case 'translating':
			button_el.textContent = '...';
			button_el.classList.add('ollama-float-btn--translating');
			button_el.setAttribute('aria-label', 'Translating...');
			break;

		case 'done':
			button_el.textContent = '翻';
			button_el.setAttribute('aria-label', 'Translation complete. Click to clear.');
			break;
	}
}

export function getButtonState(): ButtonState {
	return current_state;
}
