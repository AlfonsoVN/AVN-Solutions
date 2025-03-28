import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ConnectionsListComponent } from './connections-list/connections-list.component';
import { AddConnectionComponent } from './add-connection/add-connection.component';
import { StartChatComponent } from './start-chat/start-chat.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent }, // Ruta por defecto
  { path: 'connections-list', component: ConnectionsListComponent },
  { path: 'add-connection', component: AddConnectionComponent },
  {path: 'start-chat', component: StartChatComponent}
];
