import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app-routing.module';
import { HomeComponent } from './app/home/home.component';
import { tokenInterceptor } from './app/services/token.interceptor'; // Asegúrate de que la ruta sea correcta

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideRouter(appRoutes)
  ]
})
  .catch((err) => console.error(err));
