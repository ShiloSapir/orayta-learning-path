import { useState, useMemo } from "react";

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
}

export function usePagination({ 
  totalItems, 
  itemsPerPage, 
  initialPage = 1 
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    
    return {
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages,
    };
  }, [totalItems, itemsPerPage, currentPage]);

  const goToPage = (page: number) => {
    const clampedPage = Math.max(1, Math.min(page, paginationData.totalPages));
    setCurrentPage(clampedPage);
  };

  const goToNextPage = () => {
    if (paginationData.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (paginationData.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const getPageData = <T,>(items: T[]): T[] => {
    return items.slice(paginationData.startIndex, paginationData.endIndex);
  };

  return {
    currentPage,
    ...paginationData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    getPageData,
  };
}