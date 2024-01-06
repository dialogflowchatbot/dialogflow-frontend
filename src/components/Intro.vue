<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'
import VueScrollTo from 'vue-scrollto';
import Intro from './docs/Intro.vue'
import HowToUse from './docs/HowToUse.vue'
useI18n();
const router = useRouter();
// navigator.language; //"en-US"
// navigator.languages; //["en-US", "zh-CN", "ja-JP"]
function guide() {
    router.push('/guide');
}
function howToUse() {
    VueScrollTo.scrollTo(document.getElementById('howToUse'))
}
function demo() {
    VueScrollTo.scrollTo(document.getElementById('demosList'))
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
                    <el-icon>
                        <SetUp />
                    </el-icon>{{ $t('lang.home.btn1') }}
                </el-button>
            </p>
            <el-button size="large" @click="doc">
                <el-icon>
                    <Document />
                </el-icon>{{ $t('lang.home.btn2') }}
            </el-button>
            <el-button size="large" @click="howToUse" type="primary" plain>
                <el-icon>
                    <MagicStick />
                </el-icon>Check out step by step tutorial
            </el-button>
            <el-button size="large" @click="demo" type="warning" plain>
                <el-icon>
                    <Promotion />
                </el-icon>{{ $t('lang.home.btn3') }}
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
    <Intro />
    <HowToUse />
    <el-row>
        <el-col :span="2" :offset="3">
            <b>Roadmap</b>
        </el-col>
        <el-col :span="13">
            <ul>
                <li><el-checkbox checked disabled />Dialog flow chat bot first release. (v1.0.0)</li>
                <li><el-checkbox checked disabled />Dialog flow testing tool (v1.1.0)</li>
                <li><el-checkbox checked disabled />Support multiple sub-flows (v1.2.0)</li>
                <li><el-checkbox checked disabled />Sub-flows now can jump through each other (v1.3.0)</li>
                <li><el-checkbox checked disabled />Added main flow which contains multiple sub-flows (v1.4.0)</li>
                <li><el-checkbox checked disabled />Added rich text editor for Dialog Node (v1.5.0)</li>
                <li><el-checkbox checked disabled />Added a node to send variable data to external HTTP (v1.6.0)</li>
                <li><el-checkbox checked disabled />Variables can now get data from HTTP URLs by using JSON Pointer or CSS
                    Selector (1.7.0)</li>
                <li><el-checkbox checked disabled />Variables now take data entered by the user and can also set constant
                    values (1.8.0)</li>
                <li><el-checkbox disabled />Collect node supports multiple entities collection</li>
                <li><el-checkbox disabled />Flow Data export and import</li>
                <li><el-checkbox disabled />Intent detection is more accurate</li>
                <li><el-checkbox disabled />Emotion recognition</li>
                <li><el-checkbox disabled />Adapter for FreeSwith</li>
            </ul>
        </el-col>
    </el-row>
    <p>
        <hr />
    </p>
</template>