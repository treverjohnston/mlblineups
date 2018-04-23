import Vue from 'vue'
import Vuex from 'vuex'

import axios from 'axios'
import router from '../router'


var production = !window.location.host.includes('localhost');
// var production = true;
var baseUrl = production ? '//inspireq.herokuapp.com/' : '//localhost:3000/';

let api = axios.create({
  baseURL: baseUrl + 'api/',
  timeout: 4000,
  withCredentials: true
})

Vue.use(Vuex)

var store = new Vuex.Store({
  state: {
    todaysOrder: [],
    tempOrder: {},
    teams: {},
    seasonLineups: {},
    todayString: '',
    hasContent: false,
    teamLineupPerc: []
  },
  mutations: {

    handleError(state, err) {
      console.error(err)
    },
    setTodayString(state) {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1; //January is 0!

      var yyyy = today.getFullYear();
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      state.todayString = mm + dd + yyyy
    },
    addToOrder(state, obj) {
      Vue.set(state.tempOrder, obj.orderPos, obj)

      if (state.tempOrder[100] && state.tempOrder[200] && state.tempOrder[300] && state.tempOrder[400] && state.tempOrder[500] && state.tempOrder[600] && state.tempOrder[700] && state.tempOrder[800] && state.tempOrder[900]) {
        if (!obj.teamId || !obj.fullDate) {
          return
        }
        if (!state.seasonLineups[obj.teamId]) {
          state.seasonLineups[obj.teamId] = {}
        }
        Vue.set(state.seasonLineups[obj.teamId], obj.fullDate, { month: obj.fullDate.substring(0, 2), day: obj.fullDate.substring(2, 4), year: obj.fullDate.substring(4, 8), lineup: state.tempOrder, isWinner: obj.isWinner })
        // console.log('arhol', state.seasonLineups)

        state.tempOrder = { 100: null }
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!

        var yyyy = today.getFullYear();
        if (dd < 10) {
          dd = '0' + dd;
        }
        if (mm < 10) {
          mm = '0' + mm;
        }
        var megaDate = mm + dd + yyyy

        state.todaysOrder = state.seasonLineups[obj.teamId][megaDate].lineup
        // console.log('TODAY', state.todaysOrder)
        // console.log('SeASON LINEUPS', state.seasonLineups)
        state.hasContent = true

      }


    },
    setTeams(state, team) {
      Vue.set(state.teams, team.id, team)
    },
    clearLineup(state) {
      state.todaysOrder = []
    },
    getLineupPercentage(state, teamId) {
      var teamSeasonLineup = state.seasonLineups[teamId]
      for (const day in teamSeasonLineup) {
        if (teamSeasonLineup.hasOwnProperty(day)) {
          const lineup = teamSeasonLineup[day];
          var obj = { lineup: lineup.lineup, teamId: lineup.lineup[100].teamId, isWinner: lineup.isWinner }
          this.commit('compareLineups', obj)
        }
      }
      console.log(state.teamLineupPerc)
    },
    compareLineups(state, obj) {
      // var teamSeasonLineup = state.seasonLineups[obj.teamId]
      var containsLineup = false;
      for (let i = 0; i < state.teamLineupPerc.length; i++) {
        const percLineup = state.teamLineupPerc[i].lineup;
        if (percLineup == null) {
          continue;
        }
        var sameCount = 0
        var samePos = {}
        for (const player in obj.lineup) {
          if (obj.lineup.hasOwnProperty(player)) {
            const earth = obj.lineup[player];
            for (const percPlayer in percLineup) {
              if (percLineup.hasOwnProperty(percPlayer)) {
                const wind = percLineup[percPlayer];
                if (earth.id == wind.id && earth.orderPos == wind.orderPos) {
                  sameCount++
                  break;
                }
              }
            }
          }
        }
        if (sameCount >= 8) {
          state.teamLineupPerc[i].count++
          if (obj.isWinner) {
            state.teamLineupPerc[i].winCount++
          }
          state.teamLineupPerc[i].dates.push(obj.lineup[100].fullDate)
          state.teamLineupPerc[i].pct = Math.floor((state.teamLineupPerc[i].winCount/state.teamLineupPerc[i].count) * 100)
          containsLineup = true;
          break;
        }
      }
      if (!containsLineup) {
        var winCount = 0
        if (obj.isWinner) {
          winCount++
        }
        var tempObj = {
          lineup: obj.lineup,
          count: 1,
          winCount: winCount,
          dates: [obj.lineup[100].fullDate],
          pct: Math.floor((winCount/1) * 100)
        }
        state.teamLineupPerc.push(tempObj)
      }

    }
  },
  actions: {
    /////////
    //START GET TODAYS LINEUP
    ////////
    getTeams({ commit, dispatch }) {
      axios.get('http://statsapi.mlb.com:80/api/v1/teams?sportId=1')
        .then((res) => {
          var teams = res.data.teams;
          for (const team in teams) {
            if (teams.hasOwnProperty(team)) {
              const element = teams[team];

              commit('setTeams', element)
            }
          }
        })
    },
    getGames({ commit, dispatch }, chosenId) {
      // console.log('CHOSEN', chosenId)
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1; //January is 0!

      var yyyy = today.getFullYear();
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      axios.get(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${mm}%2F${dd}%2F${yyyy}`)
        .then((res) => {
          var games = res;
          for (const game in games.data.dates[0].games) {
            if (games.data.dates[0].games.hasOwnProperty(game)) {
              const element = games.data.dates[0].games[game];
              if (element.teams.away.team.id == chosenId) {
                // console.log('CHOSENAWAY', chosenId)
                var tempObj = {
                  gamePk: element.gamePk,
                  home: false,
                  teamId: chosenId,
                  fullDate: mm + dd + yyyy,
                  isWinner: element.teams.away.isWinner
                }
                dispatch('getBattingOrder', tempObj)
              }
              else if (element.teams.home.team.id == chosenId) {
                var tempObj = {
                  gamePk: element.gamePk,
                  home: true,
                  teamId: chosenId,
                  fullDate: mm + dd + yyyy,
                  isWinner: element.teams.home.isWinner
                }
                dispatch('getBattingOrder', tempObj)
              }
            }
          }
        })

    },
    getBattingOrder({ commit, dispatch }, obj) {
      axios.get(`http://statsapi.mlb.com:80/api/v1/game/${obj.gamePk}/boxscore`)
        .then((res) => {
          var boxscore = res;
          var order = {}
          if (!obj.home) {

            for (const i in boxscore.data.teams.away.players) {
              if (boxscore.data.teams.away.players.hasOwnProperty(i)) {
                const player = boxscore.data.teams.away.players[i];
                if (player.battingOrder) {

                  dispatch('getCurrentPos', { order: boxscore.data.teams.away.battingOrder, player: player, teamId: obj.teamId, fullDate: obj.fullDate, isWinner: obj.isWinner })
                }
              }
            }

          }
          else {
            for (const i in boxscore.data.teams.home.players) {
              if (boxscore.data.teams.home.players.hasOwnProperty(i)) {
                const player = boxscore.data.teams.home.players[i];
                if (player.battingOrder) {
                  dispatch('getCurrentPos', { order: boxscore.data.teams.home.battingOrder, player: player, teamId: obj.teamId, fullDate: obj.fullDate, isWinner: obj.isWinner })
                }
              }
            }

          }
        })
    },
    getCurrentPos({ commit, dispatch }, obj) {
      var tempObj = {}
      for (const j in obj.order) {
        if (obj.order.hasOwnProperty(j)) {
          const batter = obj.order[j];
          let sub = obj.player.battingOrder.substring(2, 3)
          if ((batter == obj.player.person.id || obj.player.battingOrder) && sub == '0') {
            let pos = obj.player.battingOrder
            tempObj = {
              orderPos: pos,
              shortOrderPos: pos.substring(0, 1),
              shortPos: obj.player.position.abbreviation,
              fullName: obj.player.person.fullName,
              id: obj.player.person.id,
              teamId: obj.teamId,
              fullDate: obj.fullDate,
              isWinner: obj.isWinner
            };
            break;
          }
        }
      }
      // console.log('getcurrentchosen', tempObj.teamId)
      commit('addToOrder', tempObj)
    },
    /////////
    //END GET TODAYS LINEUP
    ////////
    getAllLineups({ commit, dispatch }, chosenId) {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1; //January is 0!

      var yyyy = today.getFullYear();
      if (dd < 10) {
        dd = '0' + dd;
      }
      if (mm < 10) {
        mm = '0' + mm;
      }
      var megaDate = mm + dd
      var month = mm
      var day = dd
      for (let i = 329; i <= megaDate; i++) {
        if (i.toString().substring(1, 3) > 31 || i.toString().substring(1, 3) == '00') {
          continue;
        }
        if (i.toString()[0] != 0) {
          i = ('0' + i.toString())
        }
        month = i.toString().substring(0, 2)
        day = i.toString().substring(2, 4)

        axios.get(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${month}%2F${day}%2F${yyyy}`)
          .then((res) => {
            month = i.toString().substring(0, 2)
            day = i.toString().substring(2, 4)
            var games = res;
            for (const game in games.data.dates[0].games) {
              if (games.data.dates[0].games.hasOwnProperty(game)) {
                const element = games.data.dates[0].games[game];
                if (element.teams.away.team.id == chosenId) {
                  var tempObj = {
                    gamePk: element.gamePk,
                    home: false,
                    teamId: chosenId,
                    fullDate: month + day + yyyy,
                    isWinner: element.teams.away.isWinner
                  }
                  // console.log('la;ksdjf', tempObj.fullDate)

                  dispatch('getBattingOrder', tempObj)
                }
                else if (element.teams.home.team.id == chosenId) {
                  var tempObj = {
                    gamePk: element.gamePk,
                    home: true,
                    teamId: chosenId,
                    fullDate: month + day + yyyy,
                    isWinner: element.teams.home.isWinner
                  }
                  dispatch('getBattingOrder', tempObj)
                }
              }

            }
          })
      }
    },


  }
})

export default store
