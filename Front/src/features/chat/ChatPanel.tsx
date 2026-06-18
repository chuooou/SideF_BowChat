import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DoorOpen, MessagesSquare, RefreshCcw, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { chatEndpoints } from "../../api/endpoints";
import { apiBaseUrls } from "../../api/http";
import { EmptyState } from "../../components/EmptyState";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuthStore } from "../../store/authStore";
import type { ChatResponse, ChatRoomResponse } from "../../types/domain";

type ChatPanelProps = {
  activeRoomId: number | null;
  onRoomSelect: (roomId: number) => void;
};

type GroupForm = {
  roomName: string;
};

type MessageForm = {
  content: string;
};

export function ChatPanel({ activeRoomId, onRoomSelect }: ChatPanelProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [liveMessages, setLiveMessages] = useState<ChatResponse[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const roomsQuery = useQuery({ queryKey: ["chat", "rooms"], queryFn: chatEndpoints.rooms, enabled: Boolean(accessToken) });
  const activeRoom = roomsQuery.data?.find((room) => room.roomId === activeRoomId) ?? null;
  const messagesQuery = useQuery({
    queryKey: ["chat", "messages", activeRoomId],
    queryFn: () => chatEndpoints.messages(activeRoomId!),
    enabled: Boolean(activeRoomId && accessToken),
  });

  const groupForm = useForm<GroupForm>({ defaultValues: { roomName: "" } });
  const messageForm = useForm<MessageForm>({ defaultValues: { content: "" } });
  const messages = useMemo(() => [...(messagesQuery.data ?? []), ...liveMessages], [messagesQuery.data, liveMessages]);

  const enterGroup = useMutation({
    mutationFn: (values: GroupForm) => chatEndpoints.enter({ roomType: "GROUP", roomName: values.roomName }),
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
      onRoomSelect(room.roomId);
      groupForm.reset();
    },
  });

  const leaveRoom = useMutation({
    mutationFn: (roomId: number) => chatEndpoints.leave(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
      onRoomSelect(0);
    },
  });

  useEffect(() => {
    setLiveMessages([]);
    socketRef.current?.close();

    if (!activeRoomId || !accessToken) {
      return;
    }

    const socket = new WebSocket(`${apiBaseUrls.chatWs}/ws/chat/${activeRoomId}?token=${encodeURIComponent(accessToken)}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as IncomingChatMessage;
        setLiveMessages((current) => [...current, normalizeIncomingMessage(parsed, activeRoomId)]);
      } catch {
        setLiveMessages((current) => [
          ...current,
          {
            id: `${activeRoomId}-${Date.now()}-${Math.random()}`,
            roomId: activeRoomId,
            senderId: 0,
            senderName: "system",
            content: event.data,
            messageType: "CHAT",
            createDate: new Date().toISOString(),
          },
        ]);
      }
    };

    return () => socket.close();
  }, [activeRoomId, accessToken]);

  const sendMessage = (values: MessageForm) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    socketRef.current.send(values.content);
    messageForm.reset();
  };

  return (
    <section className="panel p-4">
      <SectionHeader
        title="채팅"
        description="chat-service REST와 WebSocket을 함께 사용합니다."
        action={
          <button className="btn-muted" onClick={() => roomsQuery.refetch()} title="새로고침">
            <RefreshCcw size={16} />
            새로고침
          </button>
        }
      />

      {!accessToken ? (
        <EmptyState title="로그인이 필요합니다." description="채팅방 목록과 WebSocket 연결은 인증 토큰이 있어야 사용할 수 있습니다." />
      ) : null}

      {accessToken ? (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            <form className="rounded-lg border border-line bg-field p-3" onSubmit={groupForm.handleSubmit((values) => enterGroup.mutate(values))}>
              <label>
                <span className="label">그룹 채팅방</span>
                <input className="input" placeholder="room name" {...groupForm.register("roomName", { required: true })} />
              </label>
              <button className="btn-primary mt-2 w-full" disabled={enterGroup.isPending} title="그룹 채팅 입장">
                <MessagesSquare size={16} />
                입장
              </button>
            </form>

            <div className="grid max-h-[420px] gap-2 overflow-auto pr-1">
              {roomsQuery.data?.map((room) => (
                <RoomButton key={room.roomId} room={room} active={activeRoomId === room.roomId} onClick={() => onRoomSelect(room.roomId)} />
              ))}
              {roomsQuery.data?.length === 0 ? <EmptyState title="참여 중인 채팅방이 없습니다." /> : null}
            </div>
          </div>

          <div className="flex min-h-[520px] flex-col rounded-lg border border-line bg-field">
            {activeRoom ? (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-line bg-white p-3">
                  <div>
                    <p className="font-bold">{activeRoom.roomName}</p>
                    <p className="text-xs text-slate-500">room #{activeRoom.roomId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge>{activeRoom.type}</StatusBadge>
                    <button className="btn-muted h-9 px-2" onClick={() => leaveRoom.mutate(activeRoom.roomId)} title="채팅방 나가기">
                      <DoorOpen size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-2 overflow-auto p-3">
                  {messages.map((message) => (
                    <div key={`${message.id}-${message.createDate}`} className="rounded-lg border border-line bg-white p-3">
                      <div className="mb-1 flex items-center justify-between gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-ink">{message.senderName}</span>
                        <span>{formatTime(message.createDate)}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                  ))}
                  {messages.length === 0 ? <EmptyState title="아직 메시지가 없습니다." /> : null}
                </div>

                <form className="flex gap-2 border-t border-line bg-white p-3" onSubmit={messageForm.handleSubmit(sendMessage)}>
                  <input className="input" placeholder="메시지 입력" {...messageForm.register("content", { required: true })} />
                  <button className="btn-primary h-11 px-3" title="전송">
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-4">
                <EmptyState title="채팅방을 선택하세요" />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function RoomButton({ room, active, onClick }: { room: ChatRoomResponse; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`rounded-lg border p-3 text-left transition hover:border-brand ${active ? "border-brand bg-teal-50" : "border-line bg-white"}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate font-bold">{room.roomName}</p>
        <StatusBadge>{room.type}</StatusBadge>
      </div>
      <p className="mt-1 text-xs text-slate-500">{room.participants.length}명 참여</p>
    </button>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

type IncomingChatMessage = Partial<ChatResponse> & {
  timestamp?: number;
};

function normalizeIncomingMessage(message: IncomingChatMessage, roomId: number): ChatResponse {
  return {
    id: message.id ?? `${roomId}-${message.timestamp ?? Date.now()}-${Math.random()}`,
    roomId: message.roomId ?? roomId,
    senderId: message.senderId ?? 0,
    senderName: message.senderName ?? "system",
    content: message.content ?? "",
    messageType: message.messageType ?? "CHAT",
    createDate: message.createDate ?? new Date(message.timestamp ?? Date.now()).toISOString(),
  };
}
