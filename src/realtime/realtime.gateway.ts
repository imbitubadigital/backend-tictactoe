import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(0, { namespace: 'room' })
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  private server: Server;
  afterInit(server: Server) {
    console.log('server realtime inicializado');
  }
  handleDisconnect(client: Socket) {
    console.log('disconnect', client.id);
  }
  handleConnection(client: Socket, ...args: any[]) {
    console.log('conectado', client.id);
  }

  @SubscribeMessage('join')
  joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { name: string; room_id: string },
  ): void {
    const { name, room_id } = body;

    client.join(room_id);
    console.log('entrou', { client: client.id, name, room_id });
    // client.broadcast.to('room_id').emit('recive-message', { ...body, name: 'Antonio' });
    // client.broadcast.emit('recive-message', { ...body, name: 'Antonio' });
  }

  @SubscribeMessage('send-message')
  sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { message: string; roomId: string },
  ): void {
    console.log('o que chegou', body);
    //  client.emit('recive-message', { msg: 'enviado do server' });
    client.broadcast
      .to(body.roomId)
      .emit('receive-message', { msg: 'enviado do server' });
  }
}
