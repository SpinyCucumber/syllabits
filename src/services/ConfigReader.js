import config from '/config'

export default {

    getBlockTypeColor(blockType) {
        return config.blockColors[blockType.name];
    }

}