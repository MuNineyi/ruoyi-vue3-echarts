// import { defineStore } from 'pinia'
// // import SockJS from 'sockjs-client';
// // import Stomp from 'stompjs';
// import {Client} from '@stomp/stompjs'
//
// interface StompState {
//     url: string
//     checkInterval: boolean
//     websocket: object
//     stompClient: object
//     listenerList: []
// }
//
// export const stompClient = defineStore('', {
//     state: (): StompState => ({
//         url:'',
//         checkInterval:null,//断线重连时 检测连接是否建立成功
//         websocket:null,
//         stompClient:null,
//         listenerList:[],//监听器列表，断线重连时 用于重新注册监听
//     }),
//     getters: {
//         stompClient: (state: StompState) => state.stompClient
//     },
//
//     actions: {
//         linkStomp(){
//             this.stompClient = new Client({
//                 brokerURL: this.url,
//                 connectHeaders: {},
//                 debug: function (str) {
//                     console.log('stomp: ', str)
//                 },
//                 reconnectDelay: 5000,
//                 heartbeatIncoming: 1000,
//                 heartbeatOutgoing: 1000
//             })
//             this.stompClient.onConnect = (frame) => {
//
//             }
//             this.stompClient.onStompError = function (frame) {
//
//             }
//             this.stompClient.activate()
//         },
//
//         /**
//          *
//          * @param topic 订阅路径
//          * @param callback 订阅回调
//          * @param headers 请求参数
//          * @param isRemoveDup 是否需要移除重复订阅
//          */
//         stompSubscribe(topic: string, callback: Function, headers={}, isRemoveDup: boolean=true) {
//             const subs = this.stompClient.subscribe(topic, callback, headers)
//
//             if (isRemoveDup) {
//                 this.listenerList.push({
//                     topic,
//                     subs
//                 })
//             }
//         },
//         async stompDisconnect() {
//             await this.stompClient.deactivate()
//         }
//
//     },
// })