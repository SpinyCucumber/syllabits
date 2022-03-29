import { Hint } from '@/components'
import Service from './Service'

export default new Service({

    name: 'hints',

    create(propsData) {
        // Next, create vue instance and mount to element
        const HintComponent = this.vm.extend(Hint);
        const vm = new HintComponent({
            propsData,
        });
        return vm;
    }

})