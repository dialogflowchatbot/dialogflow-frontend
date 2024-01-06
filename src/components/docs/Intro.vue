<script setup>
import { useI18n } from 'vue-i18n'
import VueScrollTo from 'vue-scrollto';
import Demos from '../Demos.vue'
useI18n();
// navigator.language; //"en-US"
// navigator.languages; //["en-US", "zh-CN", "ja-JP"]
const isEnLanguage = navigator.language ? navigator.language.split('-')[0] == 'en' : false
const title3Span = isEnLanguage ? 8 : 7;
const title3Offset = isEnLanguage ? 2 : 3;
const fromPage = 'home';
function demo() {
    VueScrollTo.scrollTo(document.getElementById('demosList'))
}
</script>
<style scoped>
.title1 {
    background-image: url("../../assets/easy.png");
    background-repeat: no-repeat;
    height: 100x;
    padding-left: 60px;
}

.title2 {
    background-image: url("../../assets/rocket.png");
    background-repeat: no-repeat;
    height: 100x;
    padding-left: 60px;
}

.title3 {
    background-image: url("../../assets/diversity.png");
    background-repeat: no-repeat;
    height: 100x;
    padding-left: 60px;
}

.title4 {
    background-image: url("../../assets/compatible.png");
    background-repeat: no-repeat;
    height: 100x;
    padding-left: 70px;
}

.title5 {
    background-image: url("../../assets/link.png");
    background-repeat: no-repeat;
    height: 100x;
    padding-left: 60px;
}

.speed-progress {
    margin-top: 30px;
}

.speed-progress .el-progress--line {
    margin-bottom: 15px;
    width: 500px;
}

.intro .el-row {
    margin-bottom: 30px;
}

.intro div {
    font-size: large;
}

.features {
    /* max-width: 76vw; */
    /*text-align: center;*/
    align-items: center;
    justify-content: center;
}

.features .el-row {
    margin-bottom: 60px;
}

.mid {
    justify-content: center;
    align-items: center;
    vertical-align: middle;
}

