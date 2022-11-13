export interface Category {
  /** ID категории */
  id: number;
  /** Заголовок */
  title: string;
  /** Описание */
  description: string;
  /** Перечень документов */
  items: CategoryItem[];
}

export interface CategoryDocument {
  /** ID документа */
  id: number;
  /** Заголовок */
  title: string;
  /** Описание */
  description: string;
}
