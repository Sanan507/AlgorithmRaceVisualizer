/**
 * Canvas Video Recorder Utility
 * Captures HTML5 canvas streams into high-definition WebM/MP4 video clips
 * using the browser's native MediaRecorder API.
 */

export interface RecorderOptions {
  fps?: number;
  mimeType?: string;
  videoBitsPerSecond?: number;
  fileNamePrefix?: string;
}

export class CanvasVideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private startTime = 0;
  private timerInterval: any = null;

  public onTimeUpdate?: (elapsedSeconds: number) => void;
  public onStateChange?: (recording: boolean) => void;

  /**
   * Starts recording the given canvas element.
   */
  public start(canvas: HTMLCanvasElement, options: RecorderOptions = {}): boolean {
    if (this.isRecording) return false;

    const fps = options.fps ?? 60;
    const stream = canvas.captureStream ? canvas.captureStream(fps) : (canvas as any).mozCaptureStream?.(fps);

    if (!stream) {
      console.warn('Canvas captureStream is not supported in this browser environment.');
      return false;
    }

    // Determine supported mime type
    let mimeType = options.mimeType;
    if (!mimeType) {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        mimeType = 'video/webm;codecs=vp8';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else {
        mimeType = '';
      }
    }

    try {
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(
        stream,
        mimeType
          ? {
              mimeType,
              videoBitsPerSecond: options.videoBitsPerSecond ?? 5_000_000, // 5 Mbps
            }
          : undefined
      );

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.finishDownload(options.fileNamePrefix ?? 'algorace-benchmark');
      };

      this.mediaRecorder.start(100); // 100ms chunk timeslice
      this.isRecording = true;
      this.startTime = Date.now();

      if (this.onStateChange) this.onStateChange(true);

      this.timerInterval = setInterval(() => {
        if (this.onTimeUpdate) {
          const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
          this.onTimeUpdate(elapsed);
        }
      }, 500);

      return true;
    } catch (err) {
      console.error('Failed to initialize MediaRecorder on canvas:', err);
      return false;
    }
  }

  /**
   * Stops recording and triggers file download.
   */
  public stop(): void {
    if (!this.isRecording || !this.mediaRecorder) return;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.isRecording = false;
    if (this.onStateChange) this.onStateChange(false);

    if (this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  /**
   * Checks if recording is active.
   */
  public getIsRecording(): boolean {
    return this.isRecording;
  }

  private finishDownload(prefix: string): void {
    if (this.recordedChunks.length === 0) return;

    const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const blob = new Blob(this.recordedChunks, { type: mimeType });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `${prefix}-${dateStr}.${extension}`;

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.recordedChunks = [];
    }, 1000);
  }
}
