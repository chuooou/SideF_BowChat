export type SaleType = "AUCTION" | "DIRECT";
export type ChatRoomType = "AUCTION" | "DIRECT" | "GROUP";

export type UserInfo = {
  id?: number;
  userId?: number;
  email: string;
  nickname: string;
  role?: string;
  provider?: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresIn: number;
  userInfo: UserInfo;
};

export type CurrentUserResponse = UserInfo;

export type ProductResponse = {
  id: number;
  name: string;
  description: string;
  startingPrice: number;
  thumbnailUrl: string | null;
  saleType: SaleType;
  createdAt: string;
  updatedAt: string;
};

export type ProductDetail = {
  productId: number;
  productName: string;
  productDescription: string;
  productPrice: number;
  imageUrls: string[];
  sellerNickname: string;
  createdDate: string;
  modifiedDate: string;
  saleType: SaleType;
  isSeller: boolean;
};

export type ProductCreatePayload = {
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  saleType: SaleType;
};

export type AuctionResponse = {
  id: number;
  productId: number;
  currentPrice: number;
  startingPrice: number;
  startTime: string;
  endTime: string;
  winnerId: number | null;
  closed: boolean;
};

export type StartAuctionPayload = {
  startingPrice: number;
  endTime: string;
};

export type BidPayload = {
  bidAmount: number;
};

export type ChatParticipantResponse = {
  userId: number;
  nickname: string;
  role?: string;
};

export type ChatRoomResponse = {
  roomId: number;
  roomName: string;
  type: ChatRoomType;
  participants: ChatParticipantResponse[];
  productId: number | null;
};

export type EnterChatResponse = {
  roomId: number;
  roomType: ChatRoomType;
  roomName: string;
};

export type ChatRoomEnterPayload =
  | { roomType: "AUCTION"; productId: number }
  | { roomType: "DIRECT"; productId: number }
  | { roomType: "GROUP"; roomName: string };

export type ChatResponse = {
  id: string;
  roomId: number;
  senderId: number;
  senderName: string;
  content: string;
  messageType: string;
  createDate: string;
};
