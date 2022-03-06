import { getRandomColor } from './utils';

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
    if (!this.roomMates.has(uid)) {
      this.roomMates.set(uid, name);
      this.reflect();
    }
  }
  left(uid: string) {
    return this.roomMates.delete(uid);
  }

  private getStyles() {
    const csss: string[] = [
      `
.${selectionSuffix} {
  opacity: .5;
  position: relative;
  margin-inline: 2px;
  z-index: 2;
}
.${cursorSuffix} {
  width: 2px !important;
  position: relative;
  z-index: 2;
}
.${cursorSuffix}::after, .${selectionSuffix}::after {
  position: relative;
  top: -5px;
  right: -5px;

  font-size: calc(1em - 4px);
  pointer-events: none;
  white-space: nowrap;
  padding: 1px;
  z-index: 3;
  color: white;
}
`,
    ];
    for (const uid of this.roomMates.keys()) {
      const color = getRandomColor(uid);
      csss.push(`
.${cursorSuffix}.${suffix}-${uid}:hover::after {
  content: "${this.roomMates.get(uid)!}";
  background-color: ${color};
}
.${suffix}-${uid}-bg {
  background-color: ${color};
}
.${suffix}-${uid}-color {
  color: ${color};
}
`);
    }
    return csss.join('');
  }

  reflect() {
    requestIdleCallback(() => {
      this.styleElement.innerHTML = this.getStyles();
    });
  }
}

export const suffix = '__codingchat';
export const cursorSuffix = suffix + '-cursor';
export const selectionSuffix = suffix + '-selection';
