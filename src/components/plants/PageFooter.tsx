
export const PageFooter = () => {
  return (
    <footer className="py-6 px-4 bg-secondary/10 mt-12">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Plant&deco. All rights reserved.</p>
      </div>
    </footer>
  );
};
