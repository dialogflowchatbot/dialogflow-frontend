<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'
import NodesIntro from './docs/NodesIntro.vue'
import HowToUse from './docs/HowToUse.vue'
import { copyProperties, httpReq } from '../assets/tools.js'

// import {
//     Printer,
//     Star,
// } from '@element-plus/icons-vue'

useI18n();
const router = useRouter();
const checkUpdateResult = ref(0)
const currentVersion = ref('')
const newVersion = ref('')
const changelog = reactive([])
const updateLoading = ref(false)
// navigator.language; //"en-US"
// navigator.languages; //["en-US", "zh-CN", "ja-JP"]
function guide() {
    router.push('/guide');
}
// function introduction() {
//     router.push('/introduction');
// }
// function howToUse() {
//     VueScrollTo.scrollTo(document.getElementById('howToUse'))
// }
// function demo() {
//     VueScrollTo.scrollTo(document.getElementById('demosList'))
// }
onMounted(async () => {
    const t = await httpReq('GET', 'version.json', null, null, null);
    currentVersion.value = t
    console.log(currentVersion.value)
})
const checkUpdate = async () => {
    updateLoading.value = true
    const t = await httpReq('GET', 'check-new-version.json', null, null, null);
    // console.log(t)
    if (t.status == 200) {
        if (t.data != null) {
            newVersion.value = t.data.version;
            changelog.splice(0, changelog.length)
            copyProperties(t.data.changelog, changelog)
            // changelog.push(t.data.changelog)
            checkUpdateResult.value = 1
        } else {
            checkUpdateResult.value = 2
        }
    } else {
        checkUpdateResult.value = 3
    }
    updateLoading.value = false
}
</script>
<style scoped>
#header {
    background-image: url(../assets/flow.png), url(../assets/header_bg.jpg);
    background-position: right center, left top;
    background-repeat: no-repeat, repeat;
    height: 450px;
    color: white;
    padding-top: 50px;
    padding-left: 70px;
    font-size: 30px;
}

#header button {
    cursor: pointer;
}

#header .name {
    font-weight: bold;
    font-size: 70px;
}

#header .download {
    background-color: gold;
    border-radius: 10px;
    border: 3px #000 solid;
    font-size: 30px;
    padding: 12px;
    margin-right: 20px;
}

#header .tutorial {
    background-color: aliceblue;
    border-radius: 10px;
    border: 3px #000 solid;
    font-size: 30px;
    padding: 12px;
}

#header .v {
    /* margin-left: 20px;
    margin-right: 10px; */
    font-size: 16px;
    line-height: 23px;
    /* padding-top: 7px; */
    vertical-align: middle;
    margin-left: 16px;
}

.title {
    text-align: center;
    font-size: 200%;
    font-weight: bold;
    margin-top: 30px;
    margin-bottom: 10px;
}

.sub-title {
    font-weight: bold;
    font-size: 18px;
    color: gray;
    margin-top: 20px;
    margin-bottom: 20px;
}
</style>
<template>
    <div id="header">
        <span class="name">Dialog flow chat bot</span>
        <p>
            It's fast. Built on Rust and Vue3.<br />
            It's easy to use. Build powerful chatbots in minutes with our intuitive node-based editor.<br />
            It's safe. Open source and all data is saved locally.
            <!-- Create your own conversational bot in under 1 minute. -->
        </p>
        <!-- <p>
            <button class="download" @click="guide">Get started</button>
            <button class="tutorial" @click="introduction">Introduction</button>
            <span class="v">Current verion is: v1.8.0</span><br/>
            <button class="cu" @click="introduction">Check update</button>
        </p> -->
        <el-row>
            <el-col :span="6">
                <button class="download" @click="guide">Get started</button>
                <a href="https://github.com/dialogflowchatbot/dialogflow/releases" style="margin-left: 20px;">
                    <img src="../assets/downloading.png" />
                </a>
                <!-- <el-button :icon="Printer" type="primary" plain @click="introduction" size="large">Introduction</el-button> -->
                <!-- <router-link to="/introduction"><img src="../assets/lightbulb.png" /></router-link> -->
                <!-- <el-button :icon="Star" type="primary" plain @click="github" size="large">Github</el-button> -->
                <a href="https://github.com/dialogflowchatbot/dialogflow" style="margin-left: 20px;">
                    <img src="../assets/github.png" />
                </a>
            </el-col>
            <el-col :span="13" class="v">
                <div>Current verion is: {{ currentVersion }}</div>
                <el-button @click="checkUpdate" :loading="updateLoading">Check update</el-button>
                <el-popover ref="popover" placement="right" title="Changelog" :width="300" trigger="hover">
                    <template #reference>
                        <el-button v-show="checkUpdateResult == 1" class="m-2" type="warning" text>Found new verion: {{
                            newVersion
                        }}</el-button>
                    </template>
                    <template #default>
                        <ol style="margin:0;padding:0">
                            <li v-for="(item, index) in changelog" :id="index" :key="index">
                                {{ item }}
                            </li>
                        </ol>
                        <a href="https://github.com/dialogflowchatbot/dialogflow/releases">Go to download</a>
                    </template>
                </el-popover>
                <el-button v-show="checkUpdateResult == 2" type="success" text>You're using the latest verion</el-button>
                <el-button v-show="checkUpdateResult == 3" type="danger" text>Failed to query update information, please try
                    again
                    later.</el-button>
            </el-col>
        </el-row>
    </div>
    <NodesIntro />
    <HowToUse />
    <p>
        <hr />
    </p>
    <p>
    <div class="text-center">
        Version: {{ currentVersion }}<br />
        If you have any questions or suggestions, please email to:
        dialogflow@yeah.net
        or create a <a href="https://github.com/dialogflowchatbot/dialogflow/discussions">Discussions</a>
    </div>
    <div class="text-center">
        Built on Vue3 and Element UI
    </div>
    <div class="text-center">
        Images were from
        <a href="https://unsplash.com">Unsplash</a> & <a href="https://picsum.photos">Picsum</a>
        , Icons created by
        <a href="https://www.flaticon.com/free-icons/seo-and-web" title="seo and web icons">Seo and web icons created by
            Freepik - Flaticon</a>
    </div>
    </p>
</template>