(function () {
  const name = document.currentScript.dataset.name;

  class MySelect extends HTMLElement {
    #selectButton;
    #selectPopup;
    #selectPopupSearch;
    #optionsBox;
    #options = [];

    constructor() {
      super();
    }

    connectedCallback() {
      this.#createTemplate();
    }

    disconnectedCallback() {}

    adoptedCallback() {}

    attributeChangedCallback() {}

    #createTemplate() {
      this.#options = Array.from(this.querySelectorAll('option')).map((option) => ({
        [option.value]: option.textContent,
      }));

      this.querySelectorAll('option').forEach((option) => option.remove());

      const template = document.createElement('template');
      template.innerHTML = `
        <button class="select-button" type="button"></button>
        <div class="select-popup">
          <input class="select-popup-search" type="search" placeholder="Search..." />
          <div class="select-popup-options"></div>
        </div>
      `;

      this.append(template.content.cloneNode(true));

      this.#selectButton = this.querySelector('.select-button');
      this.#selectPopup = this.querySelector('.select-popup');
      this.#selectPopupSearch = this.querySelector('.select-popup-search');
      this.#optionsBox = this.querySelector('.select-popup-options');

      const renderedOptions = this.#renderOptions(this.#options);
      this.#optionsBox.replaceWith(renderedOptions);
      this.#optionsBox = renderedOptions;
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
