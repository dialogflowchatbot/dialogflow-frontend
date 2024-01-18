<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router';
import Demos from "./Demos.vue"
import EpArrowRightBold from '~icons/ep/arrow-right-bold'
import BiChatSquareDots from '~icons/bi/chat-square-dots'
import RiBardLine from '~icons/ri/bard-line'
import SolarDownloadOutline from '~icons/solar/download-outline'
import SolarRouting2Linear from '~icons/solar/routing-2-linear'
import EpSetting from '~icons/ep/setting'
import SolarDocumentTextLinear from '~icons/solar/document-text-linear'
useI18n();
const router = useRouter();
const fromPage = 'guide';
const goBack = () => {
  router.push('/')
}
</script>
<style scoped>
.title {
  font-size: 28px;
  font-weight: bold;
  margin-top: 35px;
}

.description {
  font-size: 16px;
  color: #b8b8b8;
}
</style>
<template>
  <el-page-header title="Home" @back="goBack">
    <template #content>
      <span class="text-large font-600 mr-3"> Workspace </span>
    </template>
  </el-page-header>
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
    <router-link to="/mainflows">{{ $t('lang.guide.nav1') }}</router-link>
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
    <router-link to="/intents">{{ $t('lang.guide.nav2') }}</router-link>
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
    <router-link to="/variables">{{ $t('lang.guide.nav3') }}</router-link>
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
    <router-link to="/external/httpApis">External HTTP API list</router-link>
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
    <router-link to="/settings">{{ $t('lang.guide.nav4') }}</router-link>
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
    <router-link to="/docs">{{ $t('lang.guide.nav5') }}</router-link>
  <div class="description">{{ $t('lang.guide.desc5') }}</div>
  </p>
  </p>
</template>