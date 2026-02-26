export class UIManager {
  private strokeCountElement: HTMLElement;
  private messageElement: HTMLElement;

  constructor() {
    this.strokeCountElement = document.getElementById('stroke-count')!;
    this.messageElement = document.getElementById('message')!;
  }

  public updateStrokeCount(count: number): void {
    this.strokeCountElement.textContent = count.toString();
  }

  public showMessage(message: string, duration: number = 3000): void {
    this.messageElement.textContent = message;
    this.messageElement.classList.add('show');
    
    setTimeout(() => {
      this.hideMessage();
    }, duration);
  }

  public hideMessage(): void {
    this.messageElement.classList.remove('show');
  }
}