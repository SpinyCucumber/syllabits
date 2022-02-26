import { Note } from '@/components'
import Service from './Service'

export default new Service({

    name: 'notes',

    create(container, propsData) {
        // Create new element and attach to parent
        // We also add a class to the parent to mark it as a container
        container.classList.add('note-container');
        const el = document.createElement('div');
        container.appendChild(el);
        // Next, create vue instance and mount to element
        const NoteComponent = this.vm.extend(Note);
        const component = new NoteComponent({
            el,
            propsData,
        });
        return component;
    }

})