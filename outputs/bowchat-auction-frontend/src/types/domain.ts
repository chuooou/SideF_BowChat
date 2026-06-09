export type SaleType = "AUCTION" | "DIRECT";
export type ChatRoomType = "AUCTION" | "DIRECT" | "GROUP";

export interface UserInfo {
  id?: number;
  userId?: number;
  email: string;
  nickname: string;
  role?: string;
  provider?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresIn: number;
  userInfo: UserInfo;
}

export type CurrentUserResponse = UserInfo;

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  startingPrice: number;
  thumbnailUrl: string | null;
  saleType: SaleType;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetail {
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
}

export interface ProductCreatePayload {
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  saleType: SaleType;
}

export interface AuctionResponse {
  id: number;
  productId: number;
  currentPrice: number;
  startingPrice: number;
  startTime: string;
  endTime: string;
  winnerId: number | null;
  closed: boolean;
}

export interface StartAuctionPayload {
  startingPrice: number;
  endTime: string;
}

export interface BidPayload {
  bidAmount: number;
}

export interface ChatParticipantResponse {
  userId: number;
  nickname: string;
  role?: string;
}

export interface ChatRoomResponse {
  roomId: number;
  roomName: string;
  type: ChatRoomType;
  participants: ChatParticipantResponse[];
  productId: number | null;
}

export interface EnterChatResponse {
  roomId: number;
  roomType: ChatRoomType;
  roomName: string;
}

export type ChatRoomEnterPayload =
  | { roomType: "AUCTION"; productId: number }
  | { roomType: "DIRECT"; productId: number }
  | { roomType: "GROUP"; roomName: string };

export interface ChatResponse {
  id: string;
  roomId: number;
  senderId: number;
  senderName: string;
  content: string;
  messageType: string;
  createDate: string;
}
