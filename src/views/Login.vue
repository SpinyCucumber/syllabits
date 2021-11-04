<template>
    <reader class="login centered">
        <template #content-area>
            <!-- TODO Could change logo here (or background) to something more exciting -->
            <img :src="$assets.getTexture('Logo')" class="logo"/>
            <form @submit.prevent="submit">
                <b-field label="Email" label-position="on-border">
                    <b-input type="email" v-model="input.email"/>
                </b-field>
                <b-field label="Password" label-position="on-border">
                    <b-input type="password" v-model="input.password"/>
                </b-field>
                <b-button tag="input" type="is-primary" native-type="submit" value="Login"/>
            </form>
            <!-- Loading overlay -->
            <b-loading v-model="busy"/>
        </template>
    </reader>
</template>

<script>
import { Reader } from '@/components'
import { login as loginQuery } from '@/queries'

export default {
    name: 'Login',
    components: { Reader },
    data() {
        return {
            input: {},
            busy: false,
        }
    },
    methods: {
        submit() {
            this.busy = true;
            // Submit input to server
            this.$apollo.mutate({ mutation: loginQuery, variables: { input: this.input } })
                .then(result => result.data.login.result)
                .then(token => {
                    this.busy = false;
                    this.$identity.setIdentity(token);
                });
        }
    }
}
</script>