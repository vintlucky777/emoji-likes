import _ from 'lodash';
import emoji_kw from 'emoji-keywords';

const uuid_mask = '00000000-0000-0000-0000-000000000000';

export const isUUID = (str) => str && str.length === 36 && str.replace(/[0-9A-Fa-f]/g, '0') === uuid_mask;
export const isEmoji = (key) => typeof(key) === 'string' && key.length < 64 && _.includes(emoji_kw, key);
