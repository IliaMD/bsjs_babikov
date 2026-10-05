(function () {
  const name = document.currentScript.dataset.name;

  class MyPanel extends HTMLElement {
    #shadow;
    #content;
    #toggleButton;

    constructor() {
      super();
    }

    connectedCallback() {
      if (this.#shadow) {
        return;
      }

      this.#shadow = this.attachShadow({ mode: 'open' });
      this.#createTemplate();
    }

    #createTemplate() {
      const header = this.dataset.header || 'Panel';
      const toggleable = this.hasAttribute('toggleable') || this.dataset.toggleable === 'true';

      const template = document.createElement('template');
      template.innerHTML = `
        <style>
          :host {
            display: block;
            overflow: visible;
            font-family: var(--panel-font-family, system-ui, -apple-system, sans-serif);
            color: var(--panel-text-color, #334155);
          }

          .panel {
            border: 1px solid var(--panel-border-color, #e2e8f0);
            border-radius: var(--panel-border-radius, 8px);
            background: var(--panel-background, #ffffff);
            box-shadow: var(--panel-shadow, 0 1px 2px rgba(15, 23, 42, 0.06));
            overflow: visible;
          }

          .panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            padding: 0.85rem 1rem;
            border-bottom: 1px solid var(--panel-border-color, #e2e8f0);
            background: var(--panel-header-background, #f8fafc);
          }

          .panel-title {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            color: var(--panel-title-color, #0f172a);
          }

          .panel-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            padding: 0;
            border: 0;
            border-radius: 6px;
            background: transparent;
            color: var(--panel-icon-color, #64748b);
            cursor: pointer;
          }

          .panel-toggle:hover {
            background: var(--panel-toggle-hover-background, #e2e8f0);
          }

          .panel-toggle__icon {
            width: 0.85rem;
            height: 0.85rem;
            transition: transform 0.15s ease;
          }

          .panel.collapsed .panel-toggle__icon {
            transform: rotate(-90deg);
          }

          .panel.collapsed .panel-header {
            border-bottom: 0;
          }

          .panel-content {
            padding: var(--panel-content-padding, 1rem);
            overflow: visible;
          }

          .panel.collapsed .panel-content {
            display: none;
          }

          .panel-toggle[hidden] {
            display: none;
          }
        </style>

        <section class="panel">
          <div class="panel-header">
            <slot name="header">
              <h2 class="panel-title"></h2>
            </slot>
            <button class="panel-toggle" type="button" aria-expanded="true" ${toggleable ? '' : 'hidden'}>
              <svg class="panel-toggle__icon" viewBox="0 0 12 8" aria-hidden="true">
                <path d="M1 1.5L6 6.5L11 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="panel-content">
            <slot></slot>
          </div>
        </section>
      `;

      this.#shadow.append(template.content.cloneNode(true));

      const title = this.#shadow.querySelector('.panel-title');
      if (title) {
        title.textContent = header;
      }

      this.#content = this.#shadow.querySelector('.panel');
      this.#toggleButton = this.#shadow.querySelector('.panel-toggle');

      if (toggleable) {
        this.#toggleButton.addEventListener('click', () => {
          const collapsed = this.#content.classList.toggle('collapsed');
          this.#toggleButton.setAttribute('aria-expanded', String(!collapsed));
        });
      }
    }
  }

  customElements.define(name, MyPanel);
})();
