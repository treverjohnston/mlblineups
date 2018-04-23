<template>
    <q-layout class="eighteen black">
        <div class="row wrap justify-center">
            <div class="col-xs-12">
                <q-list v-if="orders != null && orders != 'NO_GAME'">
                    <q-collapsible opened icon="explore" label="Today's Lineup">
                        <div v-for="order in orders" class="row justify-center">
                            <p class="col-xs-2">{{order.shortOrderPos}}</p>
                            <p class="col-xs-9">{{order.fullName}}</p>
                            <p class="col-xs-1">{{order.shortPos}}</p>
                        </div>
                    </q-collapsible>
                </q-list>
                <!-- <div v-if="orders[100] == 'NO_GAME'">
                    <p>No Game Today Bruh</p>
                </div> -->
                <div v-if="orders == null">
                    <p>Today's lineup has not been posted yet or this team is not playing today, check back soon for more deets.</p>
                </div>
            </div>
            <div class="col-xs-6">
                <q-btn @click="getAllLineups">Get All Lineups</q-btn>
            </div>
            <div class="col-xs-6">
                <q-btn @click="getLineupPerc">Get Lineup Stuff</q-btn>
            </div>
            <div class="col-xs-12">
                <q-list v-if="hasContent">
                    <div v-for="lineups in lineupsByCount" >
                        <q-collapsible icon="explore" :label="lineups.pct + '%' + ' - ' + lineups.winCount.toString() +' for '+ lineups.count.toString()">
                                <div v-if="player.shortPos != 'P'" v-for="player in lineups.lineup" class="row justify-center">
                                    <p class="col-xs-2">{{player.shortOrderPos}}</p>
                                    <p class="col-xs-9">{{player.fullName}}</p>
                                    <p class="col-xs-1">{{player.shortPos}}</p>
                                </div>
                            </q-collapsible>
                        </div>
                </q-list>
            </div>
            <!-- <div class="col-xs-12">
                <q-list v-if="hasContent">
                    <div v-for="day in seasonLineups" >
                        <q-collapsible icon="explore" :label="day.month +' '+ day.day">
                                <div v-for="player in day.lineup" class="row justify-center">
                                    <p class="col-xs-2">{{player.shortOrderPos}}</p>
                                    <p class="col-xs-9">{{player.fullName}}</p>
                                    <p class="col-xs-1">{{player.shortPos}}</p>
                                </div>
                            </q-collapsible>
                        </div>
                </q-list>
            </div> -->
        </div>
    </q-layout>
</template>

<script>
    export default {
        name: 'lineup',
        data() {
            return {
            }
        },
        computed: {
            hasContent(){
                return this.$store.state.hasContent
            },
            seasonLineups() {
                if (this.$store.state.hasContent) {
                    return this.$store.state.seasonLineups[this.$route.params.id]
                }
            },
            orders() {
                return this.$store.state.todaysOrder
            },
            today() {
                return this.$store.state.todayString
            },
            lineupsByCount(){
                return this.$store.state.teamLineupPerc
            }
        },
        mounted() {
            this.$store.commit('setTodayString')
            this.$store.commit('clearLineup')
            this.$store.dispatch('getTeams')
            this.$store.dispatch('getGames', this.$route.params.id)
        },
        methods: {
            openURL(url) {
                openURL(url)
            },
            getAllLineups() {
                this.$store.dispatch('getAllLineups', this.$route.params.id)
            },
            getLineupPerc() {
                this.$store.commit('getLineupPercentage', this.$route.params.id)
            }


        }
    }
</script>

<style scoped>
</style>