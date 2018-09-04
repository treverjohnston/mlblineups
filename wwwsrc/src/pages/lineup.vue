<template>
    <q-layout class="eighteen black">
        <div class="row justify-center">
            <div class="col-xs-6">
                <!-- <q-collapsible popup label="Players">
                    <hr>
                    <div v-for="player in players">
                        <div>{{player.fullName}}</div>
                    </div>
                </q-collapsible> -->
            </div>
            <div class="col-xs-6">

            </div>
        </div>
        <div class="row wrap justify-center">
            <div class="col-xs-12">
                <q-list v-if="order != null && order != 'NO_GAME'">
                    <!-- <q-collapsible opened popup label="Today's Lineup"> -->
                        <h3 class="text-center">Today's Lineup</h3>
                        <hr>
                        <div class="row justify-center">
                            <p class="offset-2 col-xs-5">Batters</p>
                            <p v-if="fullSeason" class="col-xs-1">W</p>
                            <p v-if="fullSeason" class="col-xs-1">L</p>
                            <p v-if="fullSeason" class="col-xs-1">%</p>
                        </div>
                        <hr>
                        <div v-for="player in order" class="row justify-center">
                            <p class="col-xs-1">{{player.shortOrderPos}}</p>
                            <p class="col-xs-5">{{player.fullName}}</p>
                            <p class="col-xs-1">{{player.shortPos}}</p>
                           
                            <p v-if="orderWithPct[player.id] && player.shortOrderPos && player.shortOrderPos == orderWithPct[player.id][player.shortOrderPos].player.shortOrderPos"
                                class="col-xs-1">{{orderWithPct[player.id][player.shortOrderPos].winCount}}</p>
                            <p v-if="orderWithPct[player.id] && player.shortOrderPos && player.shortOrderPos == orderWithPct[player.id][player.shortOrderPos].player.shortOrderPos"
                                class="col-xs-1">{{orderWithPct[player.id][player.shortOrderPos].count - orderWithPct[player.id][player.shortOrderPos].winCount}}</p>
                            <p v-if="orderWithPct[player.id] && player.shortOrderPos&& player.shortOrderPos == orderWithPct[player.id][player.shortOrderPos].player.shortOrderPos"
                                class="col-xs-1">{{(orderWithPct[player.id][player.shortOrderPos].pct)}}</p>
                        </div>
                    <!-- </q-collapsible> -->
                </q-list>
                <div v-if="order == null">
                    <p>Today's lineup has not been posted yet or this team is not playing today, check back soon for more deets.</p>
                </div>
            </div>
            <div v-if="!fullSeason" class="col-xs-12 text-center">
                <q-btn @click="getLineupPerc">See Lineup Percentages</q-btn>
                <!-- <q-btn @click="getAllLineups">Get All Lineups</q-btn> -->
            </div>
            <!-- <div class="col-xs-12">
                <q-list v-if="hasContent">
                    <div class="row justify-center">
                        
                        <div v-for="lineups in lineupsByCount" class="col-xs-11">
                                <div class="row justify-center">
                                    <p class="col-xs-1">{{lineups.count}}</p>
                                    <p class="col-xs-2">{{lineups.pct}}</p>
                                    <p class="col-xs-1">{{lineups.winCount.toString()}}</p>
                                    <p class="col-xs-1">{{(lineups.count - lineups.winCount).toString()}}</p>
                                    <div class="col-xs-7">
                                    <q-collapsible class="lineup" popup >
                                        <div v-for="player in lineups.lineup">
                                            <div class="row justify-center" v-if="player.shortPos != 'P'">
                                                <p class="col-xs-1">{{player.shortOrderPos}}</p>
                                                <p class="col-xs-9">{{player.fullName}}</p>
                                                <p class="col-xs-1">{{player.shortPos}}</p>
                                            </div>
                                            <div class="row justify-center" v-else>
                                                <p class="col-xs-1">{{player.shortOrderPos}}</p>
                                                <p class="col-xs-9">Pitcher's Spot</p>
                                                <p class="col-xs-1">{{player.shortPos}}</p>
                                            </div>
                                        </div>

                                        <q-collapsible label="Dates used" class="lineup">
                                            <div v-for="date in lineups.dates" class="row justify-center">
                                                <p class="col-xs-3">{{date.substring(0,2)}}</p>
                                                <p class="col-xs-2">{{date.substring(2,4)}}</p>
                                                <p class="col-xs-2">{{date.substring(4,8)}}</p>
                                            </div>
                                        </q-collapsible>
                                    </q-collapsible>
                                </div>
                            </div>
                        </div>
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
            fullSeason(){
                return this.$store.state.fullSeason;
            },
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
            orderWithPct() {
                return this.$store.state.todaysLineupWithPct
            },
            today() {
                return this.$store.state.todayString
            },
            lineupsByCount() {
                return this.$store.state.teamLineupPerc
            },
            players() {
                return this.$store.state.teamPlayers
            }
        },
        mounted() {
            this.$store.commit('setTodayString')
            this.$store.commit('clearTeamLineup')
            this.$store.commit('clearTodayLineup')
            // this.$store.dispatch('getTeams')
            this.$store.dispatch('getGames', this.$route.params.id)
            this.$store.dispatch('getAllLineups', this.$route.params.id)


            // setTimeout(() => {
            //     if (!lineupsByCount[0]) {
            //         this.$store.commit('getLineupPercentage', this.$route.params.id)
            //     }
            //     console.log('timeout done')
            // }, 2000);
            this.$store.commit('getLineupPercentage', this.$route.params.id)
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
                console.log('gone')
            }


        }
    }
</script>

<style scoped>
    .lineup {
        /* border: 1px solid black; */
    }
</style>