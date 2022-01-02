<template>
    <div :class="['scene', type]">
        <div class="static-area"><slot name="static-area"/></div>
        <div class="scroll-area">
            <div class="inner">
                <div class="background-area">
                    <slot name="background-area">
                        <!-- Default background -->
                        <background-image
                            :src="$assets.getTexture('paper2')"
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
/**
 * A scene is a general-purpose layout component that creates a "background area",
 * a "content area" and a "static area" for a single space. The content is rendered
 * over the background, and they scroll as one unit. The static area is drawn over the
 * content, supports absolute positioning, and does not scroll.
 */
import BackgroundImage from './BackgroundImage.vue'

export default {
    components: { BackgroundImage },
    name: 'Scene',
    props: {
        type: { default: '' }
    },
}
</script>