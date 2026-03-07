-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "abstractsRank" INTEGER,
ADD COLUMN     "average" DOUBLE PRECISION,
ADD COLUMN     "bayesAverage" DOUBLE PRECISION,
ADD COLUMN     "cgsRank" INTEGER,
ADD COLUMN     "childrensGamesRank" INTEGER,
ADD COLUMN     "familyGamesRank" INTEGER,
ADD COLUMN     "isExpansion" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "partyGamesRank" INTEGER,
ADD COLUMN     "rank" INTEGER,
ADD COLUMN     "strategyGamesRank" INTEGER,
ADD COLUMN     "thematicRank" INTEGER,
ADD COLUMN     "usersRated" INTEGER,
ADD COLUMN     "warGamesRank" INTEGER;
