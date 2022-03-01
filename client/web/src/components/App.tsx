import { Route, MakeGenerics, Router, ReactLocation } from '@tanstack/react-location';
import { Welcome } from '~/pages/index';
import { ChatPage } from '~/pages/chat';
import { getRoomInfo, RoomInfo } from '~/scripts/room-api';

export type LocationGenerics = MakeGenerics<{
  LoaderData: {
    roomInfo: RoomInfo;
  };
}>;

const location = new ReactLocation();

const routes: Route[] = [
  {
    path: '/',
    element: <Welcome />,
  },
  {
    path: 'chat',
    children: [
      {
        path: ':roomId',
        element: <ChatPage />,
        loader: async ({ params: { roomId } }) => ({ roomInfo: await getRoomInfo(roomId!) }),
      },
    ],
  },
];

const App = () => {
  return <Router routes={routes} location={location} />;
};

export default App;
