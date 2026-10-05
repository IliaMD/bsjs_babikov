(function () {
  const name = document.currentScript.dataset.name;

  class MySelect extends HTMLElement {
    constructor() {
      super();
      console.log('Hello World');
    }

    connectedCallback() {
      this.textContent = `Web component «${name}» is ready`;
    }
  }

  customElements.define(name, MySelect);
})();
