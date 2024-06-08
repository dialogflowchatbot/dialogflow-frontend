<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router';
import { copyProperties, httpReq } from '../../assets/tools.js'
import Demos from "../Demos.vue"
import EpArrowRightBold from '~icons/ep/arrow-right-bold'
import BiChatSquareDots from '~icons/bi/chat-square-dots'
import RiBardLine from '~icons/ri/bard-line'
import SolarDownloadOutline from '~icons/solar/download-outline'
import SolarRouting2Linear from '~icons/solar/routing-2-linear'
import EpSetting from '~icons/ep/setting'
import SolarDocumentTextLinear from '~icons/solar/document-text-linear'
import BiBoxArrowUpRight from '~icons/bi/box-arrow-up-right'
useI18n();
const route = useRoute();
const router = useRouter();
const checkUpdateResult = ref(0)
const fromPage = 'guide';
const robotId = route.params.robotId;
const robotName = ref('');
const goBack = () => {
  router.push('/')
}
const toSettings = () => {
  router.push('/settings')
}
onMounted(async () => {
  const t = await httpReq('GET', 'robot/detail', { robotId: robotId }, null, null);
  if (t.status == 200 && t.data != null) {
    robotName.value = t.data.robotName;
    window.localStorage.setItem(t.data.robotId + 'type', t.data.robotType);
  } else {
    ElMessage.error('Can NOT find robot information by robotId.');
  }
})
</script>
<style scoped>
.header-row {
  margin-top: 20px;
}

.header {
  margin-left: 20px;
  font-size: 38px;
  font-weight: bold;
}

.title {
  font-size: 28px;
  font-weight: bold;
  margin-top: 35px;
}

.description {
  font-size: 16px;
  color: #b8b8b8;
  padding-bottom: 20px;
  border-bottom: #b8b8b8 1px solid;
}

.tips {
  text-align: right;
  margin-right: 30px;
}
</style>
<template>
  <el-page-header title="Robots list" @back="goBack">
    <template #content>
      <span class="text-large font-600 mr-3"> Robot detail </span>
    </template>
  </el-page-header>
  <el-row class="header-row">
    <el-col :span="8">
      <span class="header"> {{ robotName }} </span>
    </el-col>
  </el-row>
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
  <el-alert v-show="checkUpdateResult == 2" title="You're using the latest verion." type="success"
    @close="checkUpdateResult = 0" />
  <el-alert v-show="checkUpdateResult == 3" title="Failed to query update information, please try again later."
    type="danger" @close="checkUpdateResult = 0" />
  <!-- <el-button v-show="checkUpdateResult == 2" type="success" text>You're using the latest verion</el-button>
  <el-button v-show="checkUpdateResult == 3" type="danger" text>Failed to query update information, please try
    again
    later.</el-button> -->
  <p style="margin-left:50px">
  <div class="title">
    <el-icon :size="30">
      <BiChatSquareDots />
    </el-icon>{{ $t('lang.guide.title1') }}
  </div>
  <p>
    <el-icon :size="15">
      <EpArrowRightBold />
    </el-icon>
    <router-link :to="{ name: 'mainflows', params: { robotId: robotId } }">{{ $t('lang.guide.nav1') }}</router-link>
  <div class="description">
    <Demos :parentPage="fromPage" />
    <!-- <router-link :to="{ name: 'subflow', params: { id: 'demo-repay', name: btoa('Repay Demo') } }">
            {{ $t('lang.home.demo1') }}
          </router-link>
          |
          <router-link
            :to="{ name: 'subflow', params: { id: 'demo-collect', name: btoa('Information Collection Demo') } }">
            {{ $t('lang.home.demo2') }}
          </router-link>
          |
          <router-link
            :to="{ name: 'subflow', params: { id: 'demo-notify', name: btoa('One Sentence Notification Demo') } }">
            {{ $t('lang.home.demo3') }}
          </router-link> -->
  </div>
  </p>

  <div class="title">
    <el-icon :size="30">
      <RiBardLine />
    </el-icon>
    {{ $t('lang.guide.title2') }}
  </div>
  <p>
    <el-icon :size="15">
      <EpArrowRightBold />
    </el-icon>
    <router-link :to="{ name: 'intents', params: { robotId: robotId } }">{{ $t('lang.guide.nav2') }}</router-link>
  <div class="description">
    {{ $t('lang.guide.desc2') }}<br />
    We have built-in "Positive" and "Negative" intentions. If that's not enough, you can add your own
  </div>
  </p>

  <div class="title">
    <el-icon :size="30">
      <SolarDownloadOutline />
    </el-icon>
    {{ $t('lang.guide.title3') }}
  </div>
  <p>
    <el-icon :size="15">
      <EpArrowRightBold />
    </el-icon>
    <router-link :to="{ name: 'variables', params: { robotId: robotId } }">{{ $t('lang.guide.nav3') }}</router-link>
  <div class="description">{{ $t('lang.guide.desc3') }}</div>
  </p>

  <div class="title">
    <el-icon :size="30">
      <SolarRouting2Linear />
    </el-icon>
    External APIs call
  </div>
  <p>
    <el-icon :size="15">
      <EpArrowRightBold />
    </el-icon>
    <router-link :to="{ name: 'externalHttpApis', params: { robotId: robotId } }">External HTTP API list</router-link>
  <div class="description">By using this function, you can send data to external URLs and receive response.</div>
  </p>

  <div class="title">
    <el-icon :size="30">
      <EpSetting />
    </el-icon>
    {{ $t('lang.guide.title4') }}
  </div>
  <p>
    <el-icon :size="15">
      <EpArrowRightBold />
    </el-icon>
    <router-link :to="{ name: 'settings', params: { robotId: robotId } }">{{ $t('lang.guide.nav4') }}</router-link>
  <div class="description">{{ $t('lang.guide.desc4') }}</div>
  </p>

  <div class="title">
    <el-icon :size="30">
      <SolarDocumentTextLinear />
    </el-icon>
    {{ $t('lang.guide.title5') }}
  </div>
  <p>
    <el-icon :size="15">
      <EpArrowRightBold />
    </el-icon>
    <!-- <router-link to="/docs">{{ $t('lang.guide.nav5') }}</router-link> -->
    <a href="https://dialogflowchatbot.github.io/docs" target="_blank">
      {{ $t('lang.guide.nav5') }}
      <el-icon>
        <BiBoxArrowUpRight />
      </el-icon>
    </a>
  <div class="description">{{ $t('lang.guide.desc5') }}</div>
  </p>
  </p>
</template>