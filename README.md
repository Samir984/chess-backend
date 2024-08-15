# CHESSCONNECT

**A web app for online chess platform designed for seamless play between users in real time (Backend)**

## Implementation Overview

### For Random User Mode:

- **A queue stores player requests until they are matched with the next player to start a game.** The queue continuously checks at intervals to start the game when a connection becomes available. Two players are added to the GameQueue with a GameId, allowing them to communicate with each other. Once matched, the players are removed from the queue. If a next player cannot be found within the timeout interval, the player is removed from the queue.

### For Friend Mode:

- **A Set data structure is used to manage player connections.** When a player connects in Friend Mode, their data is stored in the Set with a UserId key, and an invitation link is sent. The player shares this link with their friend. When the friend connects, both players are added to the GameQueue, and their information is delete from the Set.

<br>

## Features

- **Connect with random players around the world**
- **Play with friends by sending a connection link**
- **Play chess in offline as well as online mode**

## Tech Stack

- **Typescript**
- **Next.js**
- **Node.js**
- **Tailwind CSS**

## Preview

![Screenshot from 2024-08-14 13-21-55](https://github.com/user-attachments/assets/ebfa81c9-4e41-4b8a-b26a-48163aa6f4e4)

## Links

- [Live Demo](https://chessconnect.vercel.app/)
- [Frontend Repository](https://github.com/Samir984/chessconnect)

---
