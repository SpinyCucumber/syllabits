<template>
    <scene type="is-aligned is-centered">
        <template #content-area>
            <div class="login-view">
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
            </div>
        </template>
    </scene>
</template>

<script>
import { Scene } from '@/components'
import { Login } from '@/queries'

export default {
    name: 'Login',
    components: { Scene },
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
            this.$apollo.mutate({ mutation: Login, variables: { input: this.input } })
                .then(result => result.data.login.result)
                .then(token => {
                    this.busy = false;
                    // If we received a valid token, set the identity and navigate to dashboard
                    // In either case send the user a nice message
                    if (token) {
                        this.$store.dispatch('loadIdentity', token);
                        this.$buefy.toast.open({
                            message: this.$translation.get('message.loginsuccess'),
                            type: 'is-success'
                        });
                        this.$router.push({ name: 'Dashboard' });
                    }
                    else {
                        this.$buefy.toast.open({
                            message: this.$translation.get('message.loginfail'),
                            type: 'is-danger'
                        });
                    }
                });
        }
    }
}
</script>