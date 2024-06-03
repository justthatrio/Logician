export function obj2ui(obj) {
    const container = document.createElement('div');
    container.className = 'object-ui-container';

    const objProxy = new Proxy(obj, {
        set(obj, prop, val){
            obj[prop] = val;
            container.querySelector(`#input-${prop}`).value = val;
        }
    } );
    container.proxy = objProxy;

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const fieldWrapper = document.createElement('div');
            fieldWrapper.className = 'field-wrapper';

            const label = document.createElement('label');
            label.textContent = key;
            label.setAttribute('for', `input-${key}`);
            fieldWrapper.appendChild(label);

            let input;

            if (typeof obj[key] === 'boolean') {
                input = document.createElement('input');
                input.type = 'checkbox';
                input.id = `input-${key}`;
                input.checked = obj[key];
                input.addEventListener('change', function() {
                    obj[key] = input.checked;
                    console.log(`Updated ${key}: ${obj[key]}`);
                });
            } else if (typeof obj[key] === 'number') {
                input = document.createElement('input');
                input.type = 'number';
                input.id = `input-${key}`;
                input.value = obj[key];
                input.addEventListener('input', function() {
                    obj[key] = parseFloat(input.value);
                    console.log(`Updated ${key}: ${obj[key]}`);
                });
            } else {
                input = document.createElement('input');
                input.type = 'text';
                input.id = `input-${key}`;
                input.value = obj[key];
                input.addEventListener('input', function() {
                    obj[key] = input.value;
                    console.log(`Updated ${key}: ${obj[key]}`);
                });
            }

            fieldWrapper.appendChild(input);
            container.appendChild(fieldWrapper);
        }
    }
    return container;
}
window.obj2ui = obj2ui;