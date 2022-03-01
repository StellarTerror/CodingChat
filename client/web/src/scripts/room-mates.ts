export class Room {
  private roomMates: Map<string, string>;
  private styleElement: HTMLStyleElement;

  constructor() {
    this.roomMates = new Map();
    this.styleElement = document.createElement('style');
    document.head.append(this.styleElement);
  }

  dispose() {
    document.head.removeChild(this.styleElement);
  }

  joined(uid: string, name: string) {
    this.roomMates.set(uid, name);
    this.reflect();
  }
  left(uid: string) {
    return this.roomMates.delete(uid);
  }

  private getStyles() {
    const csss: string[] = [];
    for (const uid of this.roomMates.keys()) {
      csss.push(`.${cursorSuffix}-${uid}, .${selectionSuffix}-${uid} {}`);
    }
    return csss.join('\n');
  }

  reflect() {
    this.styleElement.innerText = this.getStyles();
  }
}

export const cursorSuffix = '__codingchat-cursor';
export const selectionSuffix = '__codingchat-selection';
