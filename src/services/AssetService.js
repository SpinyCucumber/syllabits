import Service from './Service'

export default new Service({

    name: 'assets',

    getIcon(iconID) {
        return require('/src/assets/icons/' + iconID + '.svg');
    },

    getTexture(textureID) {
        return require('/src/assets/textures/' + textureID + '.png');
    },

    getSound(soundID) {
        return require('/src/assets/sounds/' + soundID + '.ogg'); 
    },

});