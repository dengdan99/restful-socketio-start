var { Manager } = require('socket.io-client');

/**
 * 并发链接测试
 */

const hosts = [
    'ws://localhost:8080',
    'ws://localhost:8081',
    'ws://localhost:8082',
    'ws://localhost:8083',
    'ws://localhost:8084',
    'ws://localhost:8085',
]

// 链接数量
const size = 500

var timer;
var countSocket = 0
var disconnectCount = 0
var connectCount = 0
const promises = []

const clientScokets = []
function init (url, num){
    var manager = new Manager(url, {
        reconnection: false, // 不重新链接
        timeout: 5000,
        query: {
            'room_id': 1
        }
    });
    const socket = manager.socket('/', {
        auth: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtb2JpbGUiOiIxMzY2NjY2NjY2NiIsIm5hbWUiOiJsZW8iLCJpZCI6MSwiaWF0IjoxNjI0ODQ4ODk5LCJleHAiOjE2MjQ4NTI0OTl9.3QscnQDDXpOz0v2Ymb4hxfMetkzkPUzjZ5pVPeYJrg4'
        }
    })
    socket.on('connect', function(done) {
        console.log('connected... ->' + num)
        connectCount ++

        socket.send('模拟链接... ->' + url + num);
        clientScokets.push(socket)
    })
    socket.io.on("reconnect", (attempt) => {
        console.log('reconnect')
    })
    socket.on("error", (error) => {
        console.log('error')
    })

    socket.on("disconnect", (error) => {
        disconnectCount ++
        console.log('!!!disconnect... ->' + num)
    })
}


async function go()  {
    timer = setInterval(() => {
        countSocket ++ 
        if (countSocket <= size) {
            init(hosts[Math.floor(Math.random()*hosts.length)], countSocket)
        } else {
            clearInterval(timer)
            showResult()
        }
    }, 100);
}



function showResult() {
    setTimeout(() => {
        console.log(`链接总数： ${size}`)
        console.log(`成功连接数： ${connectCount}`)
        console.log(`失败链接数： ${disconnectCount}`)
        console.log(`成功率 ${Math.floor((connectCount / size) * 10000) / 100}%`)
    }, 8000);
}

go();
