<script setup>
import HowToUse from './HowToUse.vue'
import { useRouter } from 'vue-router';
const router = useRouter();
const goBack = () => {
    router.push('/guide')
}
</script>
<template>
    <el-page-header title="Back" @back="goBack">
        <template #content>
            <span class="text-large font-600 mr-3"> Tutorial: How to use this application </span>
        </template>
    </el-page-header>
    <HowToUse />
</template>