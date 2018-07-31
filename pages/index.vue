<template>
  <div>
    <div>
      <md-table>
        <md-table-row>
          <md-table-head>date</md-table-head>
          <md-table-head>category</md-table-head>
          <md-table-head>name</md-table-head>
          <md-table-head>title</md-table-head>
        </md-table-row>

        <md-table-row v-for="(arg, index) in args" v-bind:key="index">
          <md-table-cell>{{arg.date}}</md-table-cell>
          <md-table-cell>{{arg.category}}</md-table-cell>
          <md-table-cell>{{arg.name}}</md-table-cell>
          <md-table-cell>{{arg.title}}</md-table-cell>
        </md-table-row>

      </md-table>
    </div>
  </div>
</template>

<script lang="ts">
  export default {
    async asyncData ({ app }) {
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      let data = await app.$axios.$get(`/api/haruka/fetch/${year}/${month}`)
      return { args: data }
    }
  }
</script>

<style>

</style>