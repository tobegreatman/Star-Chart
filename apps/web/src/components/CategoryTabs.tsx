// 市场分类标签
import { memo } from 'react';
import { CATEGORIES } from '../lib/categories';
import type { Category } from '../lib/types';

interface Props {
  active: Category;
  onChange: (c: Category) => void;
}

function CategoryTabsImpl({ active, onChange }: Props) {
  return (
    <div className="cattabs">
      {CATEGORIES.map((c) => (
        <button
          key={c.key}
          className={active === c.key ? 'active' : ''}
          onClick={() => onChange(c.key)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

export const CategoryTabs = memo(CategoryTabsImpl);
