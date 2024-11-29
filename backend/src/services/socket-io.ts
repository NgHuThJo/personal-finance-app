import { Server as HttpServer } from "node:http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { z } from "zod";
import { userService } from "./user.js";
import logger from "#backend/utils/logger.js";
import {
  numericStringSchema,
  stringToNumberSchema,
} from "#backend/types/zod.js";

export type SocketServiceType = typeof SocketService;

export class SocketService {
  #onlineUsers: Map<number, Socket>;
  #io: SocketIOServer;

  constructor(server: HttpServer) {
    this.#io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        // origin: process.env.PROXY_URL || "http://localhost:5173",
        credentials: true,
      },
    });
    this.#onlineUsers = new Map();

    this.#setupListeners();
  }

  #setupListeners() {
    this.#io.on("connect", (socket) => {
      logger.debug("A user connected");

      socket.on("disconnect", () => {
        for (const [key, value] of this.#onlineUsers) {
          if (value === socket) {
            this.removeUser(key);
            break;
          }
        }

        logger.debug("A user disconnected");
      });

      socket.on("login", async (data: string) => {
        try {
          const parsedData = stringToNumberSchema.parse(data);
          this.addUser(parsedData, socket);
          const onlineUserIds = this.getOnlineUserList();
          const onlineUsers = await userService.getListOfUsers(onlineUserIds);
          this.#io.emit("login", `UserId ${parsedData} logged in`);
          this.#io.emit("getOnlineUsers", onlineUsers);
          socket.broadcast.emit(
            "notification",
            `UserId ${parsedData} logged in`,
          );
        } catch (error) {
          logger.debug(error);
        }
      });

      socket.on("logout", async (data: string) => {
        try {
          const parsedData = stringToNumberSchema.parse(data);
          this.removeUser(parsedData);
          const onlineUserIds = this.getOnlineUserList();
          const onlineUsers = await userService.getListOfUsers(onlineUserIds);
          this.#io.emit("logout", `UserId ${parsedData} logged out`);
          socket.broadcast.emit(
            "notification",
            `UserId ${parsedData} logged out`,
          );
          socket.broadcast.emit("getOnlineUsers", onlineUsers);
        } catch (error) {
          logger.debug(error);
        }
      });

      socket.on(
        "joinChatroom",
        (data: {
          userId: string;
          currentRoomId: string | undefined;
          newRoomId: string;
        }) => {
          try {
            const { userId, currentRoomId, newRoomId } = z
              .object({
                userId: stringToNumberSchema,
                currentRoomId: numericStringSchema.optional(),
                newRoomId: numericStringSchema,
              })
              .parse(data);

            if (currentRoomId) {
              this.leaveRoom(userId, currentRoomId);
            }
            this.joinRoom(userId, newRoomId);
            socket
              .to(newRoomId)
              .emit(
                "notification",
                `User "${userId}" has joined room "${newRoomId}"`,
              );
          } catch (error) {
            logger.debug(error);
          }
        },
      );

      socket.on(
        "leaveRoom",
        async (data: { userId: string; currentRoomId: string }) => {
          const { userId, currentRoomId } = z
            .object({
              userId: stringToNumberSchema,
              currentRoomId: numericStringSchema,
            })
            .parse(data);

          socket
            .to(currentRoomId)
            .emit(
              "notification",
              `User "${userId}" has left room "${currentRoomId}"`,
            );
          this.leaveRoom(userId, currentRoomId);
        },
      );
    });
  }

  addUser(userId: number, socket: Socket) {
    this.#onlineUsers.set(userId, socket);
  }

  removeUser(userId: number) {
    this.#onlineUsers.delete(userId);
  }

  getOnlineUserList() {
    return Array.from(this.#onlineUsers.keys());
  }

  joinRoom(userId: number, roomId: string) {
    this.#onlineUsers.get(userId)?.join(roomId);
  }

  leaveRoom(userId: number, roomId: string) {
    this.#onlineUsers.get(userId)?.leave(roomId);
  }

  broadcast<T>(event: string, data: T, userId: number) {
    this.#onlineUsers.get(userId)?.broadcast.emit(event, data);
  }

  emit<T>(event: string, data: T, userId: number) {
    this.#onlineUsers.get(userId)?.emit(event, data);
  }

  emitToAll<T>(event: string, data: T) {
    this.#io.emit(event, data);
  }

  broadcastInRoom<T>(event: string, data: T, userId: number, roomId: string) {
    this.#onlineUsers.get(userId)?.to(roomId).emit(event, data);
  }

  emitInRoom<T>(event: string, data: T, roomId: string) {
    console.log("Room emit", event, data);
    this.#io.in(roomId).emit(event, data);
  }
}
