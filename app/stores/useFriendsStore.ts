import { defineStore } from 'pinia'

interface Friend {
  id: number
  username: string
  collectionCount: number
}

interface FriendsState {
  friends: Friend[]
}

export const useFriendsStore = defineStore('friends', {
  state: (): FriendsState => ({
    friends: []
  }),
  getters: {
    friendIds: (state): number[] => {
      return state.friends.map(friend => friend.id)
    }
  },
  actions: {
    setFriends(friendsArray: Friend[]) {
      this.friends = friendsArray
    },
    addFriend(friend: Friend) {
      this.friends.push(friend)
    },
    removeFriend(friendId: number) {
      this.friends = this.friends.filter(friend => friend.id !== friendId)
    }
  }
})
