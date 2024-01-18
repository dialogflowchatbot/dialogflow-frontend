<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'
// import VueScrollTo from 'vue-scrollto';
import { winScrollTo } from '../assets/tools.js'
import IntroDoc from './docs/IntroDoc.vue'
import HowToUse from './docs/HowToUse.vue'
useI18n();
const router = useRouter();
// navigator.language; //"en-US"
// navigator.languages; //["en-US", "zh-CN", "ja-JP"]
function guide() {
    router.push('/guide');
}
function howToUse() {
    // VueScrollTo.scrollTo(document.getElementById('howToUse'))
    winScrollTo(document.getElementById('howToUse'))
}
function demo() {
    // VueScrollTo.scrollTo(document.getElementById('demosList'))
    winScrollTo(document.getElementById('demosList'))
}
function doc() {
    router.push('/docs');
}
</script>
<style scoped>
.hero-image {
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("../assets/hero_bg.jpg");
    height: 500px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    position: relative;
    margin-bottom: 50px;
}

.hero-text {
    text-align: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
}

.download {
    margin-top: 20px;
    margin-bottom: 20px;
    padding-top: 20px;
    padding-bottom: 20px;
    background-color: aliceblue;
    text-align: center;
}
</style>
<template>
    <div class="hero-image">
        <div class="hero-text">
            <h1 style="font-size: 50px;">{{ $t('lang.home.title') }}</h1>
            <p>{{ $t('lang.home.subTitle') }}</p>
            <p>
                <el-button size="large" @click="guide">
                    {{ $t('lang.home.btn1') }}
                </el-button>
            </p>
            <el-button @click="doc">
                {{ $t('lang.home.btn2') }}
            </el-button>
            <el-button @click="howToUse" type="primary" plain>
                Check out step by step tutorial
            </el-button>
            <el-button @click="demo" type="warning" plain>
                {{ $t('lang.home.btn3') }}
            </el-button>
        </div>
    </div>
    <div class="download">
        <h1>{{ $t('lang.home.dlTitle') }}</h1>
        <p>{{ $t('lang.home.dl1') }}: <a
                href="https://github.com/dialogflowchatbot/dialogflow/releases">https://github.com/dialogflowchatbot/dialogflow/releases</a>
        </p>
        <p v-html="$t('lang.home.dl2')"></p>
    </div>
    <IntroDoc />
    <HowToUse />
    <p>
        <hr />
    </p>
</template>