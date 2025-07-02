const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")

const app = express()
const server = http.createServer(app)

// Cấu hình CORS cho Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://your-domain.com"],
    methods: ["GET", "POST"],
    credentials: true,
  },
})

app.use(cors())
app.use(express.json())

// Lưu trữ thông tin phòng và người dùng
const rooms = new Map()
const users = new Map()

// Middleware để log các sự kiện
io.use((socket, next) => {
  console.log(`Socket ${socket.id} attempting to connect`)
  next()
})

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`)

  // Xử lý tham gia phòng
  socket.on("join-room", (data) => {
    const { roomId, userId, userName, userRole } = data

    console.log(`User ${userName} (${userId}) joining room ${roomId}`)

    // Lưu thông tin user
    users.set(socket.id, {
      userId,
      userName,
      userRole,
      roomId,
      socketId: socket.id,
    })

    // Tham gia phòng Socket.IO
    socket.join(roomId)

    // Khởi tạo phòng nếu chưa tồn tại
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map())
    }

    const room = rooms.get(roomId)
    room.set(userId, {
      userId,
      userName,
      userRole,
      socketId: socket.id,
      joinedAt: new Date(),
    })

    // Thông báo cho các user khác trong phòng
    socket.to(roomId).emit("user-joined", {
      userId,
      userName,
      userRole,
    })

    // Gửi danh sách user hiện tại cho user mới
    const currentUsers = Array.from(room.values())
      .filter((user) => user.userId !== userId)
      .map((user) => ({
        userId: user.userId,
        userName: user.userName,
        userRole: user.userRole,
      }))

    socket.emit("room-users", currentUsers)

    console.log(`Room ${roomId} now has ${room.size} users`)
  })

  // Xử lý WebRTC signaling
  socket.on("offer", (data) => {
    const { targetId, offer, senderId } = data
    console.log(`Offer from ${senderId} to ${targetId}`)

    // Tìm socket của target user
    const targetUser = findUserByUserId(targetId)
    if (targetUser) {
      io.to(targetUser.socketId).emit("offer", {
        offer,
        senderId,
      })
    }
  })

  socket.on("answer", (data) => {
    const { targetId, answer, senderId } = data
    console.log(`Answer from ${senderId} to ${targetId}`)

    const targetUser = findUserByUserId(targetId)
    if (targetUser) {
      io.to(targetUser.socketId).emit("answer", {
        answer,
        senderId,
      })
    }
  })

  socket.on("ice-candidate", (data) => {
    const { targetId, candidate, senderId } = data
    console.log(`ICE candidate from ${senderId} to ${targetId}`)

    const targetUser = findUserByUserId(targetId)
    if (targetUser) {
      io.to(targetUser.socketId).emit("ice-candidate", {
        candidate,
        senderId,
      })
    }
  })

  // Xử lý chat messages
  socket.on("chat-message", (data) => {
    const { roomId, message, userId, userName, userRole } = data
    console.log(`Chat message in room ${roomId} from ${userName}: ${message}`)

    const chatData = {
      id: Date.now(),
      message,
      userId,
      userName,
      userRole,
      timestamp: new Date().toISOString(),
    }

    // Gửi tin nhắn cho tất cả user trong phòng
    io.to(roomId).emit("chat-message", chatData)
  })

  // Xử lý screen sharing
  socket.on("start-screen-share", (data) => {
    const { roomId, userId } = data
    socket.to(roomId).emit("user-started-screen-share", { userId })
  })

  socket.on("stop-screen-share", (data) => {
    const { roomId, userId } = data
    socket.to(roomId).emit("user-stopped-screen-share", { userId })
  })

  // Xử lý audio/video toggle
  socket.on("toggle-audio", (data) => {
    const { roomId, userId, enabled } = data
    socket.to(roomId).emit("user-audio-toggled", { userId, enabled })
  })

  socket.on("toggle-video", (data) => {
    const { roomId, userId, enabled } = data
    socket.to(roomId).emit("user-video-toggled", { userId, enabled })
  })

  // Xử lý disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`)

    const user = users.get(socket.id)
    if (user) {
      const { roomId, userId, userName } = user

      // Xóa user khỏi phòng
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId)
        room.delete(userId)

        // Thông báo cho các user khác
        socket.to(roomId).emit("user-left", {
          userId,
          userName,
        })

        // Xóa phòng nếu không còn ai
        if (room.size === 0) {
          rooms.delete(roomId)
          console.log(`Room ${roomId} deleted - no users remaining`)
        } else {
          console.log(`Room ${roomId} now has ${room.size} users`)
        }
      }

      users.delete(socket.id)
    }
  })

  // Xử lý leave room
  socket.on("leave-room", () => {
    const user = users.get(socket.id)
    if (user) {
      const { roomId, userId, userName } = user

      socket.leave(roomId)

      if (rooms.has(roomId)) {
        const room = rooms.get(roomId)
        room.delete(userId)

        socket.to(roomId).emit("user-left", {
          userId,
          userName,
        })
      }

      users.delete(socket.id)
      console.log(`User ${userName} left room ${roomId}`)
    }
  })
})

// Helper function để tìm user theo userId
function findUserByUserId(userId) {
  for (const [socketId, user] of users) {
    if (user.userId === userId) {
      return user
    }
  }
  return null
}

// API endpoints
app.get("/api/rooms", (req, res) => {
  const roomList = Array.from(rooms.entries()).map(([roomId, users]) => ({
    roomId,
    userCount: users.size,
    users: Array.from(users.values()).map((user) => ({
      userId: user.userId,
      userName: user.userName,
      userRole: user.userRole,
    })),
  }))

  res.json(roomList)
})

app.get("/api/rooms/:roomId", (req, res) => {
  const { roomId } = req.params
  const room = rooms.get(roomId)

  if (!room) {
    return res.status(404).json({ error: "Room not found" })
  }

  const roomData = {
    roomId,
    userCount: room.size,
    users: Array.from(room.values()).map((user) => ({
      userId: user.userId,
      userName: user.userName,
      userRole: user.userRole,
      joinedAt: user.joinedAt,
    })),
  }

  res.json(roomData)
})

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    activeRooms: rooms.size,
    activeUsers: users.size,
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
  console.log(`Rooms API: http://localhost:${PORT}/api/rooms`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("Server closed")
    process.exit(0)
  })
})
