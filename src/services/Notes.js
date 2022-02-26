import { Note } from '@/components'
import Service from './Service'

export default new Service({

    name: 'notes',

    create(propsData) {
        // Next, create vue instance and mount to element
        const NoteComponent = this.vm.extend(Note);
        const component = new NoteComponent({
            propsData,
        });
        return component;
    }

})