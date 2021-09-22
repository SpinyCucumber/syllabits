import config from '/config'
import Service from './Service'

export default new Service({

    name: 'config',

    getBlockTypeColor(blockType) {
        return config.blockColors[blockType.name];
    }

});