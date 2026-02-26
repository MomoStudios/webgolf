export class HUD {
  private strokeCountEl: HTMLElement;
  private messageEl: HTMLElement;
  private messageTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.strokeCountEl = document.getElementById('stroke-count')!;
    this.messageEl = document.getElementById('message')!;
  }

  public updateStrokeCount(count: number): void {
    this.strokeCountEl.textContent = count.toString();
  }

  public showMessage(text: string, duration = 3000): void {
    if (this.messageTimer !== null) clearTimeout(this.messageTimer);
    this.messageEl.textContent = text;
    this.messageEl.classList.add('show');
    this.messageTimer = setTimeout(() => this.hideMessage(), duration);
  }

  public hideMessage(): void {
    this.messageEl.classList.remove('show');
    this.messageTimer = null;
  }
}
