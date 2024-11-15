/* 
    Utility functions to Convert string to ObjectId and ObjectId to string
*/

import { Types } from 'mongoose';

export function toObjectId(id: string | Types.ObjectId): Types.ObjectId {
  return typeof id === 'string' ? new Types.ObjectId(id) : id;
}

export function toStringId(id: string | Types.ObjectId): string {
    return id.toString();
}