import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(), provideFirebaseApp(() => initializeApp({"projectId":"morya-travels","appId":"1:1060189735422:web:de7fb86c19fcb8d43798af","storageBucket":"morya-travels.appspot.com","apiKey":"AIzaSyCTJImVyLPIBhQHtzOaCJ4IQGdW7ig5v2M","authDomain":"morya-travels.firebaseapp.com","messagingSenderId":"1060189735422"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
