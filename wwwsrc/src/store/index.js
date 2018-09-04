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
    todayBattingOrderHolder: {},
    teams: {},
    seasonLineups: {},
    todayString: '',
    hasContent: false,
    teamLineupPerc: [],
    todaysLineupWins: {},
    teamPlayers: {},
    fullSeason: false,
    battingOrderHolderFull: false,
  },
  mutations: {

    handleError(state, err) {
      console.error(err)
    },

    addToTeamPlayers(state) {
      for (const playerObject in state.todayBattingOrderHolder) {
        if (state.todayBattingOrderHolder.hasOwnProperty(playerObject)) {
          const player = state.todayBattingOrderHolder[playerObject];
          if (player && !state.teamPlayers[player.id]) {
            Vue.set(state.teamPlayers, player.id, player);
          }
        }
      }
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
    fullBattingOrderHolderCheck(state, obj) {
      //Checking that the lineup is completed
      if (state.todayBattingOrderHolder[100] && state.todayBattingOrderHolder[200] && state.todayBattingOrderHolder[300] && state.todayBattingOrderHolder[400] && state.todayBattingOrderHolder[500] && state.todayBattingOrderHolder[600] && state.todayBattingOrderHolder[700] && state.todayBattingOrderHolder[800] && state.todayBattingOrderHolder[900]) {
        state.battingOrderHolderFull = true;
      }
    },
    addPlayerToTodaysBattingOrder(state, playerObj) {
      if (!playerObj.teamId) {
        return;
      }
      var teamId = playerObj.teamId;
      var fullDate = playerObj.fullDate;

      //Adding the individual player to the hlder
      Vue.set(state.todayBattingOrderHolder, playerObj.orderPos, playerObj)

      this.commit('fullBattingOrderHolderCheck');

      if (!state.battingOrderHolderFull || !teamId || !fullDate) {
        return;
      }

      if (!state.seasonLineups[teamId]) {
        state.seasonLineups[teamId] = {}
      }

      //Adding the days lineup to the full season team lineup object
      Vue.set(state.seasonLineups[teamId], fullDate, { month: fullDate.substring(0, 2), day: fullDate.substring(2, 4), year: fullDate.substring(4, 8), lineup: state.todayBattingOrderHolder, isWinner: playerObj.isWinner })

      var mm = playerObj.fullDate.substring(0, 2);
      var dd = playerObj.fullDate.substring(2, 4);
      var yyyy = playerObj.fullDate.substring(4, 8);

      var monthDayString = mm + dd + yyyy
      if (state.seasonLineups[teamId][monthDayString]) {
        state.todaysOrder = state.seasonLineups[teamId][monthDayString].lineup;
      }
      else {
        //I think this was supposed to be here so that the front end knows that todays lineup isn't posted yet.. but I'm pretty sure it won't ever get here if thats the case
        debugger
        state.todaysOrder = null;
      }

      this.commit('addToTeamPlayers')

      state.hasContent = true;

      //reset holder
      state.todayBattingOrderHolder = {}
      state.battingOrderHolderFull = false;

    },
    setTeams(state, team) {
      Vue.set(state.teams, team.id, team)
    },
    clearTodayLineup(state) {
      state.todaysOrder = []
    },
    clearTeamLineup(state) {
      state.teamLineupPerc = []
    },

    setPlayerWinPercentages(state, teamId) {
      this.commit('clearTeamLineup')
      var teamSeasonLineup = state.seasonLineups[teamId]

      for (const day in teamSeasonLineup) {
        if (teamSeasonLineup.hasOwnProperty(day)) {
          const singleDayLineup = teamSeasonLineup[day];
          var lineup = { lineup: singleDayLineup.lineup, teamId: singleDayLineup.lineup[100].teamId, isWinner: singleDayLineup.isWinner }

        }
      }
    },

    getLineupPercentage(state, teamId) {
      this.commit('clearTeamLineup')
      var singleTeamSeason = state.seasonLineups[teamId]
      for (const day in singleTeamSeason) {
        if (singleTeamSeason.hasOwnProperty(day)) {
          const game = singleTeamSeason[day];
          var gameObj = { lineup: game.lineup, teamId: game.lineup[100].teamId, isWinner: game.isWinner }

          //TODO: GET THIS BETTER DONE
          //FOR NOW, FOCUSING ON GETTING WIN COUNT/PERCENTAGES TO BE ACCURATE
          this.commit('compareLineups', gameObj)

          this.commit('addToTodaysLineupWin', gameObj.lineup)
        }
      }
      state.teamLineupPerc.sort(function (a, b) {
        return b.count - a.count;
        // return b.pct - a.pct;
      });
      // console.log(state.teamLineupPerc)
      state.hasContent = true
    },
    compareLineups(state, obj) {
      /////////////////////////////////////
      ////////IFISTODAY DONT COUNT ISWINNER
      /////////////////////////////////////
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
                var check1 = earth.orderPos == wind.orderPos
                var check2 = earth.id == wind.id
                var check3 = earth.shortPos == 'P' && wind.shortPos == 'P'
                if (check1 && (check2 || check3)) {
                  sameCount++
                  break;
                }
              }
            }
          }
        }
        if (sameCount >= 9) {
          /////////////////////
          //////////DO THE TODAYCHECK HERE
          ////////////////////////////
          state.teamLineupPerc[i].count++
          if (obj.isWinner) {
            state.teamLineupPerc[i].winCount++
          }
          var pct = (state.teamLineupPerc[i].winCount / state.teamLineupPerc[i].count).toFixed(3)
          if (pct.includes('.')) {
            pct = pct.substring(pct.indexOf('.'))

          }
          else {
            pct = '.' + pct + '00'
          }
          state.teamLineupPerc[i].dates.push(obj.lineup[100].fullDate)
          state.teamLineupPerc[i].pct = pct
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
          pct: (winCount / 1)
        }
        state.teamLineupPerc.push(tempObj)
      }

    },
    addToTodaysLineupWin(state, lineup) {
      for (const element in lineup) {
        if (lineup.hasOwnProperty(element)) {
          const player = lineup[element];
          state.fullSeason = true;
          ///////ISSUES HERE
          if (state.todaysLineupWins[player.id] && state.todaysLineupWins[player.id][player.shortOrderPos]) {
            var place = state.todaysLineupWins[player.id][player.shortOrderPos]
            var pct = 0;
            if (player.isWinner) {
              Vue.set(state.todaysLineupWins[player.id], [player.shortOrderPos].winCount, place.winCount++)
            }
            if (state.todaysLineupWins[player.id][player.shortOrderPos] == 1) {
              continue;
            }
            if (place.winCount - place.count != 0) {
              pct = place.winCount / place.count
            }
            Vue.set(state.todaysLineupWins[player.id], [player.shortOrderPos].pct, pct)
            Vue.set(state.todaysLineupWins[player.id], [player.shortOrderPos].count, place.count++)
          } else if (state.todaysLineupWins[player.id]) {
            state.todaysLineupWins[player.id][player.shortOrderPos] = {}
            if (player.isWinner) {
              Vue.set(state.todaysLineupWins[player.id], player.shortOrderPos, { player: player, winCount: 1, count: 1, pct: "1.000" })
            } else {
              Vue.set(state.todaysLineupWins[player.id], player.shortOrderPos, { player: player, winCount: 0, count: 1, pct: ".000" })
            }
          } else {
            state.todaysLineupWins[player.id] = {}
            if (player.isWinner) {
              Vue.set(state.todaysLineupWins[player.id], player.shortOrderPos, { player: player, winCount: 1, count: 1, pct: '1.000' })
            } else {
              Vue.set(state.todaysLineupWins[player.id], player.shortOrderPos, { player: player, winCount: 0, count: 1, pct: '.000' })
            }
          }

        }
      }
    },

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
      var fullDate = mm + dd + yyyy;
      axios.get(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${mm}%2F${dd}%2F${yyyy}`)
        .then((res) => {
          var games = res.data.dates[0].games;
          for (const place in games) {
            var game = games[place];
            const homeTeamId = game.teams.home.team.id;
            const awayTeamId = game.teams.away.team.id;
            var homeIsWinner = game.teams.home.isWinner;
            var awayIsWinner = game.teams.away.isWinner;
            //Two different ones for home and away

            if (homeTeamId == chosenId) {
              var tempObj = {
                gamePk: game.gamePk,
                home: true,
                teamId: chosenId,
                fullDate: fullDate,
                isWinner: homeIsWinner
              }

              dispatch('getBattingOrderForGame', tempObj)
            }
            //Two different ones for home and away
            else if (awayTeamId == chosenId) {
              var tempObj = {
                gamePk: game.gamePk,
                home: false,
                teamId: chosenId,
                fullDate: fullDate,
                isWinner: awayIsWinner
              }
              dispatch('getBattingOrderForGame', tempObj)
            }
          }
        })
        .catch(error => {
          console.log(error)
        });
    },

    getBattingOrderForGame({ commit, dispatch }, obj) {
      axios.get(`http://statsapi.mlb.com:80/api/v1/game/${obj.gamePk}/boxscore`)
        .then((res) => {
          if (res.status == 200) {
            var boxscore = res;
            var homePlayers = boxscore.data.teams.home.players;
            var awayPlayers = boxscore.data.teams.away.players;
            var homeBattingOrder = boxscore.data.teams.home.battingOrder;
            var awayBattingOrder = boxscore.data.teams.away.battingOrder;
            if (obj.home) {
              for (const place in homePlayers) {
                if (homePlayers.hasOwnProperty(place)) {
                  const player = homePlayers[place];
                  if (player.battingOrder) {
                    dispatch('getCurrentPos', { order: homeBattingOrder, player: player, teamId: obj.teamId, fullDate: obj.fullDate, isWinner: obj.isWinner })
                  }
                }

              }
            }
            else {
              for (const place in awayPlayers) {
                if (awayPlayers.hasOwnProperty(place)) {
                  const player = awayPlayers[place];
                  if (player.battingOrder) {
                    dispatch('getCurrentPos', { order: awayBattingOrder, player: player, teamId: obj.teamId, fullDate: obj.fullDate, isWinner: obj.isWinner })
                  }
                }
              }
            }
          }
        })
    },
    getCurrentPos({ commit, dispatch }, obj) {
      var playerObj = {}
      for (const player in obj.order) {
        if (obj.order.hasOwnProperty(player)) {
          const batter = obj.order[player];
          let sub = obj.player.battingOrder.substring(2, 3)

          if ((batter == obj.player.person.id || obj.player.battingOrder) && sub == '0') {
            let pos = obj.player.battingOrder
            playerObj = {
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
      if (playerObj != {}) {
        commit('addPlayerToTodaysBattingOrder', playerObj)
      }
    },
    /////////
    //END GET TODAYS LINEUP
    ////////

    // ////////////////////////////////////////////
    // //THIS IS WHAT GETS THE LINEUPS FOR EVERY DAY IN THE YEAR

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

      var monthDayString = mm + dd
      var month = mm;
      var day = dd;

      for (let i = 329; i <= monthDayString; i++) {
        if (i.toString().substring(1, 3) > 31 || i.toString().substring(1, 3) == '00') {
          continue;
        }
        if (i.toString()[0] != 0) {
          i = ('0' + i.toString())
        }
        //Have to create diff month/day variables for some reason otherwise it doesn't work... also need fullDate to stay put in as it is
        month = i.toString().substring(0, 2)
        day = i.toString().substring(2, 4)

        axios.get(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${month}%2F${day}%2F${yyyy}`)
          .then((res) => {
            if (res.status == 200 && res.data.dates[0]) {
              //Yes, highly repetitive but the stupid thing loses reference to month/day for some reason without it
              month = i.toString().substring(0, 2)
              day = i.toString().substring(2, 4)

              var games = res.data.dates[0].games;

              for (const place in games) {
                // debugger
                var game = games[place];
                const homeTeamId = game.teams.home.team.id;
                const awayTeamId = game.teams.away.team.id;
                var homeIsWinner = game.teams.home.isWinner;
                var awayIsWinner = game.teams.away.isWinner;

                //Two different ones for home and away
                if (homeTeamId == chosenId) {
                  var tempObj = {
                    gamePk: game.gamePk,
                    home: true,
                    teamId: chosenId,
                    fullDate: month + day + yyyy,
                    isWinner: homeIsWinner
                  }
                  dispatch('getBattingOrderForGame', tempObj)
                }

                //Two different ones for home and away
                else if (awayTeamId == chosenId) {
                  var tempObj = {
                    gamePk: game.gamePk,
                    home: false,
                    teamId: chosenId,
                    fullDate: month + day + yyyy,
                    isWinner: awayIsWinner
                  }
                  dispatch('getBattingOrderForGame', tempObj)
                }
              }
              ////////////////////////////////
              //CAN PRETTY EASILY TRANSFORM THIS FUNCTION TO GO ON STARTUP OF APP AND GET ALL LINEUPS FOR ALL TEAMS
              ///////////////////////////////////////////
            }
          })
          .catch(error => {
            console.log(error)
          });
      }
    },


  }
})

export default store
