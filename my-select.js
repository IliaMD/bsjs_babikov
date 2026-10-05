(function () {
  const name = document.currentScript.dataset.name;

  class MySelect extends HTMLElement {
    #shadow;
    #selectButton;
    #selectPopup;
    #selectPopupSearch;
    #optionsBox;
    #options = [];

    constructor() {
      super();
    }

    connectedCallback() {
      this.#shadow = this.attachShadow({ mode: 'open' });
      this.#createTemplate();
    }

    disconnectedCallback() {}

    adoptedCallback() {}

    attributeChangedCallback() {}

    #openPopup() {
      this.#selectPopup.classList.toggle('open');
      this.#selectButton.classList.toggle('open');
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

          .select-popup-search {
            width: 100%;
            margin: 0;
            padding: 0.65rem 0.75rem;
            border: 0;
            border-bottom: 1px solid var(--select-border-color, #e2e8f0);
            background: transparent;
            color: inherit;
            font: inherit;
          }

          .select-popup-search:focus {
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
          <input class="select-popup-search" type="search" placeholder="Search..." />
          <div class="select-popup-options"></div>
        </div>
      `;

      this.#shadow.append(template.content.cloneNode(true));

      this.#selectButton = this.#shadow.querySelector('.select-button');
      this.#selectPopup = this.#shadow.querySelector('.select-popup');
      this.#selectPopupSearch = this.#shadow.querySelector('.select-popup-search');
      this.#optionsBox = this.#shadow.querySelector('.select-popup-options');

      const renderedOptions = this.#renderOptions(this.#options);
      this.#optionsBox.replaceWith(renderedOptions);
      this.#optionsBox = renderedOptions;

      this.#selectButton.addEventListener('click', () => this.#openPopup());
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

        label.dataset.value = value;
        label.append(document.createTextNode(text));
        optionsBox.append(node);
      });

      return optionsBox;
    }
  }

  customElements.define(name, MySelect);
})();
