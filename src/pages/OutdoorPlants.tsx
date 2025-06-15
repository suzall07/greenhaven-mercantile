
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { getProducts } from "@/lib/supabase/products";
import { LoadingState } from "@/components/plants/LoadingState";
import { ErrorState } from "@/components/plants/ErrorState";
import { EmptyState } from "@/components/plants/EmptyState";
import { ProductGrid } from "@/components/plants/ProductGrid";
import { PageHeader } from "@/components/plants/PageHeader";
import { PageFooter } from "@/components/plants/PageFooter";

const OutdoorPlants = () => {
  const { data: products = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    retry: 2,
    retryDelay: 1000,
  });

  console.log('All products in OutdoorPlants:', products);

  const outdoorPlants = products.filter(product => {
    if (!product || !product.category) {
      return false;
    }
    const category = product.category.toLowerCase().trim();
    
    const isOutdoor = category.includes('outdoor') || 
                     category.includes('garden') || 
                     category.includes('exterior') ||
                     category.includes('outside') ||
                     category.includes('yard') ||
                     category.includes('patio') ||
                     category.includes('landscaping');
    
    return isOutdoor;
  });

  console.log('Filtered outdoor plants:', outdoorPlants);

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
          title="Outdoor Plants"
          totalProducts={products.length}
          filteredCount={outdoorPlants.length}
          isRefetching={isRefetching}
        />
        
        {outdoorPlants.length > 0 ? (
          <ProductGrid products={outdoorPlants} />
        ) : (
          <EmptyState totalProducts={products.length} plantType="outdoor" />
        )}
      </div>

      <PageFooter />
    </div>
  );
};

export default OutdoorPlants;
