import { useState, useMemo } from 'react';

interface PaginationOptions {
  itemsPerPage?: number;
}

export function usePagination<T>(items: T[], options: PaginationOptions = {}) {
  const { itemsPerPage = 10 } = options;
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    return {
      currentItems,
      currentPage,
      totalPages,
      totalItems: items.length,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    ...paginationData,
    goToPage,
    nextPage,
    prevPage,
  };
}
