import Service from './Service'

export default new Service({

    name: 'assets',

    getIcon(iconID, ext) {
        return require('/src/assets/icons/' + iconID + '.' + (ext || 'svg'));
    },

    getSound(soundID) {
        return require('/src/assets/sounds/' + soundID + '.ogg'); 
    },

});