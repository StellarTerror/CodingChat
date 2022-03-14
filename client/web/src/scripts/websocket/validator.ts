import { editor, IPosition, IRange } from 'monaco-editor';
import { FullText, InboundMessage } from './types';

export const inboundMessageValidator = (data: unknown): data is InboundMessage => {
  if (data == null) return false;
  const obj = data as Record<string, unknown>;
  return (
    false ||
    obj.type === 'disconnect' ||
    (obj.type === 'connect' && isString(obj.data)) ||
    (obj.type === 'chat' && isString(obj.data)) ||
    (obj.type === 'edit' && editChangesValidator(obj.data)) ||
    (obj.type === 'cursormove' && positionValidator(obj.data)) ||
    (obj.type === 'selection' && rangeValidator(obj.data))
  );
};

const isNumber = (v: unknown): v is number => 'number' === typeof v;
const isString = (v: unknown): v is string => 'string' === typeof v;

const positionValidator = (data: unknown): data is IPosition => {
  if (data == null) return false;
  const obj = data as Record<string, unknown>;
  return isNumber(obj.lineNumber) && isNumber(obj.column);
};

const rangeValidator = (data: unknown): data is IRange => {
  if (data == null) return false;
  const obj = data as Record<string, unknown>;
  return (
    true &&
    isNumber(obj.startLineNumber) &&
    isNumber(obj.endLineNumber) &&
    isNumber(obj.startColumn) &&
    isNumber(obj.endColumn)
  );
};

const editChangesValidator = (
  data: unknown
): data is {
  changes: editor.IModelContentChange[];
  timestamp: number;
  full_text: FullText;
} => {
  if (data == null) return false;
  const obj = data as Record<string, unknown>;
  return (
    true &&
    isNumber(obj.timestamp) &&
    isString(obj.full_text) &&
    obj.changes instanceof Array &&
    obj.changes.every(modelContentChangeValidator)
  );
};

const modelContentChangeValidator = (data: unknown): data is editor.IModelContentChange => {
  if (data == null) return false;
  const obj = data as Record<string, unknown>;
  return (
    true && rangeValidator(obj.range) && isNumber(obj.rangeOffset) && isNumber(obj.rangeLength) && isString(obj.text)
  );
};
