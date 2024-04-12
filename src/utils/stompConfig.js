/** **********************************************************************************************
 * 配置文件，记录系统中固定的参数
 */
// export const MQTT_SERVICE = 'ws://192.168.1.136:3456/equipmentData' // mqtt服务地址 websocket/
// export const MQTT_USERNAME = 'admin' // mqtt连接用户名
// export const MQTT_PASSWORD = 'password' // mqtt连接密码

// //加载完浏览器后  调用connect（），打开通道
// $(function(){
//     //打开双通道
//     connect()
// })
import Stomp from 'stompjs';
import { getConfigKey } from "@/api/system/config";

let stompClient = null;
const map = new Map(); // 记录订阅
let lockReconnect = false; // 避免ws重复连接

// 心跳检测
const heartCheck = {
  timeout: 100, // 1分钟发一次心跳
  timeoutObj: null,
  serverTimeoutObj: null,
  reset() {
    clearTimeout(this.timeoutObj);
    clearTimeout(this.serverTimeoutObj);
    return this;
  },
  start() {
    // debugger
    const self = this;
    this.timeoutObj = setTimeout(() => {
      // 这里发送一个心跳，后端收到后，返回一个心跳消息，
      // onmessage拿到返回的心跳就说明连接正常
      console.log('发送')
      stompClient.send('ping');
      // console.log(`${new Date().toLocaleString()}  ping!`);
      // self.serverTimeoutObj = setTimeout(function(){//如果超过一定时间还没重置，说明后端主动断开了
      //     // stompClient.close();     //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
      //     stompClient.disconnect();
      // }, self.timeout)
    }, this.timeout);
  },
};
// const wsUrl = `${window.webSocketSub}/taskMessagePush`;
const wsUrl = `${getConfigKey("stomp.url")}/taskMessagePush`;
// const wsUrl = `ws://172.100.15.222:9456/taskMessagePush`;
// 是否连接成功
let isConnect = false;
// 订阅路径
let firstArgument = null;
// callback
let SecondArgument = null;
// 定时器
let timer;
let startTime;

// 连接 stomp
export function stompConnect() {
  try {
    if ('WebSocket' in window) {
      const socket = new WebSocket(wsUrl); // equipmentData连接SockJS的endpoint名称为"webSocket"
      stompClient = Stomp.over(socket);// 使用STMOP子协议的WebSocket客户端
      // startTime = new Date().toLocaleString();
    }
    // debugger;
    // initEventHandle();
    stompClient.connect({}, (frame) => {
      // 连接WebSocket服务端
      isConnect = true;
      // console.log('连接stomp' ,socket.readyState,frame);
      heartCheck.reset().start(); // 心跳检测重置
      console.log(`${new Date().toLocaleString()}ws连接成功!`);
    }, (error, e) => {
      isConnect = false;
      console.log(`${new Date().toLocaleString()}断开连接`, error);
      // alert("实时推送已断开,请尝试重新连接  "+startTime+'-直到-'+new Date().toLocaleString())
      //   reconnect(wsUrl);
    });
  } catch (e) {
    reconnect(wsUrl);
    console.log(e);
  }
  // function initEventHandle() {
  //     stompClient.connect({},(frame)=>{// 连接WebSocket服务端
  //         // console.log('连接stomp' ,socket.readyState,frame);
  //         // heartCheck.reset().start();      //心跳检测重置
  //         console.log("ws连接成功!"+new Date().toLocaleString());
  //     },(error,e) => {
  //         console.log('断开连接',error)
  //         alert("实时推送已断开,请重新登陆尝试连接")
  //     })
  //     stompClient.onclose = function () {
  //         reconnect(wsUrl);
  //         console.log("ws连接关闭!"+new Date().toLocaleString());
  //     };
  //     stompClient.onerror = function () {
  //         reconnect(wsUrl);
  //         console.log("ws连接错误!"+new Date().toLocaleString());
  //     };
  //     // stompClient.onopen = function () {
  //     //     heartCheck.reset().start();      //心跳检测重置
  //     //     console.log("llws连接成功!"+new Date().toLocaleString());
  //     // };
  //     stompClient.onmessage = function (event) {    //如果获取到消息，心跳检测重置
  //         // heartCheck.reset().start();      //拿到任何消息都说明当前连接是正常的
  //         console.log(new Date().toLocaleString()+"ws收到消息啦:" +event.data);
  //         if(event.data!='pong'){
  //             debugger
  //             let data = JSON.parse(event.data);
  //         }
  //     };
  // }

  // stompClient.connect({},(frame)=>{// 连接WebSocket服务端
  //     console.log('连接stomp' ,socket.readyState,frame);
  // },(error,e) => {
  //     console.log('断开连接',error)
  //     alert("实时推送已断开,请重新登陆尝试连接")
  // })
}

// export function stompSend( topic,mesage){
//     stompClient.send(topic, {
//         // 'uid': '088263',
//         // 'type': 'aaaa',
//         // 'Message':new Date().getTime()
//     },mesage);
// }
// 订阅
export function stompSubscribe(topic, callback) { // 接收推送的数据
  console.log(topic);
  firstArgument = topic;
  SecondArgument = callback;
  // debugger;
  if (isConnect) {
    if (timer) {
      clearTimeout(timer);
    }
    const subscribe = stompClient.subscribe(topic, (response) => {
      callback(response.body);
    });
    map.set(topic, subscribe);
  } else {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      stompSubscribe(firstArgument, SecondArgument);
    }, 500);
    // useTimeout((param1, param2) => {
    //   stompSubscribe(param1, param2)
    // }, 500)
  }
}


// 取消订阅
export function stompUnSubscribe(topic) {
  const subscribe = map.get(topic);
  console.log(`${new Date().toLocaleString()}取消了订阅`, topic);
  // eslint-disable-next-line no-unused-expressions
  subscribe ? subscribe.unsubscribe() : '';
}

// 关闭通道 stomp
export function stompDisconnect() {
  if (stompClient != null) {
    stompClient.disconnect();
  }
  console.log(`${new Date().toLocaleString()}关闭stomp通道`);
}

// //强制关闭浏览器  调用websocket.close（）,进行正常关闭
// window.onunload = ()=> {
//     // debugger
//     stompDisconnect()
// }
// 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
window.onbeforeunload = function () {
  // stompClient.close();
  stompDisconnect();
};

function reconnect(url) {
  if (lockReconnect) return;
  lockReconnect = true;
  // setTimeout(function () {     //没连接上会一直重连，设置延迟避免请求过多
  //     // createWebSocket(url);
  //     stompConnect()
  //     lockReconnect = false;
  //     console.log('重连...'+new Date().toLocaleString())
  // }, 2000);
}

// 页面加载 链接websocket
window.onload = () => {
  // alert('订阅初始化')
  // debugger
  stompConnect();
};
