<template>
  <q-page class="row justify-center flex flex-center">
    <div v-for="order in orders" class="col-xs-12">
      <p>{{order.shortPos}}</p>
      <p>
        {{order.fullName}}
      </p>
    </div>

  </q-page>
</template>

<style>
</style>

<script>
export default {
  name: 'PageIndex',
  computed: {
            orders() {
                return this.$store.state.tempOrder
            }
        },
  mounted(){
    // this.$store.dispatch('getGames')
  }
}

</script>
