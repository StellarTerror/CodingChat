import { Room } from '../room-mates';
import { str2hex } from '../utils';
import { strToInboundMessage } from './transformer';
import { InboundMessage, OutboundMessage } from './types';

export class WebsocketConnectionManager {
  private room: Room;
  private destructors: Set<() => void>;
  private messageStream: ReadableStream<InboundMessage & { timestamp: number }>;

  constructor(private socket: WebSocket) {
    this.room = new Room();
    this.destructors = new Set();
    socket.addEventListener('close', () => {
      this.destructors.forEach(f => f());
    });

    this.messageStream = new ReadableStream({
      start: controller => {
        socket.addEventListener('message', ({ data, timeStamp }: MessageEvent<unknown>) => {
          if ('string' === typeof data) {
            const message = strToInboundMessage(data);
            if (message != null) {
              if (message.type === 'disconnect') this.room.left(message.key);
              else this.room.joined(message.key, message.name);

              controller.enqueue(Object.assign(message, { timestamp: timeStamp }));
            }
          }
        });
      },
    });
  }

  sendMessage(message: OutboundMessage) {
    this.socket.send(JSON.stringify(message));
  }
  close() {
    this.socket.close();
  }
  getMessageStream() {
    const [s1, s2] = this.messageStream.tee();
    this.messageStream = s1;
    return s2;
  }
}

const endpoint = 'ws://' + window.location.host + '/api/ws/';

export const open = (roomId: string, name: string) =>
  new Promise<WebsocketConnectionManager>((resolve, reject) => {
    const sock = new WebSocket(endpoint + roomId + '?name=' + str2hex(name));
    const conn = new WebsocketConnectionManager(sock);
    sock.addEventListener('open', () => resolve(conn));
    sock.addEventListener('error', () => reject('cannot open websocket connection'));
  });
