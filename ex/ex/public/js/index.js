var socket = io('http://192.168.2.188:3000');
var username;
var avatr;
//选择头像
$('.photos-img li').on('click', function() {
    $(this).addClass('active').siblings().removeClass('active')
})

//点击按钮登录
$('#loginBtn').on('click', function() {
    //获取用户名
    var username = $('#username').val().trim();

    if (!username) {
        alert('请输入用户名')
        return
    }
    //获取头像
    var avatr = $('.photos-img li.active img').attr('src');

    //console.log(username, avatr)

    //需要告诉socket.io服务， 登录
    socket.emit('login', {
        username: username,
        avatr: avatr
    })
})

//监听登录失败
socket.on('loginError', data => {
        alert('用户名已存在')
    })
    //监听登录成功
socket.on('loginSuccess', data => {

        //alert('登录成功')
        $('.login').fadeOut();
        $('.msg').fadeIn();
        //设置个人信息
        $('.avatr').attr('src', data.avatr);
        $('.usrname-text').text(data.username);

        username = data.username;
        avatr = data.avatr;
    })
    //监听添加用户的消息
socket.on('addUser', data => {
    //添加一条消息
    $('.aletr').append(`
    <div class="div-message-system message-top">
        <span class="message-system">${data.username}加入了群聊</span>
    </div>
    `)
    scrollView();
})

//监听用户列表的数据
socket.on('userList', data => {
        //把userList中的数据动态渲染到左侧菜单
        $('.firend').html('');
        data.forEach(item => {
            $('.firend').append(`
        <li>
            <img src="${item.avatr}" alt="">
            <span>${item.username}</span>
        </li>
        `)
        })
        $('#userCount').text(data.length)
    })
    //监听添加用户离开的消息
socket.on('delUser', data => {
        //添加一条消息
        $('.aletr').append(`
    <div class="div-message-system message-top">
        <span class="message-system">${data.username}离开了群聊</span>
    </div>
    `)
        scrollView();
    })
    // 聊天功能
$('.send-btn-send').on('click', () => {
        var content = $('#send-msg-content').html();
        $('#send-msg-content').html('');

        if (!content) return alert('请输入内容')

        //发送给服务器
        socket.emit('sendMessage', {
            username: username,
            avatr: avatr,
            msg: content
        });
    })
    //监听聊天消息
socket.on('receiveMessage', data => {
        //把消息显示在聊天窗口中
        if (data.username === username) {
            //自己的消息
            $('.aletr').append(`
        <div class="message-top">
        <div class="message-top-r">
            <span class="box-msg2">${data.msg}</span>
            <img class="img" src="${data.avatr}" alt="">
        </div>
    </div
        `);
        } else {
            //别人的消息
            $('.aletr').append(`
        <div class="message-top">
                            <div class="message-top-l">
                                <img class="img" src="${data.avatr}" alt="">
                                <span class="flex-box">
                                      <span>${data.username}</span>
                                <span class="box-msg">${data.msg}</span>
                                </span>
                            </div>
                        </div>
        `);
        }
        scrollView();
    })
    //当前元素滚动到可视区
function scrollView() {
    $('.aletr').children(':last').get(0).scrollIntoView(false);
}
//发送图片
$('#file').on('change', function() {
    var file = this.files[0];
    //console.log(file);
    var fr = new FileReader();
    fr.readAsDataURL(file);

    fr.onload = function() {
        socket.emit('sendImage', {
            username: username,
            avatr: avatr,
            img: fr.result
        })
    }
})

//监听图片聊天信息

socket.on('receiveImage', data => {
    console.log(data)
        //把消息显示在聊天窗口中
    if (data.username === username) {
        //自己的消息
        $('.aletr').append(`
            <div class="message-top">
            <div class="message-top-r">
                <img src="${data.img}" alt="">
                <img class="img" src="${data.avatr}" alt="">
            </div>
        </div
            `);
    } else {
        //别人的消息
        $('.aletr').append(`
            <div class="message-top">
                                <div class="message-top-l">
                                    <img class="img" src="${data.avatr}" alt="">
                                    <span class="flex-box">
                                          <span>${data.username}</span>
                                          <img src="${data.img}" alt="">
                                    </span>
                                </div>
                            </div>
            `);
    }
    $('.aletr img:last').on('load', function() {
        scrollView();
    })
});
//发送表情
$('.major').on('click', () => {
    $("#send-msg-content").emoji({
        button: ".major",
        showTab: false,
        animation: 'slide',
        position: 'topRight',
        icons: [{
            name: "QQ表情",
            path: "../emoji/dist/img/qq/",
            maxNum: 91,
            excludeNums: [41, 45, 54],
            file: ".gif"
        }]
    });
})