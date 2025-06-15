
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
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  console.log('🏠 IndoorPlants - All products:', products);
  console.log('📊 Products length:', products.length);
  console.log('🔄 Loading state:', { isLoading, isRefetching });
  console.log('❌ Error state:', error);

  // Enhanced indoor plants filtering
  const indoorPlants = products.filter(product => {
    if (!product || !product.category) {
      console.log('⚠️ Product missing category:', product);
      return false;
    }
    
    const category = product.category.toLowerCase().trim();
    console.log('🔍 Checking category for indoor:', category);
    
    // Check for indoor keywords
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
                    // If no outdoor indicators, consider it indoor
                    (!category.includes('outdoor') && 
                     !category.includes('garden') && 
                     !category.includes('yard') &&
                     !category.includes('patio') &&
                     !category.includes('landscaping'));
    
    console.log('✅ Is indoor plant?', isIndoor, 'for category:', category);
    return isIndoor;
  });

  console.log('🏠 Filtered indoor plants:', indoorPlants);
  console.log('📋 Indoor plants count:', indoorPlants.length);

  const handleRetry = () => {
    console.log('🔄 Retrying product fetch...');
    refetch();
  };

  if (isLoading) {
    console.log('⏳ Showing loading state');
    return <LoadingState />;
  }

  if (error) {
    console.error('❌ Error loading products:', error);
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
