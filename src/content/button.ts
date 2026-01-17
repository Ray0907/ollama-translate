type ButtonState = 'idle' | 'translating' | 'done';

let button_el: HTMLButtonElement | null = null;
let progress_el: HTMLSpanElement | null = null;
let current_state: ButtonState = 'idle';
let on_cancel_callback: (() => void) | null = null;

export function createFloatingButton(
	onClick: () => void,
	onCancel?: () => void
): void {
	if (button_el) return;

	on_cancel_callback = onCancel || null;

	// Create container
	const container = document.createElement('div');
	container.className = 'ollama-float-container';

	// Create button
	button_el = document.createElement('button');
	button_el.className = 'ollama-float-btn';
	button_el.setAttribute('aria-label', 'Translate page');
	// Use SVG translate icon instead of Chinese text for better compatibility
	button_el.innerHTML = `<span class="ollama-btn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg></span>`;

	// Create progress indicator
	progress_el = document.createElement('span');
	progress_el.className = 'ollama-progress';
	progress_el.style.display = 'none';

	button_el.addEventListener('click', () => {
		if (current_state === 'translating' && on_cancel_callback) {
			on_cancel_callback();
		} else {
			onClick();
		}
	});

	container.appendChild(button_el);
	container.appendChild(progress_el);
	document.body.appendChild(container);
}

export function removeFloatingButton(): void {
	button_el?.parentElement?.remove();
	button_el = null;
	progress_el = null;
}

export function setButtonState(state: ButtonState): void {
	if (!button_el) return;

	current_state = state;

	button_el.classList.remove(
		'ollama-float-btn--translating',
		'ollama-float-btn--done'
	);

	const icon_el = button_el.querySelector('.ollama-btn-icon');

	// Translate icon SVG
	const translate_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>';
	// X icon for cancel
	const cancel_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
	// Check icon for done
	const check_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

	switch (state) {
		case 'idle':
			if (icon_el) icon_el.innerHTML = translate_icon;
			button_el.setAttribute('aria-label', 'Translate page');
			if (progress_el) {
				progress_el.style.display = 'none';
				progress_el.textContent = '';
			}
			break;

		case 'translating':
			if (icon_el) icon_el.innerHTML = cancel_icon;
			button_el.classList.add('ollama-float-btn--translating');
			button_el.setAttribute('aria-label', 'Cancel translation');
			break;

		case 'done':
			if (icon_el) icon_el.innerHTML = check_icon;
			button_el.classList.add('ollama-float-btn--done');
			button_el.setAttribute('aria-label', 'Translation complete. Click to clear.');
			if (progress_el) {
				progress_el.style.display = 'none';
				progress_el.textContent = '';
			}
			break;
	}
}

export function updateProgress(current: number, total: number): void {
	if (!progress_el) return;

	if (current > 0 && total > 1) {
		progress_el.style.display = 'block';
		progress_el.textContent = `${current}/${total}`;
	} else {
		progress_el.style.display = 'none';
	}
}

export function getButtonState(): ButtonState {
	return current_state;
}
