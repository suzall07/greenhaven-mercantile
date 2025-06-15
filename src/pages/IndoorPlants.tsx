
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { getProducts } from "@/lib/supabase/products";
import { LoadingState } from "@/components/plants/LoadingState";
import { ErrorState } from "@/components/plants/ErrorState";
import { EmptyState } from "@/components/plants/EmptyState";
import { ProductGrid } from "@/components/plants/ProductGrid";
import { PageHeader } from "@/components/plants/PageHeader";
import { PageFooter } from "@/components/plants/PageFooter";

const IndoorPlants = () => {
  const { data: products = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  console.log('All products in IndoorPlants:', products);
  console.log('Products length:', products.length);

  // Enhanced indoor plants filtering with more comprehensive category matching
  const indoorPlants = products.filter(product => {
    if (!product || !product.category) {
      console.log('Product missing category:', product);
      return false;
    }
    const category = product.category.toLowerCase().trim();
    console.log('Checking category for indoor:', category);
    
    // More comprehensive indoor plant category matching
    const isIndoor = category.includes('indoor') || 
                    category.includes('house') || 
                    category.includes('interior') ||
                    category.includes('inside') ||
                    category.includes('room') ||
                    category.includes('home') ||
                    category.includes('desk') ||
                    category.includes('office') ||
                    category.includes('apartment') ||
                    category.includes('low light') ||
                    category.includes('air purifying') ||
                    // If no specific outdoor indicators, consider it indoor by default
                    (!category.includes('outdoor') && 
                     !category.includes('garden') && 
                     !category.includes('yard') &&
                     !category.includes('patio') &&
                     !category.includes('landscaping'));
    
    console.log('Is indoor plant?', isIndoor, 'for category:', category);
    return isIndoor;
  });

  console.log('Filtered indoor plants:', indoorPlants);

  const handleRetry = () => {
    console.log('Retrying product fetch...');
    refetch();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    console.error('Error loading products:', error);
    return <ErrorState error={error} onRetry={handleRetry} isRefetching={isRefetching} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 flex-grow">
        <PageHeader 
          title="Indoor Plants"
          totalProducts={products.length}
          filteredCount={indoorPlants.length}
          isRefetching={isRefetching}
        />
        
        {indoorPlants.length > 0 ? (
          <ProductGrid products={indoorPlants} />
        ) : (
          <EmptyState totalProducts={products.length} plantType="indoor" />
        )}
      </div>

      <PageFooter />
    </div>
  );
};

export default IndoorPlants;
