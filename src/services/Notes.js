import { Note } from '@/components'
import Service from './Service'

export default new Service({

    name: 'notes',

    create(parent, propsData) {
        // TODO Add class to parent?
        const NoteComponent = this.vm.extend(Note);
        const component = new NoteComponent({
            parent,
            el: document.createElement('div'),
            propsData,
        });
        // DEBUG
        console.log({parent, component, NoteComponent});
        return component;
    }

})