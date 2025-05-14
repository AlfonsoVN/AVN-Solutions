import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css']
})
export class ChatBotComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  databaseId: string | null = null;
  messages: {role: string, content: string, sqlResult?: SafeHtml}[] = [];
  newMessage: string = '';
  chart: Chart | null = null;
  dangerousQuery: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    document.addEventListener('executeDangerousQuery', () => this.executeDangerousQuery());
  }

  ngOnInit() {
    this.databaseId = this.route.snapshot.paramMap.get('id');
    this.loadMessagesFromLocalStorage();
    if (this.messages.length === 0) {
      this.initializeChat();
    }
  }
  
  
  

  private loadMessagesFromLocalStorage() {
    const savedMessages = localStorage.getItem(`chat_messages_${this.databaseId}`);
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages) as Array<{role: string; content: string; sqlResult?: string}>;
      this.messages = parsedMessages.map(message => ({
        ...message,
        sqlResult: message.sqlResult ? this.sanitizer.bypassSecurityTrustHtml(message.sqlResult) : undefined
      }));
    }
  }
  
  

  ngAfterViewInit() {
    // El canvas está disponible aquí si necesitas hacer algo con él inmediatamente después de la inicialización de la vista
  }

  initializeChat() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  
    this.http.post('/api/chat_view/', { 
      prompt: 'initialize',
      databaseId: this.databaseId
    }, { headers }).subscribe({
      next: (response: any) => {
        console.log('Respuesta inicial recibida:', response);
        const welcomeMessage = response.response;
        const dbName = response.db_name;
        
        const initialMessage = {
          role: 'assistant', 
          content: welcomeMessage + "\n\nPuedes preguntarme sobre la estructura de la base de datos, hacer consultas o pedir ayuda para analizar los datos. ¿En qué te puedo ayudar hoy?"
        };
        
        this.messages.push(initialMessage);
        this.saveMessagesToLocalStorage();
      },
      error: (error) => {
        console.error('Error al inicializar el chat:', error);
        this.messages.push({role: 'assistant', content: 'Lo siento, hubo un error al inicializar el chat. Por favor, intenta recargar la página.'});
        this.saveMessagesToLocalStorage();
      }
    });
  }
  

  

  sendMessage() {
    if (this.newMessage.trim()) {
      const userMessage = {role: 'user', content: this.newMessage};
      this.messages.push(userMessage);
      
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.getToken()}`
      });
  
      this.http.post('/api/chat_view/', { 
        prompt: this.newMessage,
        databaseId: this.databaseId
      }, { headers }).subscribe({
        next: (response: any) => {
          console.log('Respuesta recibida:', response);
          let assistantMessage: any;
  
          if (response.needs_confirmation) {
            this.dangerousQuery = response.suggested_query;
            assistantMessage = {
              role: 'assistant',
              content: response.response + '\n\n' + response.warning,
              sqlResult: this.createConfirmationButton()
            };
          } else if (response.show_only_table && response.sql_result) {
            const tableHtml = this.createTable(response.sql_result);
            assistantMessage = {
              role: 'assistant',
              content: response.response || '',
              sqlResult: this.sanitizer.bypassSecurityTrustHtml(tableHtml)
            };
          } else {
            assistantMessage = {
              role: 'assistant',
              content: response.response,
              sqlResult: response.sql_result ? this.sanitizer.bypassSecurityTrustHtml(this.createTable(response.sql_result)) : undefined
            };
          }
  
          this.messages.push(assistantMessage);
          this.newMessage = '';
          this.saveMessagesToLocalStorage();
        },
        error: (error) => {
          console.error('Error en la solicitud:', error);
          const errorMessage = {
            role: 'assistant', 
            content: 'Lo siento, hubo un error al procesar tu solicitud.'
          };
          this.messages.push(errorMessage);
          this.saveMessagesToLocalStorage();
        }
      });
    }
  }
  
  
  // Método opcional para guardar mensajes en el almacenamiento local
  private saveMessagesToLocalStorage() {
    const messagesToSave = this.messages.map(message => ({
      ...message,
      sqlResult: message.sqlResult ? (message.sqlResult as any).changingThisBreaksApplicationSecurity : undefined
    }));
    localStorage.setItem(`chat_messages_${this.databaseId}`, JSON.stringify(messagesToSave));
  }
  
  

  visualizeData(data: any, type: string = 'auto') {
    if (typeof data === 'string') {
      return; // Si es un mensaje de éxito, no hacemos nada
    }

    if (type === 'auto') {
      type = this.determineVisualizationType(data);
    }

    if (type === 'table') {
      this.createTable(data);
    } else if (type === 'bar') {
      this.createBarChart(data);
    }
  }

  determineVisualizationType(data: any): string {
    if (data.columns && data.columns.length === 2 && data.rows && data.rows.every((row: any) => !isNaN(row[data.columns[1]]))) {
      return 'bar';
    }
    return 'table';
  }

  createTable(data: any): string {
    if (!data || !data.columns || !data.rows) {
      return '<p>No hay datos para mostrar.</p>';
    }
  
    let html = '<div class="custom-table-responsive"><div class="custom-table-container"><table class="custom-table">';
    html += '<thead><tr>';
    data.columns.forEach((column: string) => {
      html += `<th>${column}</th>`;
    });
    html += '</tr></thead><tbody>';
    data.rows.forEach((row: any) => {
      html += '<tr>';
      data.columns.forEach((column: string) => {
        html += `<td>${row[column]}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';
    
    return html;
  }
  
  
  
  
  createConfirmationButton(): SafeHtml {
    const html = `
      <div class="confirmation-button">
        <button onclick="document.dispatchEvent(new CustomEvent('executeDangerousQuery'))">Ejecutar consulta peligrosa</button>
      </div>
    `;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  

  executeDangerousQuery() {
    if (this.dangerousQuery) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.getToken()}`
      });
  
      this.http.post('/api/execute_dangerous_query/', {
        query: this.dangerousQuery,
        databaseId: this.databaseId
      }, { headers }).subscribe({
        next: (response: any) => {
          console.log('Respuesta de consulta peligrosa:', response);
          let content: string;
          let sqlResult: SafeHtml | undefined;
  
          if (response.result.message) {
            content = response.result.message;
            if (response.result.table_content) {
              sqlResult = this.createTable(response.result.table_content);
            }
          } else {
            content = 'Consulta peligrosa ejecutada con éxito.';
            sqlResult = this.createTable(response.result);
          }
  
          this.messages.push({
            role: 'assistant',
            content: content,
            sqlResult: sqlResult
          });
          this.dangerousQuery = null;
        },
        error: (error) => {
          console.error('Error al ejecutar la consulta peligrosa:', error);
          this.messages.push({
            role: 'assistant',
            content: 'Error al ejecutar la consulta peligrosa: ' + (error.error.error || error.message)
          });
        }
      });
    }
  }
  
  
  

  createBarChart(data: any) {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto del canvas');
      return;
    }

    const labels = data.rows.map((row: any) => row[data.columns[0]]);
    const values = data.rows.map((row: any) => row[data.columns[1]]);

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: labels,
        datasets: [{
          label: data.columns[1],
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
    
    // Asegurarse de que el canvas es visible
    this.chartCanvas.nativeElement.style.display = 'block';
    
    // Actualizar el último mensaje con una referencia al gráfico
    this.messages[this.messages.length - 1].sqlResult = 'chart';
  }

  clearChat() {
    if (confirm('¿Estás seguro de que quieres borrar todo el historial del chat?')) {
      this.messages = [];
      localStorage.removeItem(`chat_messages_${this.databaseId}`);
      this.initializeChat(); // Reinicia el chat con el mensaje de bienvenida
    }
  }
  

  loadChatHistory() {
    if (this.messages.length > 0) return; // Si ya hay mensajes, no los sobrescribas
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  
    this.http.get(`/api/chat_view/?databaseId=${this.databaseId}`, { headers }).subscribe({
      next: (response: any) => {
        this.messages = response.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          sqlResult: msg.sql_result ? this.createTable(msg.sql_result) : undefined
        }));
        if (this.messages.length === 0) {
          this.initializeChat();
        }
      },
      error: (error) => {
        console.error('Error al cargar el historial del chat:', error);
        if (this.messages.length === 0) {
          this.initializeChat();
        }
      }
    });
  }
  
  

}
