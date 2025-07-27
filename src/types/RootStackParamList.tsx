export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ProjectSelectScreen: {user_id: number; user_name: string};
  BoardSelectScreen: {board_id?: number};
  // BoardScreen: {id: number; roomId?: number};
  BoardScreen: undefined;
};
