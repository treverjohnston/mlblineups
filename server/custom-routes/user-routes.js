let Todos = require('../models/todo')

module.exports = {
  // userVaults: {
  //   path: '/uservaults',
  //   reqType: 'get',
  //   method(req, res, next){
  //     let action = 'Find User Vaults'
  //     Vaults.find({creatorId: req.session.uid})
  //       .then(vaults => {
  //         res.send(handleResponse(action, vaults))
  //       }).catch(error => {
  //         return next(handleResponse(action, null, error))
  //       })
  //   }
  // },
  userTodos: {
    path: '/user/:userId/todos',
    reqType: 'get',
    method(req, res, next){
      let action = 'Find User Todos by User Id'
      Todos.find({creatorId: req.params.userId})
        .then(todos => {
          res.send(handleResponse(action, todos))
        }).catch(error => {
          return next(handleResponse(action, null, error))
        })
    }
  },
  updateTodos: {
    path: '/user/:userId/todos/:todoId',
    reqType: 'put',
    method(req, res, next){
      let action = 'Toggle complete'
      Todos.findById({_id: req.params.todoId})
        .then(todo => {
          // console.log('todo1', todo)
          todo.completed = !todo.completed
          todo.save()
          // console.log('todo2', todo)
          res.send(handleResponse(action, todo))
        }).catch(error => {
          return next(handleResponse(action, null, error))
        })
    }
  },
  // profileKeeps: {
  //   path: '/uservaults/:userId/keeps',
  //   reqType: 'get',
  //   method(req, res, next){
  //     let action = 'Find User Keeps by Id'
  //     Keeps.find({creatorId: req.params.userId})
  //       .then(keeps => {
  //         res.send(handleResponse(action, keeps))
  //       }).catch(error => {
  //         return next(handleResponse(action, null, error))
  //       })
  //   }
  // },
  // updateKeeps: {
  //   path: '/uservaults/keeps/:keepId',
  //   reqType: 'put',
  //   method(req, res, next){
  //     let action = 'Update Keep views by Id'
  //     Keeps.findById({_id: req.params.keepId})
  //       .then(keep => {
  //         keep.views++
  //         res.send(handleResponse(action, keep))
  //         keep.save()
  //       }).catch(error => {
  //         return next(handleResponse(action, null, error))
  //       })
  //   }
  // }
}

// function updateKeepViews(keep) {
//   keep.views++
// }
function handleResponse(action, data, error) {
    var response = {
      action: action,
      data: data
    }
    if (error) {
      response.error = error
    }
    return response
  }