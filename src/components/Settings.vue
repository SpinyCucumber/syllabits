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
import { mapFields } from 'vuex-map-fields';
import { BSwitch } from 'buefy/dist/components/switch'

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
    computed: {
        ...mapFields(['settings'])
    },
}
</script>