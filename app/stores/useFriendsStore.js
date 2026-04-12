import { defineStore } from 'pinia'

export const useFriendsStore = defineStore('friends', {
  state: () => ({
    friends: []
  }),
  getters: {
    friendIds: (state) => {
      return state.friends.map(friend => friend.id)
    }
  },
  actions: {
    setFriends(friendsArray) {
      this.friends = friendsArray
    },
    addFriend(friend) {
      this.friends.push(friend)
    },
    removeFriend(friendId) {
      this.friends = this.friends.filter(friend => friend.id !== friendId)
    }
  }
})
