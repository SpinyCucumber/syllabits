<template>
    <scene type="is-aligned is-centered">
        <template #content-area>
            <div class="register">
                <!-- TODO Could change logo here (or background) to something more exciting -->
                <img :src="$assets.getTexture('Logo')" class="logo"/>
                <form @submit.prevent="submit">
                    <b-field label="Email" label-position="on-border">
                        <b-input type="email" v-model="input.email"/>
                    </b-field>
                    <b-field label="Password" label-position="on-border">
                        <b-input type="password" v-model="input.password"/>
                    </b-field>
                    <b-button tag="input" type="is-primary" native-type="submit" value="Register"/>
                </form>
                <!-- Loading overlay -->
                <b-loading v-model="busy"/>
            </div>
        </template>
    </scene>
</template>

<script>
import { Scene } from '@/components'
import { register as registerQuery } from '@/queries'

// Register error name -> translation key
const ERROR_LOOKUP = {
    USER_EXISTS: 'userexists'
}

export default {
    name: 'Register',
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
            this.$apollo.mutate({ mutation: registerQuery, variables: { input: this.input } })
                .then(result => result.data.register)
                .then(response => {
                    this.busy = false;
                    // If the response was OK, we set the identity using the new token
                    // and navigate to the dashboard (and show a nice message as well.)
                    // Otherwise, we display an error message.
                    if (response.ok) {
                        const token = response.result;
                        this.$identity.setIdentity(token);
                        this.$buefy.toast.open({
                            message: this.$translation.get('message.registersuccess'),
                            type: 'is-success'
                        });
                        this.$router.push({ name: 'Dashboard' });
                    }
                    else {
                        const key = 'message.register' + ERROR_LOOKUP[response.error];
                        this.$buefy.toast.open({
                            message: this.$translation.get(key),
                            type: 'is-danger'
                        });
                    }
                });
        }
    }
}
</script>