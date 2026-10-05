(function () {
  const name = document.currentScript.dataset.name;

  class MySelect extends HTMLElement {
    #shadow;
    #selectButton;
    #selectButtonLabel;
    #selectPopup;
    #optionsBox;
    #options = [];
    #selectedValues = [];
    #onDocumentClick = (evt) => {
      if (!this.#selectPopup?.classList.contains('open')) {
        return;
      }

      if (evt.composedPath().includes(this)) {
        return;
      }

      this.#closePopup();
    };

    constructor() {
      super();
    }

    get value() {
      return this.#selectedValues.join(',');
    }

    set value(next) {
      this.#selectedValues = String(next || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      this.#syncCheckedState();
      this.#updateButtonLabel();
    }

    connectedCallback() {
      if (!this.#shadow) {
        this.#shadow = this.attachShadow({ mode: 'open' });
        this.#createTemplate();
      }

      document.addEventListener('click', this.#onDocumentClick);
    }

    disconnectedCallback() {
      document.removeEventListener('click', this.#onDocumentClick);
    }

    adoptedCallback() {}

    attributeChangedCallback() {}

    #togglePopup() {
      const isOpen = this.#selectPopup.classList.toggle('open');
      this.#selectButton.classList.toggle('open', isOpen);
    }

    #closePopup() {
      this.#selectPopup.classList.remove('open');
      this.#selectButton.classList.remove('open');
    }

    #getSearchInput() {
      const slot = this.#shadow.querySelector('slot[name="search"]');
      const assigned = slot.assignedElements({ flatten: true });

      if (assigned.length) {
        const first = assigned[0];
        return first.matches('input') ? first : first.querySelector('input');
      }

      return slot.querySelector('input');
    }

    #createTemplate() {
      this.#options = Array.from(this.querySelectorAll('option')).map((option) => ({
        [option.value]: option.textContent,
      }));

      this.querySelectorAll('option').forEach((option) => option.remove());

      const template = document.createElement('template');
      template.innerHTML = `
        <style>
          :host {
            position: relative;
            display: inline-block;
            width: var(--select-width, 18rem);
            font-family: var(--select-font-family, system-ui, -apple-system, sans-serif);
            font-size: var(--select-font-size, 0.875rem);
            color: var(--select-text-color, #334155);
          }

          .select-button {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
            width: 100%;
            min-height: 2.5rem;
            padding: 0.5rem 0.75rem;
            border: 1px solid var(--select-border-color, #cbd5e1);
            border-radius: var(--select-border-radius, 6px);
            background: var(--select-button-background, #ffffff);
            color: inherit;
            font: inherit;
            text-align: left;
            cursor: pointer;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
          }

          .select-button:hover {
            border-color: var(--select-hover-border-color, #94a3b8);
          }

          .select-button:focus {
            outline: none;
            border-color: var(--select-focus-border-color, #3b82f6);
            box-shadow: 0 0 0 3px var(--select-focus-ring, rgba(59, 130, 246, 0.2));
          }

          .select-button__label {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: var(--select-placeholder-color, #64748b);
          }

          .select-button__label.has-value {
            color: inherit;
          }

          .select-button__icon {
            flex-shrink: 0;
            width: 0.9rem;
            height: 0.9rem;
            color: var(--select-icon-color, #64748b);
            transition: transform 0.15s ease;
          }

          .select-button.open .select-button__icon {
            transform: rotate(180deg);
          }

          .select-popup {
            display: none;
            position: absolute;
            top: calc(100% + 0.25rem);
            left: 0;
            z-index: 10;
            width: 100%;
            max-height: var(--select-popup-max-height, 16rem);
            overflow: hidden;
            border: 1px solid var(--select-border-color, #cbd5e1);
            border-radius: var(--select-border-radius, 6px);
            background: var(--select-popup-background, #ffffff);
            box-shadow: var(--select-popup-shadow, 0 10px 25px rgba(15, 23, 42, 0.12));
          }

          .select-popup.open {
            display: flex;
            flex-direction: column;
          }

          .select-popup-search,
          ::slotted(input),
          ::slotted([slot="search"]) {
            display: block;
            width: 100%;
            margin: 0;
            padding: 0.65rem 0.75rem;
            border: 0;
            border-bottom: 1px solid var(--select-border-color, #e2e8f0);
            background: transparent;
            color: inherit;
            font: inherit;
            box-sizing: border-box;
          }

          .select-popup-search:focus,
          ::slotted(input:focus) {
            outline: none;
          }

          .select-popup-search::placeholder {
            color: var(--select-placeholder-color, #94a3b8);
          }

          .select-popup-options {
            overflow: auto;
            max-height: var(--select-options-max-height, 12rem);
            padding: 0.35rem;
          }

          .option {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            margin: 0;
            padding: 0.45rem 0.55rem;
            border-radius: 4px;
            cursor: pointer;
            user-select: none;
          }

          .option:hover {
            background: var(--select-option-hover-background, #f1f5f9);
          }

          .option input {
            width: 1rem;
            height: 1rem;
            margin: 0;
            accent-color: var(--select-accent-color, #3b82f6);
            cursor: pointer;
          }
        </style>

        <button class="select-button" type="button">
          <span class="select-button__label">Select</span>
          <svg class="select-button__icon" viewBox="0 0 12 8" aria-hidden="true">
            <path d="M1 1.5L6 6.5L11 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="select-popup">
          <slot name="search">
            <input class="select-popup-search" type="search" placeholder="Search..." />
          </slot>
          <div class="select-popup-options"></div>
        </div>
      `;

      this.#shadow.append(template.content.cloneNode(true));

      this.#selectButton = this.#shadow.querySelector('.select-button');
      this.#selectButtonLabel = this.#shadow.querySelector('.select-button__label');
      this.#selectPopup = this.#shadow.querySelector('.select-popup');
      this.#optionsBox = this.#shadow.querySelector('.select-popup-options');

      this.#refreshOptions(this.#options);
      this.#bindSearchInput();

      this.#selectButton.addEventListener('click', () => this.#togglePopup());
    }

    #bindSearchInput() {
      const slot = this.#shadow.querySelector('slot[name="search"]');

      const bind = () => {
        const input = this.#getSearchInput();
        if (!input || input.dataset.bound === 'true') {
          return;
        }

        input.dataset.bound = 'true';
        input.addEventListener('input', (evt) => this.#filterOptions(evt.target.value));
      };

      bind();
      slot.addEventListener('slotchange', bind);
    }

    #filterOptions(query) {
      const normalized = String(query || '').trim().toLowerCase();
      const filtered = this.#options.filter((item) => {
        const [value, text] = Object.entries(item)[0];
        return (
          text.toLowerCase().includes(normalized) ||
          value.toLowerCase().includes(normalized)
        );
      });

      this.#refreshOptions(filtered);
    }

    #refreshOptions(options) {
      const renderedOptions = this.#renderOptions(options);
      this.#optionsBox.replaceWith(renderedOptions);
      this.#optionsBox = renderedOptions;
      this.#syncCheckedState();
    }

    #renderOptions(options) {
      const boxTemplate = document.createElement('template');
      boxTemplate.innerHTML = '<div class="select-popup-options"></div>';
      const optionsBox = boxTemplate.content.firstElementChild;

      const optionTemplate = document.createElement('template');
      optionTemplate.innerHTML =
        '<label class="option"><input type="checkbox" /></label>';

      options.forEach((item) => {
        const [value, text] = Object.entries(item)[0];
        const node = optionTemplate.content.cloneNode(true);
        const label = node.querySelector('.option');
        const checkbox = label.querySelector('input');

        label.dataset.value = value;
        label.append(document.createTextNode(text));
        checkbox.checked = this.#selectedValues.includes(value);

        checkbox.addEventListener('change', () => {
          this.#onOptionChange(value, checkbox.checked);
        });

        optionsBox.append(node);
      });

      return optionsBox;
    }

    #onOptionChange(value, checked) {
      if (checked) {
        if (!this.#selectedValues.includes(value)) {
          this.#selectedValues.push(value);
        }
      } else {
        this.#selectedValues = this.#selectedValues.filter((item) => item !== value);
      }

      this.#updateButtonLabel();
    }

    #syncCheckedState() {
      if (!this.#optionsBox) {
        return;
      }

      this.#optionsBox.querySelectorAll('.option').forEach((label) => {
        const checkbox = label.querySelector('input');
        checkbox.checked = this.#selectedValues.includes(label.dataset.value);
      });
    }

    #updateButtonLabel() {
      if (!this.#selectButtonLabel) {
        return;
      }

      if (!this.#selectedValues.length) {
        this.#selectButtonLabel.textContent = 'Select';
        this.#selectButtonLabel.classList.remove('has-value');
        return;
      }

      const labels = this.#selectedValues.map((value) => {
        const match = this.#options.find((item) => Object.keys(item)[0] === value);
        return match ? Object.values(match)[0] : value;
      });

      this.#selectButtonLabel.textContent = labels.join(', ');
      this.#selectButtonLabel.classList.add('has-value');
    }
  }

  customElements.define(name, MySelect);
})();
