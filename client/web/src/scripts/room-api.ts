import { ResponseError } from './utils';

const endpoint = 'http://' + window.location.host + '/api';

export type RoomInfo = {
  id: string;
  name: string;
  isPublic: boolean;
  participantsNumber: number;
};
type RoomInfoResponse = {
  name: string;
  is_open: boolean;
  connections: number;
  room_id: string;
};
export const getRoomInfo = (roomId: string) =>
  fetch(endpoint + '/room_info/' + roomId).then<RoomInfo>(async res => {
    if (!res.ok) throw new ResponseError(res);

    const { name, is_open, connections, room_id }: RoomInfoResponse = await res.json();
    return {
      id: room_id,
      name,
      isPublic: is_open,
      participantsNumber: connections,
    };
  });

export type RoomList = {
  name: string;
  id: string;
  participantsNumber: number;
}[];
type RoomListResponse = {
  name: string;
  room_id: string;
  connections: number;
}[];
export const getRoomList = () =>
  fetch(endpoint + '/room_list').then<RoomList>(async res => {
    if (!res.ok) throw new ResponseError(res);

    const info = (await res.json()) as RoomListResponse;
    return info.map(({ name, room_id, connections }) => ({
      name,
      id: room_id,
      participantsNumber: connections,
    }));
  });

export const createRoom = (name: string, isPublic: boolean) =>
  fetch(endpoint + '/create_room', {
    method: 'POST',
    body: JSON.stringify({ name, is_public: isPublic }),
    headers: { 'Content-Type': 'application/json' },
  }).then(async res => {
    if (!res.ok) throw new ResponseError(res);
    return (await res.json()) as string;
  });
