class Service {

    constructor(options) {
        Object.assign(this, options);
    }

    install(vue) {
        vue.prototype[`$${this.name}`] = this;
    }

}

export default Service;