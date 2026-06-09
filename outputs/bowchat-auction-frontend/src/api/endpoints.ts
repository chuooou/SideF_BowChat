import { auctionApi, chatApi, productApi, userApi } from "./http";
import type {
  AuctionResponse,
  AuthResponse,
  BidPayload,
  ChatResponse,
  ChatRoomEnterPayload,
  ChatRoomResponse,
  CurrentUserResponse,
  EnterChatResponse,
  ProductCreatePayload,
  ProductDetail,
  ProductResponse,
  StartAuctionPayload,
} from "../types/domain";

export const authEndpoints = {
  signup: (payload: { email: string; password: string; nickName: string }) =>
    userApi.post<void>("/user/signup", payload),
  login: async (payload: { email: string; password: string }) =>
    (await userApi.post<AuthResponse>("/auth/login", payload)).data,
  me: async () => (await userApi.get<CurrentUserResponse>("/auth/me")).data,
  refresh: async () => (await userApi.post<{ accessToken: string }>("/auth/refresh")).data,
  logout: async () => userApi.post<void>("/auth/logout"),
};

export const productEndpoints = {
  list: async () => (await productApi.get<ProductResponse[]>("/api/products")).data,
  detail: async (productId: number) => (await productApi.get<ProductDetail>(`/api/products/${productId}`)).data,
  create: async (payload: ProductCreatePayload) => (await productApi.post<number>("/api/products", payload)).data,
};

export const auctionEndpoints = {
  list: async () => (await auctionApi.get<AuctionResponse[]>("/api/auctions")).data,
  detail: async (auctionId: number) => (await auctionApi.get<AuctionResponse>(`/api/auctions/${auctionId}`)).data,
  start: async (productId: number, payload: StartAuctionPayload) =>
    auctionApi.post<void>(`/api/auctions/${productId}/start`, payload),
  bid: async (auctionId: number, payload: BidPayload) =>
    (await auctionApi.post<AuctionResponse>(`/api/auctions/${auctionId}/bid`, payload)).data,
};

export const chatEndpoints = {
  rooms: async () => (await chatApi.get<ChatRoomResponse[]>("/api/chat/rooms")).data,
  enter: async (payload: ChatRoomEnterPayload) =>
    (await chatApi.post<EnterChatResponse>("/api/chat/rooms/enter", payload)).data,
  leave: async (roomId: number) => chatApi.post<void>(`/api/chat/rooms/${roomId}/leave`),
  messages: async (roomId: number) =>
    (await chatApi.get<ChatResponse[]>(`/api/chat/messages/${roomId}`)).data,
};
