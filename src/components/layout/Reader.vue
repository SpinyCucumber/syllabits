<template>
    <div :class="['reader', type]">
        <div class="static-area"><slot name="static-area"/></div>
        <div class="scroll-area">
            <div class="inner">
                <div class="background-area">
                    <slot name="background-area">
                        <!-- Default background -->
                        <background-image
                            :src="$assets.getTexture('Paper2')"
                            class="muted"/>
                    </slot>
                </div>
                <div class="content-area">
                    <slot name="content-area"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import BackgroundImage from './BackgroundImage.vue'

export default {
    components: { BackgroundImage },
    name: 'Reader',
    props: {
        type: { default: '' }
    },
}
</script>