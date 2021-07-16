export const environment = {
  production: true,
  firebase: {
    apiKey: "AIzaSyBpX2XZM4YbN1XL5emw07LzAG5i0PpanPE",
    authDomain: "blog-9a5ab.firebaseapp.com",
    databaseURL: "https://blog-9a5ab.firebaseio.com",
    projectId: "blog-9a5ab",
    storageBucket: "blog-9a5ab.appspot.com",
    messagingSenderId: "97460591548",
    appId: "1:97460591548:web:0382f5da7008cabd9969b9",
    measurementId: "G-PRYCPK52S2"
  },
  serverKey: "AAAAFrEam7w:APA91bGfgaguGwRvtnRLc2YnsO5UqhktjrLmTSK_1awInWz-uGWBNr97LpHqanSA3LIvSR3l-lnsTMkJh6mgKwh7BgX_EUOjpo2peNTLf4PsSzruY7MflNiHCc72OXfAU4Ox9nTdKg-5",
  api: {
    baseUrl: "http://localhost:3000/api/",
    userAuth: {
      signUp: "auth/sign-up",
      login: "auth/login",
      getUser: "auth/user",
      logout: "auth/logout",
      getAll: "auth/users"
    },
    update: {
      uploadProfileImage: "upload/profileimage",
      deleteImage: "upload/deleteprofileimage",
      updateProfile: "update/profile"
    },
    getProfileInage: "upload/profileimage",
    post: {
      createPost: "post/create",
      getAll: "post/all-posts",
      getPostImage: "post/postimage",
      getNewPost: "post/new-post",
      delete: "post/delete",
      update: "post/update",
      updateLike: "post/update-like",
      updateBookmark: "post/update-bookmark",
    },
    comment: {
      addComment: "comment/add-comment",
      getAllComments: "comment/all-comment",
      deleteComment: "comment/delete-comment"
    }
  }
};
