export enum CurrentUserActionType {
  USER = 'user',
  BOOKS = 'books',
}

export enum S3ActionType {
  E_BOOK = 'epub',
  COVER_ART = 'coverArt',
  PLAIN_TEXT = 'plainText',
}

export enum UtilActionType {
  PARSE_AUTHOR = 'parseAuthor',
  ALTER_SEED = 'alterSeed',
  IS_EXPLICIT = 'isExplicit',
}
