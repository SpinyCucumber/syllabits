<template>
    <div class="reader">
        <div class="static-area"><slot name="static-area"/></div>
        <div class="scroll-area">
            <div class="background-area">
                <slot name="background-area">
                    <img :src="$assets.getTexture('Paper2')">
                </slot>
            </div>
            <div class="content-area">
                <div class="inner">
                    <slot name="content-area"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Reader'
}
</script>