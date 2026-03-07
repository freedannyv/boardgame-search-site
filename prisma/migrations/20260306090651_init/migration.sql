-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "bggId" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "yearPublished" INTEGER,
    "minPlayers" INTEGER,
    "maxPlayers" INTEGER,
    "playingTime" INTEGER,
    "weight" DOUBLE PRECISION,
    "image" TEXT,
    "thumbnail" TEXT,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Play" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerCount" INTEGER,
    "duration" INTEGER,
    "notes" TEXT,

    CONSTRAINT "Play_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "owned" BOOLEAN NOT NULL DEFAULT true,
    "forTrade" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameMechanic" (
    "id" TEXT NOT NULL,
    "bggId" INTEGER,
    "name" TEXT NOT NULL,

    CONSTRAINT "GameMechanic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameCategory" (
    "id" TEXT NOT NULL,
    "bggId" INTEGER,
    "name" TEXT NOT NULL,

    CONSTRAINT "GameCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameMechanicJoin" (
    "gameId" TEXT NOT NULL,
    "mechanicId" TEXT NOT NULL,

    CONSTRAINT "GameMechanicJoin_pkey" PRIMARY KEY ("gameId","mechanicId")
);

-- CreateTable
CREATE TABLE "GameCategoryJoin" (
    "gameId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "GameCategoryJoin_pkey" PRIMARY KEY ("gameId","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Game_bggId_key" ON "Game"("bggId");

-- CreateIndex
CREATE INDEX "Play_userId_idx" ON "Play"("userId");

-- CreateIndex
CREATE INDEX "Play_gameId_idx" ON "Play"("gameId");

-- CreateIndex
CREATE INDEX "Collection_userId_idx" ON "Collection"("userId");

-- CreateIndex
CREATE INDEX "Collection_gameId_idx" ON "Collection"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_userId_gameId_key" ON "Collection"("userId", "gameId");

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "Wishlist"("userId");

-- CreateIndex
CREATE INDEX "Wishlist_gameId_idx" ON "Wishlist"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_gameId_key" ON "Wishlist"("userId", "gameId");

-- CreateIndex
CREATE INDEX "GameRating_userId_idx" ON "GameRating"("userId");

-- CreateIndex
CREATE INDEX "GameRating_gameId_idx" ON "GameRating"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GameRating_userId_gameId_key" ON "GameRating"("userId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GameMechanic_bggId_key" ON "GameMechanic"("bggId");

-- CreateIndex
CREATE UNIQUE INDEX "GameMechanic_name_key" ON "GameMechanic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GameCategory_bggId_key" ON "GameCategory"("bggId");

-- CreateIndex
CREATE UNIQUE INDEX "GameCategory_name_key" ON "GameCategory"("name");

-- CreateIndex
CREATE INDEX "GameMechanicJoin_gameId_idx" ON "GameMechanicJoin"("gameId");

-- CreateIndex
CREATE INDEX "GameMechanicJoin_mechanicId_idx" ON "GameMechanicJoin"("mechanicId");

-- CreateIndex
CREATE INDEX "GameCategoryJoin_gameId_idx" ON "GameCategoryJoin"("gameId");

-- CreateIndex
CREATE INDEX "GameCategoryJoin_categoryId_idx" ON "GameCategoryJoin"("categoryId");

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRating" ADD CONSTRAINT "GameRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRating" ADD CONSTRAINT "GameRating_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMechanicJoin" ADD CONSTRAINT "GameMechanicJoin_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMechanicJoin" ADD CONSTRAINT "GameMechanicJoin_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "GameMechanic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCategoryJoin" ADD CONSTRAINT "GameCategoryJoin_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCategoryJoin" ADD CONSTRAINT "GameCategoryJoin_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "GameCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
