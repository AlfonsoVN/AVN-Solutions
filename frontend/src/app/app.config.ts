import { provideRouter } from '@angular/router';
import { appRoutes } from './app-routing.module';  // Importa las rutas definidas

export const appConfig = [
  provideRouter(appRoutes)  // Aquí se configura el enrutador para la aplicación
];
