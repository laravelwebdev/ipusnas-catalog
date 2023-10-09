export interface Book {
  id: number;
  title: string;
  isbn: string;
  description: string;
  authors: string;
  publisher_name: string;

  publisher_id: number;
  category_id: number;

  cover?: string;
  cover_origin?: string;
  coverLoaded?: boolean;
  coverNonExists?: boolean;
  available_copy: number;

  price: number;
  size?: string;
  extension?: string;
  has_book?: boolean;

  published_date: string;
  formatted_date?: string;
  created: Date;
  modified: Date;
}

export interface Item {
  id: number;
  user_id: number;
  out: string;
  key: string;
  library_id: string;
  pass: string;
  pass_zip: string;
  pass_pdf: string;
  md5_checksum: string;
  security_version: number;
  end: Date;
}

export interface BookStatistic {
  total_reviews: number;
  total_comments: number;
  total_ratings: number;
  total_reading: number;
  total_has_read: number;
  total_has_borrow: number;
  total_wishlists: number;
  total_queues: number;
  has_queue: number;
  rating: string;
}

export interface BookCategory {
  id: number;
  type_id: number;
  name: string;
}

export interface BookPublisher {
  id: number;
  name: string;
  website: string;
  logo: string;
}

export interface BookLibary {
  Library: LibaryItem;
  Config: LibaryConfig;
}

export interface LibaryItem {
  id: number;
  name: string;
  code: string;
  logo: string;
  available_copy: number;
}

export interface LibaryConfig {
  'Library.isFree': string;
  'Library.MaxDaysBorrow': string;
  'Library.MaxItemsBorrow': string;
  'Library.MaxItemsBorrowPerDay': string;
  'Library.MembershipPeriod': string;
}

export interface BookItem {
  Book: Book;
  Item: Item;
  Statistic: BookStatistic;
  Category: BookCategory;
  Publisher: BookPublisher;
  Library: BookLibary[];
}

export interface HasBookItem {
  out: string;
  pass: string;
  has_book: boolean;
  security_version: number;
  library_id: number;
  key: number;
  passZip: string;
  passPdf: string;
}
