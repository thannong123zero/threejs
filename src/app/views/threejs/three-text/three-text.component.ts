import { Component, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';

@Component({
  selector: 'app-three-text',
  templateUrl: './three-text.component.html',
  styleUrls: ['./three-text.component.scss']
})
export class ThreeTextComponent implements AfterViewInit {
  @ViewChild('textCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() text: string = 'Hello, Angular!';
  @Input() fontSize: number = 40;
  @Input() fontFamily: string = 'Arial';
  @Input() color: string = 'green';

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Optional: Set canvas size (important!)
    canvas.width = 600;
    canvas.height = 100;

    // Set styles
    context.fillStyle = this.color;
    context.font = `${this.fontSize}px ${this.fontFamily}`;

    // Draw text
    context.fillText(this.text, 10, this.fontSize + 10); // (x, y)
  }
}
