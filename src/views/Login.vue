<template>
    <reader class="login centered">
        <template #content-area>
            <!-- TODO Could change logo here (or background) to something more exciting -->
            <img :src="$assets.getTexture('Logo')" class="logo"/>
            <form>
                <b-field label="Email" label-position="on-border">
                    <b-input type="email" v-model="inputs.email"/>
                </b-field>
                <b-field label="Password" label-position="on-border">
                    <b-input type="password" v-model="inputs.password"/>
                </b-field>
                <b-button tag="input" type="is-primary" native-type="submit" value="Login"/>
            </form>
        </template>
    </reader>
</template>

<script>
import { Reader } from '@/components'

export default {
    name: 'Login',
    components: { Reader },
    data() {
        return {
            inputs: {}
        }
    },
}
</script>