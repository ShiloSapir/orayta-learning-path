import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import { Language } from "./LanguageToggle";
import { Source } from "@/hooks/useSupabaseData";

interface AdvancedSearchProps {
  sources: Source[];
  onFilteredResults: (filteredSources: Source[]) => void;
  language: Language;
}

export const AdvancedSearch = ({ sources, onFilteredResults, language }: AdvancedSearchProps) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredSources = useMemo(() => {
    let filtered = sources;

    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(source => {
        const title = language === 'he' ? source.title_he : source.title;
        return title.toLowerCase().includes(searchTerm) ||
               source.category.toLowerCase().includes(searchTerm);
      });
    }

    if (category) {
      filtered = filtered.filter(source => source.category === category);
    }

    return filtered;
  }, [sources, query, category, language]);

  useMemo(() => {
    onFilteredResults(filteredSources);
  }, [filteredSources, onFilteredResults]);

  return (
    <Card className="learning-card space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search sources..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Filters
      </Button>

      {showFilters && (
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="halacha">Halacha</SelectItem>
            <SelectItem value="rambam">Rambam</SelectItem>
            <SelectItem value="tanakh">Tanakh</SelectItem>
            <SelectItem value="talmud">Talmud</SelectItem>
            <SelectItem value="spiritual">Spiritual</SelectItem>
          </SelectContent>
        </Select>
      )}

      <div className="text-sm text-muted-foreground">
        {filteredSources.length} results found
      </div>
    </Card>
  );
};