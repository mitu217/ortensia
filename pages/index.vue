<template>
  <section id="nuxt-express-typescript">
    <div class="nuxt-inner">
      <h1 class="title">Nuxt.js with Express, Typescript</h1>
      <ul>
        <li v-for="arg in args" v-bind:key="arg">
          <a v-bind:href="arg.path">{{arg.title}}</a>
        </li>
      </ul>
    </div>
  </section>
</template>
<script lang="ts">
  import axios from '~/plugins/axios'
  export default {
    async asyncData () {
      let { data } = await axios.get('/api/nav')
      return { args: data }
    }
  }
</script>
<style>
section#nuxt-express-typescript {
  display: table;
  text-align: center;
  margin: 0 auto;
}
section#nuxt-express-typescript div.nuxt-inner {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}
section#nuxt-express-typescript h1.title {
  color: black;
  text-align: center;
  font-weight: 400;
  font-size: 28pt;
  margin-bottom: 25px;
}
section#nuxt-express-typescript {
  height: 100%;
  width: 820px;
}
section#nuxt-express-typescript ul {
  overflow: hidden;
  text-align: center;
}
section#nuxt-express-typescript ul li {
  padding: 0 15px;
  display: inline;
}
section#nuxt-express-typescript ul li a {
  color: #525252;
  transition-duration: 0.3s;
  font-size: 20pt;
}
section#nuxt-express-typescript ul li a:hover {
  color: black;
}
</style>