
import { Loader2 } from "lucide-react";

interface PageHeaderProps {
  title: string;
  totalProducts: number;
  filteredCount: number;
  isRefetching: boolean;
}

export const PageHeader = ({ title, totalProducts, filteredCount, isRefetching }: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold animate-fadeIn">{title}</h1>
      </div>
      {isRefetching && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Refreshing...
        </div>
      )}
    </div>
  );
};
