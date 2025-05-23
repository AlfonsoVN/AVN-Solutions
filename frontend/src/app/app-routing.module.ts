import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ConnectionsListComponent } from './connections-list/connections-list.component';
import { AddConnectionComponent } from './add-connection/add-connection.component';
import { StartChatComponent } from './start-chat/start-chat.component';
import { ChatBotComponent } from './chat-bot/chat-bot.component'
import { AdminComponent } from './admin/admin.component';
import { AdminGuard } from './guards/admin.guard'; // Asegúrate de que la ruta sea correcta

export const appRoutes: Routes = [
  { path: '', component: HomeComponent }, // Ruta por defecto
  { path: 'connections-list', component: ConnectionsListComponent },
  { path: 'add-connection', component: AddConnectionComponent },
  {path: 'start-chat', component: StartChatComponent},
  { path: 'chat-bot/:id', component: ChatBotComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
];
