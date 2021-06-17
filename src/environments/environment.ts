// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
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
    userAuth: {
      signUp: "http://localhost:3000/api/auth/sign-up",
      login: "http://localhost:3000/api/auth/login",
      getUser: "http://localhost:3000/api/auth/user",
      logout: "http://localhost:3000/api/auth/logout"
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
