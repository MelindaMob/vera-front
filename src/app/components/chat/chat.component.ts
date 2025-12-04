import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VeraChatService, Message } from '../../services/vera-chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  messages: Message[] = [];
  messageInput: string = '';
  isLoading: boolean = false;
  private shouldScroll: boolean = false;

  constructor(private veraChatService: VeraChatService) {}

  ngOnInit() {
    this.veraChatService.messages$.subscribe(messages => {
      this.messages = messages;
      this.shouldScroll = true;
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage() {
    if (!this.messageInput.trim() || this.isLoading) return;

    const message = this.messageInput.trim();
    this.messageInput = '';
    this.isLoading = true;

    this.veraChatService.sendMessage(message).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isLoading = false;
      }
    });
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat() {
    this.veraChatService.clearMessages();
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) {
      console.error('Scroll error:', err);
    }
  }

  getStatusClass(status?: string): string {
    switch(status) {
      case 'verified': return 'status-verified';
      case 'false': return 'status-false';
      case 'mixed': return 'status-mixed';
      case 'unverified': return 'status-unverified';
      default: return '';
    }
  }

  getStatusLabel(status?: string): string {
    switch(status) {
      case 'verified': return '✓ Vérifié';
      case 'false': return '✗ Faux';
      case 'mixed': return '~ Mitigé';
      case 'unverified': return '? Non vérifié';
      default: return '';
    }
  }
}
