<template>
        <q-layout class="eighteen black">
            <div class="row wrap justify-center">
                <div class="col-xs-12">
                            <div v-for="team in teams" class="row justify-left">
                                <q-btn class="col-xs-12" @click="getGames(team.id)">{{team.name}}</q-btn>
                            </div>
                </div>
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
                teams() {
                    return this.$store.state.teams
                }
            },
            mounted() {
                this.$store.dispatch('getTeams')
            },
            methods: {
                openURL(url) {
                    openURL(url)
                },
                getGames(id){
                    // this.$store.dispatch('getGames', id)
                    this.$router.push(`/teams/${id}`)
                }
    
            }
        }
    </script>
    
    <style scoped>
    </style>