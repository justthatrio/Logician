export class Panel extends HTMLElement{
    constructor(){
        super()
    }
    connectedCallback(){
        if(this.shadowRoot) return;
        const shaddow = this.attachShadow({mode:"closed"});
        
        
    }
}
window.customElements.define('code-editor', Panel);
