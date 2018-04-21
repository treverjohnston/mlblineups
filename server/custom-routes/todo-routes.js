let Todos = require('../models/todo')

module.exports = {
    Todo: {
        path: '/todos/:todoId',
        reqType: 'get',
        method(req, res, next) {
            let action = 'Find todo'
            Todo.findById(req.params.vaultId)
                .then(todo => {
                    console.log(todo)
                    res.send(handleResponse(action, todo))
                }).catch(error => {
                    return next(handleResponse(action, null, error))
                })
        }
    },
}

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