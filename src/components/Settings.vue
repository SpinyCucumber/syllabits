<template>
  <div class="submenu">
    <component v-for="control in controls"
        :key="control.key"
        :is="control.component"
        v-model="settings[control.key]">
        {{ $translation.get('setting.' + control.key) }}
    </component>
  </div>
</template>

<script>
import { BSwitch } from 'buefy/dist/components/switch'
import store from '@/store'

/**
 * Expects module to be namespaced
 */
function mapFields(module, fields) {
    let props = {}
    for (const field of fields) {
        Object.defineProperty(props, field, {
            get() {
                return store.state[module][field];
            },
            set(value) {
                store.commit(module + '/' + field, value);
            },
        })
    }
    return props;
}

export default {
    name: 'Settings',
    data() {
        return {
            controls: [
                { component: BSwitch, key: 'hints' },
                { component: BSwitch, key: 'readability' },
            ]
        }
    },
    setup() {
        return { settings: mapFields('settings', ['hints', 'readability']) }
    },
}
</script>