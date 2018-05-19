<template>
    <q-layout class="eighteen black">
        <div class="row wrap justify-center">
            <div class="col-xs-12">
                <q-list v-if="order != null && order != 'NO_GAME'">
                    <!-- <q-collapsible opened icon="explore" label="Today's Lineup"> -->
                    <q-collapsible opened label="Today's Lineup">
                       <hr>
                        <div class="row justify-center">
                            <p class="offset-2 col-xs-5">Batters</p>
                            <p v-if="orderWithPct != null" class="col-xs-1">W</p>
                            <p v-if="orderWithPct != null" class="col-xs-1">L</p>
                            <p v-if="orderWithPct != null" class="col-xs-1">%</p>
                        </div>
                        <div v-for="player in order" class="row justify-center">
                            <p class="col-xs-1">{{player.shortOrderPos}}</p>
                            <p class="col-xs-1">{{player.shortPos}}</p>
                            <p class="col-xs-5">{{player.fullName}}</p>
                            <p v-if="orderWithPct[player.id] && player.shortOrderPos && player.shortOrderPos == orderWithPct[player.id][player.shortOrderPos].player.shortOrderPos" class="col-xs-1">{{orderWithPct[player.id][player.shortOrderPos].winCount}}</p>
                            <p v-if="orderWithPct[player.id] && player.shortOrderPos && player.shortOrderPos == orderWithPct[player.id][player.shortOrderPos].player.shortOrderPos" class="col-xs-1">{{orderWithPct[player.id][player.shortOrderPos].count - orderWithPct[player.id][player.shortOrderPos].winCount}}</p>
                            <!-- <p v-if="orderWithPct[player.id] && player.shortOrderPos&& player.shortOrderPos == orderWithPct[player.id][player.shortOrderPos].player.shortOrderPos && (orderWithPct[player.id][player.shortOrderPos].winCount-orderWithPct[player.id][player.shortOrderPos].count) == 0" class="col-xs-1">1.000</p> -->
                            <p v-if="orderWithPct[player.id] && player.shortOrderPos&& player.shortOrderPos == orderWithPct[player.id][player.shortOrderPos].player.shortOrderPos" class="col-xs-1">{{(orderWithPct[player.id][player.shortOrderPos].winCount/orderWithPct[player.id][player.shortOrderPos].count).toString().substring(1,5)}}</p>
                            <!-- <p v-if="orderWithPct[player.id] && player.shortOrderPos && player.shortOrderPos == orderWithPct[player.id][player.shortOrderPos].player.shortOrderPos && orderWithPct[player.id][player.shortOrderPos].count >= 2" class="col-xs-1">{{orderWithPct[player.id][player.shortOrderPos].winCount}}</p>
                            <p v-if="orderWithPct[player.id] && player.shortOrderPos && player.shortOrderPos == orderWithPct[player.id][player.shortOrderPos].player.shortOrderPos && orderWithPct[player.id][player.shortOrderPos].count >= 2" class="col-xs-1">{{orderWithPct[player.id][player.shortOrderPos].count - orderWithPct[player.id][player.shortOrderPos].winCount}}</p>
                            <p v-if="orderWithPct[player.id] && player.shortOrderPos&& player.shortOrderPos == orderWithPct[player.id][player.shortOrderPos].player.shortOrderPos && orderWithPct[player.id][player.shortOrderPos].count >= 2" class="col-xs-1">{{(orderWithPct[player.id][player.shortOrderPos].winCount/orderWithPct[player.id][player.shortOrderPos].count).toString().substring(1,5)}}</p> -->
                        </div>
                    </q-collapsible>
                </q-list>
                <!-- <div v-if="orders[100] == 'NO_GAME'">
                    <p>No Game Today Bruh</p>
                </div> -->
                <div v-if="order == null">
                    <p>Today's lineup has not been posted yet or this team is not playing today, check back soon for more deets.</p>
                </div>
            </div>
            <div class="col-xs-12 text-center">
                <q-btn @click="getLineupPerc">See Lineup Percentages</q-btn>
            </div>
            <div class="col-xs-12">
                <q-list v-if="hasContent">
                    <div class="row justify-center">
                        <div v-for="lineups in lineupsByCount" class="col-xs-11">
                            <q-collapsible class="lineup" :label="lineups.pct + '%' + ' -> ' + lineups.winCount.toString() +' - '+ (lineups.count - lineups.winCount).toString()">
                                <div v-for="player in lineups.lineup">
                                    <div class="row justify-center" v-if="player.shortPos != 'P'">
                                        <p class="col-xs-1">{{player.shortOrderPos}}</p>
                                        <p class="col-xs-1">{{player.shortPos}}</p>
                                        <p class="col-xs-9">{{player.fullName}}</p>
                                    </div>
                                    <div class="row justify-center" v-else>
                                        <p class="col-xs-1">{{player.shortOrderPos}}</p>
                                        <p class="col-xs-1">{{player.shortPos}}</p>
                                        <p class="col-xs-9">Pitcher's Spot</p>
                                    </div>
                                    
                                </div>
                                
                                <q-collapsible label="Dates used" class="lineup">
                                    <div v-for="date in lineups.dates" class="row justify-center">
                                        <p class="col-xs-1">{{date.substring(0,2)}}</p>
                                        <p class="col-xs-1">{{date.substring(2,4)}}</p>
                                        <p class="col-xs-1">{{date.substring(4,8)}}</p>
                                    </div>
                                </q-collapsible>
                            </q-collapsible>
                        </div>
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
            hasContent() {
                return this.$store.state.hasContent
            },
            seasonLineups() {
                if (this.$store.state.hasContent) {
                    return this.$store.state.seasonLineups[this.$route.params.id]
                }
            },
            order() {
                return this.$store.state.todaysOrder
            },
            orderWithPct(){
                return this.$store.state.todaysLineupWins
            },
            today() {
                return this.$store.state.todayString
            },
            lineupsByCount() {
                return this.$store.state.teamLineupPerc
            }
        },
        mounted() {
            this.$store.commit('setTodayString')
            this.$store.commit('clearTeamLineup')
            this.$store.commit('clearTodayLineup')
            this.$store.dispatch('getTeams')
            this.$store.dispatch('getGames', this.$route.params.id)
            this.$store.dispatch('getAllLineups', this.$route.params.id)
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
    .lineup {
        border: 1px solid black;
    }
</style>