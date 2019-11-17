var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

//记录所有已经登录过的用户，唯一用户名
const users = []
app.use(require('express').static('public'))
app.get('/', function(req, res) {
    //res.sendFile(__dirname + '/index.html');
    // res.append('Access-Control-Allow-Origin', '*');
    res.redirect('/index.html')
});

io.on('connection', function(socket) {
    //console.log('新用户连接');
    socket.on('login', data => {
            //如果data在users中存在,说明该用户已经存在,不允许用户登录
            //如果data在users中不存在,说明该用户没有,允许用户登录
            let user = users.find(item => item.username === data.username)

            if (user) {
                //表示用户存在，登录失败，服务器需要给当前用户响应，告诉登录失败
                socket.emit('loginError', { msg: '登录失败' })
                    // console.log('登录失败')
            } else {
                //告诉用户，登录成功
                users.push(data)
                socket.emit('loginSuccess', data)
                    //console.log('登录成功')

                //告诉所有的用户，有用户加入了聊天室，广播
                //socket.emit告诉当前用户
                //io.emit告诉所有用户，广播事件
                io.emit('addUser', data)

                //告诉所有的用户，目前聊天室中有多少人
                io.emit('userList', users)

                //把登录成功的用户名和头像存储起来,也可用sessionStorage
                socket.username = data.username;
                socket.avatr = data.avatr;
            }
        })
        //用户断开连接功能
    socket.on('disconnect', () => {
        //把当前用户的信息从users中删除
        let idx = users.findIndex(item => item.username == socket.username);
        users.splice(idx, 1);



        //1.告诉所有人，有人离开了聊天室
        io.emit('delUser', {
                username: socket.username,
                avatr: socket.avatr
            })
            //2.告诉所有人，userList发生了改变
        io.emit('userList', users)
    })

    //监听聊天的消息
    socket.on('sendMessage', data => {
            //console.log(data);
            //广播给所有用户
            io.emit('receiveMessage', data)
        })
        //接收图片信息
    socket.on('sendImage', data => {
        //console.log(data)
        //广播给所有用户
        io.emit('receiveImage', data)
    })
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});