.black-line {
    height: 6px;
    background-color: black;
}
</style>
<template>
    <el-row class="mid">
        <el-col :span="8">
            <div class="black-line"></div>
        </el-col>
        <el-col :span="4">
            <h1 style="text-align: center;">{{ $t('lang.home.introTitle') }}</h1>
        </el-col>
        <el-col :span="8">
            <div class="black-line"></div>
        </el-col>
    </el-row>
    <div class="intro">
        <el-row class="mid">
            <el-col :span="2">
                <div><img src="../../assets/talk.png" /></div>
            </el-col>
            <el-col :span="10">
                <div>{{ $t('lang.home.intro1') }}</div>
            </el-col>
        </el-row>
        <el-row class="mid">
            <el-col :span="2">
                <div><img src="../../assets/canvas.png" /></div>
            </el-col>
            <el-col :span="10">
                <div>{{ $t('lang.home.intro2') }}</div>
            </el-col>
        </el-row>
        <el-row class="mid">
            <el-col :span="2">
                <div><img src="../../assets/nodes.png" /></div>
            </el-col>
            <el-col :span="10">
                <div>{{ $t('lang.home.intro3') }}, <el-button color="#b3e19d" @click="demo">See demos</el-button>.</div>
            </el-col>
        </el-row>
        <el-row class="mid">
            <el-col :span="2">
                <div><img src="../../assets/exe.png" /></div>
            </el-col>
            <el-col :span="10">
                <div>{{ $t('lang.home.intro4') }}</div>
            </el-col>
        </el-row>
        <el-row class="mid">
            <el-col :span="2">
                <div><img src="../../assets/scenarios.png" /></div>
            </el-col>
            <el-col :span="10">
                <div>{{ $t('lang.home.intro5') }}</div>
            </el-col>
        </el-row>
        <el-row class="mid">
            <el-col :span="2">
                <div><img src="../../assets/storage.png" /></div>
            </el-col>
            <el-col :span="10">
                <div>{{ $t('lang.home.intro6') }}</div>
            </el-col>
        </el-row>
        <el-row class="mid">
            <el-col :span="8">
                <div class="black-line"></div>
            </el-col>
            <el-col :span="4">
                <h1 style="text-align: center;">{{ $t('lang.home.midTitle') }}</h1>
            </el-col>
            <el-col :span="8">
                <div class="black-line"></div>
            </el-col>
        </el-row>
    </div>
    <div class="features">
        <el-row>
            <el-col :span="5" :offset="3">
                <div class="grid-content">
                    <h1 class="title1">{{ $t('lang.home.adv1Title') }}</h1>
                    <div v-html="$t('lang.home.adv1')"></div>
                    <p id="demosList">
                        <Demos :parentPage="fromPage" />
                        <!-- {{ $t('lang.home.demo') }}:
                    <ol>
                        <li>
                            <el-link type="success" @click="gotoDemo('demo-repay', 'UmVwYXkgRGVtbw==')">{{
                                $t('lang.home.demo1') }}</el-link>
                        </li>
                        <li>
                            <el-link type="success"
                                @click="gotoDemo('demo-collect', 'SW5mb3JtYXRpb24gQ29sbGVjdGlvbiBEZW1v')">{{
                                    $t('lang.home.demo2') }}</el-link>
                        </li>
                        <li>
                            <el-link type="success"
                                @click="gotoDemo('demo-notify', 'T25lIFNlbnRlbmNlIE5vdGlmaWNhdGlvbiBEZW1v')">{{
                                    $t('lang.home.demo3') }}</el-link>
                        </li>
                    </ol> -->
                    </p>
                </div>
            </el-col>
            <el-col :span="15">
                <div class="grid-content">
                    <img src="../../assets/easy-b.png" />
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="9" :offset="3">
                <div class="grid-content">
                    <div class="speed-progress">
                        <el-progress :stroke-width="26" :percentage="30" :show-text="false" status="success" />
                        <el-progress :stroke-width="26" :percentage="100" :show-text="false" />
                        <el-progress :stroke-width="26" :percentage="70" :show-text="false" status="warning" />
                        <el-progress :stroke-width="26" :percentage="50" :show-text="false" status="exception" />
                    </div>
                </div>
            </el-col>
            <el-col :span="10" :offset="2">
                <div class="grid-content">
                    <h1 class="title2">{{ $t('lang.home.adv2Title') }}</h1>
                    <div v-html="$t('lang.home.adv2')"></div>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="title3Span" :offset="title3Offset">
                <div class="grid-content">
                    <h1 class="title3">{{ $t('lang.home.adv3Title') }}</h1>
                    <div v-html="$t('lang.home.adv3')"></div>
                </div>
            </el-col>
            <el-col :span="14">
                <div class="grid-content">
                    <img src="../../assets/diversity-b.png" />
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="9" :offset="3">
                <div class="grid-content">
                    <p><img src="../../assets/browsers.png" /></p>
                    <p><img src="../../assets/os.png" /></p>
                </div>
            </el-col>
            <el-col :span="11" :offset="1">
                <div class="grid-content">
                    <h1 class="title4">{{ $t('lang.home.adv4Title') }}</h1>
                    <div v-html="$t('lang.home.adv4')"></div>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="6" :offset="3">
                <div class="grid-content">
                    <h1 class="title5">{{ $t('lang.home.adv5Title') }}</h1>
                    <div v-html="$t('lang.home.adv5')"></div>
                    <br />
                    <router-link to="/docs">{{ $t('lang.home.adv5Doc') }}</router-link>
                </div>
            </el-col>
            <el-col :span="15">
                <div class="grid-content">
                    <img src="../../assets/link-b.png" />
                </div>
            </el-col>
        </el-row>
    </div>
</template>